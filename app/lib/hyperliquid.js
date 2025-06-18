import WebSocket from 'ws';
import Trade from './models/Trade.js';

export class HyperliquidClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔗 Connecting to Hyperliquid WebSocket...');
        this.ws = new WebSocket(process.env.HYPERLIQUID_WS_URL);

        this.ws.on('open', () => {
          console.log('✅ Connected to Hyperliquid WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Subscribe to HYPE token trades
          this.subscribeToHypeTradesPartial();
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        });

        this.ws.on('close', () => {
          console.log('🔌 WebSocket connection closed');
          this.isConnected = false;
          this.handleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToHypeTradesPartial() {
    // Subscribe to all trades - we'll filter for HYPE on our end
    const subscription = {
      method: 'subscribe',
      subscription: {
        type: 'allMids'
      }
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(subscription));
      console.log('📡 Subscribed to trade data');
    }
  }

  async handleMessage(message) {
    try {
      // Handle different message types from Hyperliquid
      if (message.channel === 'trades' && message.data) {
        const trades = Array.isArray(message.data) ? message.data : [message.data];
        
        for (const trade of trades) {
          if (trade.coin === 'HYPE' || trade.symbol === 'HYPE') {
            await this.processTrade(trade);
          }
        }
      } else if (message.channel === 'fills' && message.data) {
        // Handle fills data
        const fills = Array.isArray(message.data) ? message.data : [message.data];
        
        for (const fill of fills) {
          if (fill.coin === 'HYPE' || fill.symbol === 'HYPE') {
            await this.processFill(fill);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }

  async processTrade(tradeData) {
    try {
      // Transform trade data to our format
      const trade = {
        tradeId: `${tradeData.tid || tradeData.time || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        token: 'HYPE',
        side: tradeData.side?.toUpperCase() || (tradeData.dir === 'Buy' ? 'BUY' : 'SELL'),
        size: parseFloat(tradeData.sz || tradeData.size || 0),
        price: parseFloat(tradeData.px || tradeData.price || 0),
        sizeUsd: 0, // Will calculate below
        walletAddress: tradeData.user || tradeData.maker || tradeData.address || 'unknown',
        timestamp: new Date(tradeData.time || Date.now()),
        blockHeight: tradeData.blockHeight,
        txHash: tradeData.hash || tradeData.tx
      };

      trade.sizeUsd = trade.size * trade.price;

      // Only process significant trades (> $100)
      if (trade.sizeUsd >= 100) {
        await this.saveTrade(trade);
      }
    } catch (error) {
      console.error('❌ Error processing trade:', error);
    }
  }

  async processFill(fillData) {
    try {
      // Similar to processTrade but for fill data
      const trade = {
        tradeId: `fill-${fillData.tid || fillData.time || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        token: 'HYPE',
        side: fillData.side?.toUpperCase() || (fillData.dir === 'Buy' ? 'BUY' : 'SELL'),
        size: parseFloat(fillData.sz || fillData.size || 0),
        price: parseFloat(fillData.px || fillData.price || 0),
        sizeUsd: 0,
        walletAddress: fillData.user || fillData.address || 'unknown',
        timestamp: new Date(fillData.time || Date.now()),
        blockHeight: fillData.blockHeight,
        txHash: fillData.hash || fillData.tx
      };

      trade.sizeUsd = trade.size * trade.price;

      if (trade.sizeUsd >= 100) {
        await this.saveTrade(trade);
      }
    } catch (error) {
      console.error('❌ Error processing fill:', error);
    }
  }

  async saveTrade(tradeData) {
    try {
      // Check if trade already exists
      const existingTrade = await Trade.findOne({ tradeId: tradeData.tradeId });
      if (existingTrade) {
        return;
      }

      // Save new trade
      const trade = new Trade(tradeData);
      await trade.save();

      console.log(`💰 New ${tradeData.side} trade saved: $${tradeData.sizeUsd.toFixed(2)} | ${tradeData.size} HYPE @ $${tradeData.price.toFixed(4)}`);

      // Send notification
      await this.sendTelegramNotification(trade);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - ignore
        return;
      }
      console.error('❌ Error saving trade:', error);
    }
  }

  async sendTelegramNotification(trade) {
    try {
      if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
        console.log('⚠️ Telegram credentials not configured');
        return;
      }

      const message = this.formatTradeMessage(trade);
      
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      if (response.ok) {
        // Mark notification as sent
        await Trade.findByIdAndUpdate(trade._id, { notificationSent: true });
        console.log('📱 Telegram notification sent successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send Telegram notification:', errorText);
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  }

  formatTradeMessage(trade) {
    const timeStr = trade.timestamp.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const sideEmoji = trade.side === 'BUY' ? '🟢' : '🔴';
    const shortAddress = trade.walletAddress.length > 10 
      ? `${trade.walletAddress.slice(0, 6)}...${trade.walletAddress.slice(-4)}`
      : trade.walletAddress;

    return `${sideEmoji} <b>HYPE ${trade.side}</b>

💰 <b>Size:</b> $${trade.sizeUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
📊 <b>Amount:</b> ${trade.size.toLocaleString('en-US', { maximumFractionDigits: 4 })} HYPE
💲 <b>Price:</b> $${trade.price.toFixed(4)}
👤 <b>Wallet:</b> <code>${shortAddress}</code>
⏰ <b>Time:</b> ${timeStr} UTC

🔗 <a href="https://app.hyperliquid.xyz/explorer">View on Explorer</a>`;
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      wsReadyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  disconnect() {
    if (this.ws) {
      this.isConnected = false;
      this.ws.close();
    }
  }
}
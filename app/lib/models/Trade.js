import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tradeId: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true,
    default: 'HYPE'
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sizeUsd: {
    type: Number,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  blockHeight: {
    type: Number
  },
  txHash: {
    type: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
tradeSchema.index({ timestamp: -1 });
tradeSchema.index({ walletAddress: 1 });
tradeSchema.index({ notificationSent: 1 });

export default mongoose.models.Trade || mongoose.model('Trade', tradeSchema);
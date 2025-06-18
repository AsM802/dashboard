import { NextResponse } from 'next/server';
import { HyperliquidClient } from '../../../../lib/hyperliquid.js';
import dbConnect from '../../../../lib/dbConnect.js';
import mongoose from 'mongoose';

// Global monitor instance
let monitorClient = null;
let isMonitoring = false;

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === 'start') {
      if (isMonitoring) {
        return NextResponse.json({ 
          success: true, 
          message: 'Monitor is already running',
          status: getStatus()
        });
      }

      // Connect to database
      await dbConnect();

      // Create and start monitor
      monitorClient = new HyperliquidClient();
      await monitorClient.connect();
      isMonitoring = true;

      return NextResponse.json({ 
        success: true, 
        message: 'Trade monitor started successfully',
        status: getStatus()
      });

    } else if (action === 'stop') {
      if (monitorClient) {
        monitorClient.disconnect();
        monitorClient = null;
      }
      isMonitoring = false;

      return NextResponse.json({ 
        success: true, 
        message: 'Trade monitor stopped'
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "start" or "stop"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Monitor API error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(getStatus());
}

function getStatus() {
  return {
    isRunning: isMonitoring,
    wsConnected: monitorClient?.getStatus().isConnected || false,
    mongoConnected: mongoose.connection.readyState === 1,
    reconnectAttempts: monitorClient?.getStatus().reconnectAttempts || 0
  };
}
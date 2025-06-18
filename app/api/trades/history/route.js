import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect.js';
import Trade from '../../../../lib/models/Trade.js';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const side = searchParams.get('side');
    const minSize = searchParams.get('minSize');
    const walletAddress = searchParams.get('walletAddress');

    // Build query
    const query = { token: 'HYPE' };
    
    if (side) {
      query.side = side.toUpperCase();
    }
    
    if (minSize) {
      query.sizeUsd = { $gte: parseFloat(minSize) };
    }
    
    if (walletAddress) {
      query.walletAddress = { $regex: walletAddress, $options: 'i' };
    }

    // Execute query
    const trades = await Trade.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Trade.countDocuments(query);

    return NextResponse.json({
      trades,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
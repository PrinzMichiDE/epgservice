import { NextResponse } from 'next/server';
import { getAllChannels, getAllPrograms } from '@/services/dbService';

export const runtime = 'nodejs';

export async function GET() {
  const channels = await getAllChannels();
  const programs = await getAllPrograms();
  return NextResponse.json({ channels, programs });
} 
import { NextResponse } from 'next/server';
import { epgService } from '@/services/epgService';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await epgService.getEPGData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fehler beim Abrufen der EPG-Daten:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
} 
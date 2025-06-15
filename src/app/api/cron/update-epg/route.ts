import { NextResponse } from 'next/server';
import { epgService } from '@/services/epgService';
import { VercelCronJob } from '@vercel/cron';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  try {
    console.log('Starte EPG-Datenaktualisierung...');
    await epgService.updateEPGData();
    console.log('EPG-Datenaktualisierung abgeschlossen');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler bei der EPG-Datenaktualisierung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der EPG-Daten' },
      { status: 500 }
    );
  }
}

// Vercel Cron-Konfiguration - Aktualisierung alle 4 Stunden
export const cron = new VercelCronJob({
  pattern: '0 */4 * * *',
  handler,
}); 
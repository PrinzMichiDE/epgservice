import { NextResponse } from 'next/server';
import { epgService } from '@/services/epgService';

export const runtime = 'nodejs';

// Prüfe, ob der Request von einem autorisierten Cron-Service kommt
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  try {
    // Prüfe die Autorisierung
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starte EPG-Update via Cron...');
    await epgService.updateEPGData();
    console.log('EPG-Update erfolgreich abgeschlossen');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim EPG-Update:', error);
    return NextResponse.json({ error: 'Fehler beim EPG-Update' }, { status: 500 });
  }
} 
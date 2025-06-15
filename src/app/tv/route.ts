import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Lade die M3U-Datei aus dem public-Verzeichnis
    const filePath = path.join(process.cwd(), 'public', 'iptv', 'IPTV-Germany.m3u');
    
    // Prüfe ob die Datei existiert
    try {
      await fs.access(filePath);
    } catch {
      console.error('IPTV-Playlist nicht gefunden:', filePath);
      return new NextResponse('Playlist nicht gefunden', { status: 404 });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Setze die korrekten Header für M3U-Dateien
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/x-mpegURL',
        'Content-Disposition': 'attachment; filename="IPTV-Germany.m3u"',
        'Cache-Control': 'public, max-age=3600', // Cache für 1 Stunde
        'Access-Control-Allow-Origin': '*', // Erlaube CORS
      },
    });
  } catch (error) {
    console.error('Fehler beim Laden der IPTV-Playlist:', error);
    return new NextResponse('Interner Serverfehler', { status: 500 });
  }
} 
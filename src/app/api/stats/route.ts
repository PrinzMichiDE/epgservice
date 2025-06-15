import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const STATS_FILE = path.join(process.cwd(), 'data', 'stats.json');

// Stelle sicher, dass die stats.json existiert
if (!fs.existsSync(STATS_FILE)) {
  const initialStats = {
    visitors: 0,
    downloads: {
      xmltv: 0,
      rytec: 0
    }
  };
  fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
}

export async function GET() {
  try {
    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Fehler beim Lesen der Statistiken:', error);
    return NextResponse.json({ error: 'Fehler beim Lesen der Statistiken' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));

    if (type === 'visitor') {
      stats.visitors++;
    } else if (type === 'download_xmltv') {
      stats.downloads.xmltv++;
    } else if (type === 'download_rytec') {
      stats.downloads.rytec++;
    }

    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Statistiken:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Statistiken' }, { status: 500 });
  }
} 
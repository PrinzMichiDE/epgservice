import { NextResponse } from 'next/server';
import { getAllChannels, getAllPrograms } from '@/services/dbService';
import type { Channel, Program } from '@/types/epg';

// Automatisches Mapping: "DE: Das Erste" → "DasErste.de"
function autoRytecId(id: string): string {
  // Beispiel-Mapping, ggf. erweitern
  if (id.startsWith('DE: ')) {
    return id.replace('DE: ', '').replace(/\s+/g, '').replace(/\W/g, '') + '.de';
  }
  return id;
}

export const runtime = 'nodejs';

export async function GET() {
  const channels: Channel[] = await getAllChannels();
  const programs: Program[] = await getAllPrograms();

  // Beispiel: Mapping anwenden
  const mappedChannels = channels.map((c) => ({ ...c, id: autoRytecId(c.id) }));
  const mappedPrograms = programs.map((p) => ({ ...p, channel: autoRytecId(p.channel) }));

  // Generiere XMLTV (oder JSON, je nach Bedarf)
  return NextResponse.json({ channels: mappedChannels, programs: mappedPrograms });
} 
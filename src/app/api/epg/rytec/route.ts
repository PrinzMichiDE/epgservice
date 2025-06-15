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

  // Generiere Rytec-XMLTV
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE tv SYSTEM "xmltv.dtd">',
    `<tv generator-info-name="Rytec XMLTV" source-info-name="xmltv.info">`,
    ...mappedChannels.map(
      (c) => `  <channel id="${c.id}">\n    <display-name lang="de">${c.name}</display-name>${c.icon ? `\n    <icon src=\"${c.icon}\"/>` : ''}\n  </channel>`
    ),
    ...mappedPrograms.map(
      (p) => `  <programme start="${p.start}" stop="${p.stop}" channel="${p.channel}">\n    <title lang="de">${p.title}</title>${p.description ? `\n    <desc lang=\"de\">${p.description}</desc>` : ''}${p.category ? `\n    <category lang=\"de\">${p.category}</category>` : ''}${p.episode ? `\n    <episode-num>${p.episode}</episode-num>` : ''}\n  </programme>`
    ),
    '</tv>'
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="epg-rytec.xml"',
    },
  });
} 
import { NextResponse } from 'next/server';
import { getAllChannels, getAllPrograms } from '@/services/dbService';
import type { Channel, Program } from '@/types/epg';

function escapeXml(unsafe: string | undefined): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
      (c) => `  <channel id="${escapeXml(c.id)}">\n    <display-name lang="de">${escapeXml(c.name)}</display-name>${c.icon ? `\n    <icon src=\"${escapeXml(c.icon)}\"/>` : ''}\n  </channel>`
    ),
    ...mappedPrograms.map(
      (p) => `  <programme start="${escapeXml(p.start)}" stop="${escapeXml(p.stop)}" channel="${escapeXml(p.channel)}">\n    <title lang="de">${escapeXml(p.title)}</title>${p.description ? `\n    <desc lang=\"de\">${escapeXml(p.description)}</desc>` : ''}${p.category ? `\n    <category lang=\"de\">${escapeXml(p.category)}</category>` : ''}${p.episode ? `\n    <episode-num>${escapeXml(p.episode)}</episode-num>` : ''}\n  </programme>`
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
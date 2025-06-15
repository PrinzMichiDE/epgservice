import { NextResponse } from 'next/server';
import { getAllChannels, getAllPrograms, getLastUpdate } from '@/services/dbService';
import { epgService } from '@/services/epgService';
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

export const runtime = 'nodejs';

export async function GET() {
  const now = Date.now();
  const lastUpdate = await getLastUpdate();
  console.log('lastUpdate vor Update:', lastUpdate);

  // Asynchrones Update im Hintergrund, falls nötig
  if (!lastUpdate || now - lastUpdate > 24 * 60 * 60 * 1000) {
    epgService.updateEPGData()
      .then(() => console.log('EPG-Update (async) abgeschlossen'))
      .catch((e) => console.error('Fehler beim asynchronen EPG-Update:', e));
  }

  // Immer aktuelle Daten aus der DB zurückgeben
  const channels: Channel[] = await getAllChannels();
  const programs: Program[] = await getAllPrograms();

  // Generiere XMLTV
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE tv SYSTEM "xmltv.dtd">',
    `<tv generator-info-name="free-epg.de" source-info-name="xmltv.info">`,
    ...channels.map(
      (c) => `  <channel id="${escapeXml(c.id)}">\n    <display-name lang="de">${escapeXml(c.name)}</display-name>${c.icon ? `\n    <icon src=\"${escapeXml(c.icon)}\"/>` : ''}\n  </channel>`
    ),
    ...programs.map(
      (p) => `  <programme start="${escapeXml(p.start)}" stop="${escapeXml(p.stop)}" channel="${escapeXml(p.channel)}">\n    <title lang="de">${escapeXml(p.title)}</title>${p.description ? `\n    <desc lang=\"de\">${escapeXml(p.description)}</desc>` : ''}${p.category ? `\n    <category lang=\"de\">${escapeXml(p.category)}</category>` : ''}${p.episode ? `\n    <episode-num>${escapeXml(p.episode)}</episode-num>` : ''}\n  </programme>`
    ),
    '</tv>'
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="epg.xml"',
    },
  });
} 
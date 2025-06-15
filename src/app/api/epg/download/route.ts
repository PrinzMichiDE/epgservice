import { NextResponse } from 'next/server';
import { getAllChannels, getAllPrograms, getLastUpdate } from '@/services/dbService';
import { epgService } from '@/services/epgService';
import type { Channel, Program } from '@/types/epg';

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
      (c) => `  <channel id="${c.id}">\n    <display-name lang="de">${c.name}</display-name>${c.icon ? `\n    <icon src=\"${c.icon}\"/>` : ''}\n  </channel>`
    ),
    ...programs.map(
      (p) => `  <programme start="${p.start}" stop="${p.stop}" channel="${p.channel}">\n    <title lang="de">${p.title}</title>${p.description ? `\n    <desc lang=\"de\">${p.description}</desc>` : ''}${p.category ? `\n    <category lang=\"de\">${p.category}</category>` : ''}${p.episode ? `\n    <episode-num>${p.episode}</episode-num>` : ''}\n  </programme>`
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
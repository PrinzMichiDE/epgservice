import { NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { epgService } from '@/services/epgService';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Prüfe, ob die Daten älter als 24h sind und aktualisiere ggf.
    const lastUpdate = await dbService.getLastUpdate();
    const now = Date.now();
    if (!lastUpdate || now - lastUpdate > 24 * 60 * 60 * 1000) {
      console.log('EPG älter als 24h, führe Update durch...');
      await epgService.updateEPGData();
    }

    const epg = await dbService.getEPGData();
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE tv SYSTEM "xmltv.dtd">',
      `<tv generator-info-name="Rytec XMLTV" source-info-name="xmltv.info">`,
      ...epg.channels.map(
        (c) => `\n  <channel id="${c.id}">\n    <display-name lang="de">${c.name}</display-name>\n    ${c.icon ? `<icon src="${c.icon}"/>` : ''}\n  </channel>`
      ),
      ...epg.programs.map(
        (p) => `\n  <programme start="${p.start}" stop="${p.stop}" channel="${p.channel}">\n    <title lang="de">${p.title}</title>\n    ${p.description ? `<desc lang="de">${p.description}</desc>` : ''}\n    ${p.category ? `<category lang="de">${p.category}</category>` : ''}\n    ${p.episode ? `<episode-num>${p.episode}</episode-num>` : ''}\n  </programme>`
      ),
      '</tv>',
    ].join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="epg.xml"',
      },
    });
  } catch (error) {
    console.error('Fehler beim Generieren des XMLTV:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren des XMLTV' }, { status: 500 });
  }
} 
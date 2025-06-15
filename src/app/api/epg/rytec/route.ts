import { NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

// Automatisches Mapping: "DE: Das Erste" → "DasErste.de"
function autoRytecId(id: string): string {
  const match = id.match(/^DE: (.+)$/);
  if (match) {
    // Leerzeichen und Sonderzeichen entfernen, .de anhängen
    return match[1].replace(/[^a-zA-Z0-9]/g, '').replace(/ /g, '') + '.de';
  }
  return id;
}

export const runtime = 'nodejs';

export async function GET() {
  try {
    const epg = await dbService.getEPGData();
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE tv SYSTEM "xmltv.dtd">',
      `<tv generator-info-name="Rytec XMLTV" source-info-name="xmltv.info">`,
      ...epg.channels.map(
        (c) => `\n  <channel id="${autoRytecId(c.id)}">\n    <display-name lang="de">${c.name}</display-name>\n    ${c.icon ? `<icon src="${c.icon}"/>` : ''}\n  </channel>`
      ),
      ...epg.programs.map(
        (p) => `\n  <programme start="${p.start}" stop="${p.stop}" channel="${autoRytecId(p.channel)}">\n    <title lang="de">${p.title}</title>\n    ${p.description ? `<desc lang="de">${p.description}</desc>` : ''}\n    ${p.category ? `<category lang="de">${p.category}</category>` : ''}\n    ${p.episode ? `<episode-num>${p.episode}</episode-num>` : ''}\n  </programme>`
      ),
      '</tv>',
    ].join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="epg-rytec.xml"',
      },
    });
  } catch (error) {
    console.error('Fehler beim Generieren des Rytec-XML:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren des Rytec-XML' }, { status: 500 });
  }
} 
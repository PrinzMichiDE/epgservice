import { NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

// Mapping von Klartext-IDs und Display-Namen auf Rytec-IDs
const rytecChannelIdMap: Record<string, string> = {
  'DE: Das Erste': 'DasErste.de',
  'DE: ZDF': 'ZDF.de',
  'DE: ZDFneo': 'ZDFneo.de',
  'DE: ZDFinfo': 'ZDFinfo.de',
  'DE: 3sat': '3sat.de',
  'DE: ARTE': 'ARTE.de',
  'DE: KIKA': 'Kika.de',
  'DE: RTL': 'RTL.de',
  'DE: RTL2': 'RTL2.de',
  'DE: VOX': 'Vox.de',
  'DE: Super RTL': 'SuperRTL.de',
  'DE: n-tv': 'ntv.de',
  'DE: Sat.1': 'Sat1.de',
  'DE: ProSieben': 'ProSieben.de',
  'DE: Kabel Eins': 'KabelEins.de',
  'DE: sixx': 'Sixx.de',
  'DE: Sat.1 Gold': 'Sat1Gold.de',
  'DE: ProSieben Maxx': 'ProSiebenMaxx.de',
  'DE: RTL Nitro': 'RTLNitro.de',
  'DE: RTLup': 'RTLup.de',
  'DE: VOXup': 'VOXup.de',
  'DE: Kabel Eins Doku': 'KabelEinsDoku.de',
  'DE: Welt': 'WELT.de',
  'DE: N24 Doku': 'N24Doku.de',
  'DE: Eurosport 1': 'Eurosport1.de',
  'DE: Eurosport 2': 'Eurosport2.de',
  'DE: SPORT1': 'Sport1HD.de',
  'DE: Tele 5': 'Tele5.de',
  'DE: Comedy Central': 'ComedyCentralVIVA.de',
  'DE: Nickelodeon': 'Nickelodeon.de',
  'DE: Disney Channel': 'disneychannel.de',
  'DE: TLC': 'TLC.de',
  'DE: HGTV': 'HGTV.de',
  'DE: MTV': 'MTV.de',
  'DE: Deluxe Music': 'DeLuxeMusic.de',
  'DE: Bibel TV': 'BibelTV.de',
  'DE: tagesschau24': 'tagesschau24.de',
  'DE: phoenix': 'phoenix.de',
  'DE: One': 'One.de',
  'DE: ARD-alpha': 'ARD-alpha.de',
  'DE: Radio Bremen TV': 'RadioBremen.de',
  'DE: SR Fernsehen': 'SRFernsehen.de',
  'DE: MDR S-Anhalt': 'MDRS-Anhalt.de',
  'DE: rbb Berlin': 'rbbBerlin.de',
  'DE: hr-fernsehen': 'HRFernsehen.de',
  'DE: SWR Fernsehen BW': 'SWRFernsehen.de',
  'DE: SWR Fernsehen RP': 'SWRFernsehen-rp.de',
  'DE: WDR Fernsehen': 'WDRFernsehen.de',
  'DE: NDR Fernsehen NDS': 'NDRFernsehen.de',
  'DE: Hamburg 1': 'Hamburg1.de',
  'DE: Rheinmain TV': 'rheinmaintv.de',
  // ... weitere Channels nach Bedarf
};

function getRytecId(id: string): string {
  return rytecChannelIdMap[id] || id;
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
        (c) => `\n  <channel id="${getRytecId(c.id)}">\n    <display-name lang="de">${c.name}</display-name>\n    ${c.icon ? `<icon src="${c.icon}"/>` : ''}\n  </channel>`
      ),
      ...epg.programs.map(
        (p) => `\n  <programme start="${p.start}" stop="${p.stop}" channel="${getRytecId(p.channel)}">\n    <title lang="de">${p.title}</title>\n    ${p.description ? `<desc lang="de">${p.description}</desc>` : ''}\n    ${p.category ? `<category lang="de">${p.category}</category>` : ''}\n    ${p.episode ? `<episode-num>${p.episode}</episode-num>` : ''}\n  </programme>`
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
    console.error('Fehler beim Generieren des Rytec-XML:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren des Rytec-XML' }, { status: 500 });
  }
} 
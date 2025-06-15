import axios from 'axios';
import { EPGData, Channel, Program } from '../types/epg';
import { parseStringPromise } from 'xml2js';

interface XMLText {
  _?: string;
}

interface XMLChannel {
  $: { id: string };
  'display-name': Array<XMLText | string>;
  icon?: Array<{ $: { src: string } }>;
}

interface XMLProgram {
  $: {
    channel: string;
    start: string;
    stop: string;
  };
  title: Array<XMLText | string>;
  desc?: Array<XMLText | string>;
  category?: Array<XMLText | string>;
  'episode-num'?: Array<XMLText | string>;
}

interface XMLTVData {
  tv: {
    channel?: XMLChannel[];
    programme?: XMLProgram[];
  };
}

class EPGDownloader {
  private sources = [
    'https://xmltv.info/de/epg.xml',
    'https://epg.pw/xmltv/epg_DE.xml'
  ];

  public async downloadAll(): Promise<EPGData> {
    console.log('Starte EPG-Download...');
    const allChannels = new Map<string, Channel>();
    const allPrograms: Program[] = [];

    for (const source of this.sources) {
      try {
        console.log(`Verarbeite Quelle: ${source}`);
        const data = await this.downloadFile(source);
        const parsedData = await this.parseXML(data) as XMLTVData;
        
        if (parsedData && parsedData.tv) {
          // Verarbeite Kanäle
          if (parsedData.tv.channel) {
            for (const channel of parsedData.tv.channel) {
              try {
                if (!channel.$ || !channel.$.id) {
                  console.warn('Kanal ohne ID gefunden, überspringe...');
                  continue;
                }

                const channelId = channel.$.id;
                const displayName = this.getTextContent(channel['display-name']?.[0]);
                
                if (!displayName) {
                  console.warn(`Kanal ${channelId} ohne Namen gefunden, überspringe...`);
                  continue;
                }

                if (!allChannels.has(channelId)) {
                  allChannels.set(channelId, {
                    id: channelId,
                    name: displayName,
                    icon: channel.icon?.[0]?.$.src || undefined
                  });
                }
              } catch (error) {
                console.warn(`Fehler beim Verarbeiten eines Kanals:`, error);
                continue;
              }
            }
          }

          // Verarbeite Programme
          if (parsedData.tv.programme) {
            for (const program of parsedData.tv.programme) {
              try {
                if (!program.$ || !program.$.channel || !program.$.start || !program.$.stop) {
                  console.warn('Programm ohne erforderliche Attribute gefunden, überspringe...');
                  continue;
                }

                const title = this.getTextContent(program.title?.[0]);
                if (!title) {
                  console.warn(`Programm ohne Titel gefunden, überspringe...`);
                  continue;
                }

                allPrograms.push({
                  channel: program.$.channel,
                  start: program.$.start,
                  stop: program.$.stop,
                  title: title,
                  description: this.getTextContent(program.desc?.[0]),
                  category: this.getTextContent(program.category?.[0]),
                  episode: this.getTextContent(program['episode-num']?.[0])
                });
              } catch (error) {
                console.warn(`Fehler beim Verarbeiten eines Programms:`, error);
                continue;
              }
            }
          }
        }
        console.log(`Erfolgreich verarbeitet: ${source}`);
      } catch (error) {
        console.error(`Fehler beim Verarbeiten von ${source}:`, error);
      }
    }

    console.log(`Download abgeschlossen. Gefunden: ${allChannels.size} Kanäle, ${allPrograms.length} Programme`);

    return {
      channels: Array.from(allChannels.values()),
      programs: allPrograms
    };
  }

  private getTextContent(text: XMLText | string | undefined): string | undefined {
    if (!text) return undefined;
    if (typeof text === 'string') return text;
    return text._;
  }

  private async downloadFile(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'text',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*',
          'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Download von ${url}:`, error);
      throw error;
    }
  }

  private async parseXML(xml: string): Promise<XMLTVData> {
    try {
      return await parseStringPromise(xml, {
        explicitArray: true,
        mergeAttrs: false,
        trim: true,
        explicitChildren: false,
        explicitRoot: true
      });
    } catch (error) {
      console.error('Fehler beim XML-Parsing:', error);
      throw error;
    }
  }
}

export const epgDownloader = new EPGDownloader(); 
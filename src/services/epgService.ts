import { EPGData } from '../types/epg';
import { epgDownloader } from './epgDownloader';
import { getAllChannels, getAllPrograms, insertChannels, insertPrograms, setLastUpdate } from './dbService';

class EPGService {
  public async getEPGData(): Promise<EPGData> {
    try {
      console.log('Hole EPG-Daten aus der Cloud-Datenbank...');
      const channels = await getAllChannels();
      const programs = await getAllPrograms();
      if (!channels.length && !programs.length) {
        console.log('Keine Daten in der Cloud-DB gefunden, starte Download...');
        await this.updateEPGData();
        return {
          channels: await getAllChannels(),
          programs: await getAllPrograms(),
        };
      }
      return { channels, programs };
    } catch (error) {
      console.error('Fehler beim Abrufen der EPG-Daten:', error);
      throw error;
    }
  }

  public async updateEPGData(): Promise<void> {
    try {
      console.log('Starte EPG-Update...');
      const data = await epgDownloader.downloadAll();
      if (!data.channels.length || !data.programs.length) {
        throw new Error('Keine EPG-Daten heruntergeladen');
      }
      await insertChannels(data.channels);
      await insertPrograms(data.programs);
      await setLastUpdate(Date.now());
      console.log('EPG-Update erfolgreich abgeschlossen');
    } catch (error) {
      console.error('Fehler beim EPG-Update:', error);
      throw error;
    }
  }

  public getChannels() {
    return getAllChannels();
  }

  public getProgramsByChannel() {
    return getAllPrograms();
  }
}

export const epgService = new EPGService(); 
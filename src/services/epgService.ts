import { EPGData } from '../types/epg';
import { epgDownloader } from './epgDownloader';
import { dbService } from './dbService';

class EPGService {
  public async getEPGData(): Promise<EPGData> {
    try {
      console.log('Hole EPG-Daten aus der Datenbank...');
      const data = await dbService.getEPGData();
      
      if (!data.channels.length && !data.programs.length) {
        console.log('Keine Daten in der Datenbank gefunden, starte Download...');
        await this.updateEPGData();
        return await dbService.getEPGData();
      }
      
      return data;
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
      
      console.log(`Speichere ${data.channels.length} Kanäle und ${data.programs.length} Programme...`);
      await dbService.saveEPGData(data.channels, data.programs);
      await dbService.setLastUpdate(Date.now());
      console.log('EPG-Update erfolgreich abgeschlossen');
    } catch (error) {
      console.error('Fehler beim EPG-Update:', error);
      throw error;
    }
  }

  public getChannels() {
    return dbService.getAllChannels();
  }

  public getProgramsByChannel(channelId: string) {
    return dbService.getProgramsByChannel(channelId);
  }
}

export const epgService = new EPGService(); 
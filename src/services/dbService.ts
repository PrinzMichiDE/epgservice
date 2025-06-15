import Database from 'better-sqlite3';
import fs from 'fs';
import { Channel, Program } from '@/types/epg';

const DB_PATH = 'data/epg.db';
const UPDATE_FILE = 'data/last_update.json';

export class DBService {
  private db: InstanceType<typeof Database>;

  constructor() {
    // Stelle sicher, dass das data-Verzeichnis existiert
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
    }

    this.db = new Database(DB_PATH);
    this.initDB();
  }

  private initDB() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start INTEGER NOT NULL,
        stop INTEGER NOT NULL,
        FOREIGN KEY (channel) REFERENCES channels(id)
      );

      CREATE INDEX IF NOT EXISTS idx_programs_channel ON programs(channel);
      CREATE INDEX IF NOT EXISTS idx_programs_start ON programs(start);
    `);
  }

  async saveEPGData(channels: Channel[], programs: Program[]) {
    const insertChannel = this.db.prepare(`
      INSERT OR REPLACE INTO channels (id, name, icon)
      VALUES (@id, @name, @icon)
    `);

    const insertProgram = this.db.prepare(`
      INSERT OR REPLACE INTO programs (id, channel, title, description, start, stop)
      VALUES (@id, @channel, @title, @description, @start, @stop)
    `);

    const insertManyChannels = this.db.transaction((channels: Channel[]) => {
      for (const channel of channels) {
        insertChannel.run(channel);
      }
    });

    const insertManyPrograms = this.db.transaction((programs: Program[]) => {
      for (const program of programs) {
        insertProgram.run(program);
      }
    });

    try {
      insertManyChannels(channels);
      insertManyPrograms(programs);
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der EPG-Daten:', error);
      return false;
    }
  }

  async getEPGData() {
    const channels = this.db.prepare('SELECT * FROM channels ORDER BY name').all() as Channel[];
    const programs = this.db.prepare('SELECT * FROM programs').all() as Program[];
    return { channels, programs };
  }

  async getAllChannels() {
    return this.db.prepare('SELECT * FROM channels ORDER BY name').all() as Channel[];
  }

  async getProgramsByChannel(channelId: string) {
    return this.db.prepare(`
      SELECT * FROM programs 
      WHERE channel = ? 
      ORDER BY start
    `).all(channelId) as Program[];
  }

  async getLastUpdate() {
    try {
      if (!fs.existsSync(UPDATE_FILE)) {
        return null;
      }
      const data = JSON.parse(fs.readFileSync(UPDATE_FILE, 'utf-8'));
      return data.lastUpdate;
    } catch (error) {
      console.error('Fehler beim Lesen des letzten Updates:', error);
      return null;
    }
  }

  async setLastUpdate(timestamp: number) {
    try {
      fs.writeFileSync(UPDATE_FILE, JSON.stringify({ lastUpdate: timestamp }));
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern des letzten Updates:', error);
      return false;
    }
  }
}
export const dbService = new DBService();
import Database from 'better-sqlite3';
import { EPGData } from '../types/epg';

class DBService {
  private db: Database.Database;

  constructor() {
    this.db = new Database('epg.db');
    this.initDatabase();
  }

  private initDatabase() {
    // Erstelle Tabellen, falls sie nicht existieren
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        start TEXT NOT NULL,
        stop TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        episode TEXT,
        FOREIGN KEY (channel_id) REFERENCES channels(id),
        UNIQUE(channel_id, start, title)
      );

      CREATE INDEX IF NOT EXISTS idx_programs_channel_start ON programs(channel_id, start);
    `);
  }

  public getEPGData(): EPGData {
    try {
      const channels = this.db.prepare('SELECT * FROM channels ORDER BY name').all();
      console.log('Gefundene Kanäle:', channels.length);

      const programs = this.db.prepare(`
        SELECT p.*, c.name as channel_name, c.icon as channel_icon
        FROM programs p
        JOIN channels c ON p.channel_id = c.id
        ORDER BY c.name, p.start
      `).all();
      console.log('Gefundene Programme:', programs.length);

      if (channels.length === 0 || programs.length === 0) {
        console.error('Keine Daten in der Datenbank gefunden');
        return { channels: [], programs: [] };
      }

      return {
        channels: channels.map(channel => ({
          id: String(channel.id),
          name: String(channel.name),
          icon: channel.icon ? String(channel.icon) : null
        })),
        programs: programs.map(program => ({
          channel: String(program.channel_id),
          start: String(program.start),
          stop: String(program.stop),
          title: String(program.title),
          description: program.description ? String(program.description) : null,
          category: program.category ? String(program.category) : null,
          episode: program.episode ? String(program.episode) : null
        }))
      };
    } catch (error) {
      console.error('Fehler beim Abrufen der EPG-Daten:', error);
      return { channels: [], programs: [] };
    }
  }

  public saveEPGData(data: EPGData) {
    const { channels, programs } = data;

    // Beginne eine Transaktion
    const transaction = this.db.transaction(() => {
      // Lösche alte Programme
      this.db.prepare('DELETE FROM programs').run();

      // Füge neue Kanäle hinzu
      const insertChannel = this.db.prepare(`
        INSERT OR REPLACE INTO channels (id, name, icon)
        VALUES (?, ?, ?)
      `);

      // Füge neue Programme hinzu
      const insertProgram = this.db.prepare(`
        INSERT OR IGNORE INTO programs (channel_id, start, stop, title, description, category, episode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      // Verarbeite Kanäle
      for (const channel of channels) {
        try {
          insertChannel.run(
            String(channel.id),
            String(channel.name),
            channel.icon ? String(channel.icon) : null
          );
        } catch (error) {
          console.error(`Fehler beim Einfügen des Kanals ${channel.id}:`, error);
        }
      }

      // Verarbeite Programme
      for (const program of programs) {
        try {
          insertProgram.run(
            String(program.channel),
            String(program.start),
            String(program.stop),
            String(program.title),
            program.description ? String(program.description) : null,
            program.category ? String(program.category) : null,
            program.episode ? String(program.episode) : null
          );
        } catch (error) {
          console.error(`Fehler beim Einfügen des Programms ${program.title}:`, error);
        }
      }
    });

    // Führe die Transaktion aus
    transaction();
  }

  public getCurrentPrograms(): any[] {
    const now = new Date().toISOString();
    return this.db.prepare(`
      SELECT p.*, c.name as channel_name, c.icon as channel_icon
      FROM programs p
      JOIN channels c ON p.channel_id = c.id
      WHERE p.start <= ? AND p.stop >= ?
      ORDER BY c.name, p.start
    `).all(now, now);
  }

  public getProgramsByChannel(channelId: string): any[] {
    return this.db.prepare(`
      SELECT p.*, c.name as channel_name, c.icon as channel_icon
      FROM programs p
      JOIN channels c ON p.channel_id = c.id
      WHERE c.id = ?
      ORDER BY p.start
    `).all(channelId);
  }

  public getAllChannels(): any[] {
    return this.db.prepare('SELECT * FROM channels ORDER BY name').all();
  }
}

export const dbService = new DBService(); 
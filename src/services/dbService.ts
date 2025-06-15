import { Database } from '@sqlitecloud/drivers';
import type { Channel, Program } from '@/types/epg';

const db = new Database(process.env.SQLITE_URL!);

// Tabellen beim ersten Import anlegen
initTables().then(() => console.log('Tabellen initialisiert')).catch(console.error);

export async function initTables() {
  await db.sql`
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
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `;
}

export async function getLastUpdate(): Promise<number | null> {
  const result = await db.sql`SELECT value FROM meta WHERE key = 'lastUpdate';`;
  console.log('getLastUpdate SQL result:', result);
  if (result.length > 0) {
    return Number(result[0].value);
  }
  return null;
}

export async function setLastUpdate(timestamp: number): Promise<void> {
  try {
    console.log('setLastUpdate: versuche zu schreiben:', timestamp);
    await db.sql`INSERT OR REPLACE INTO meta (key, value) VALUES ('lastUpdate', ${String(timestamp)});`;
    console.log('setLastUpdate erfolgreich:', timestamp);
  } catch (e) {
    console.error('Fehler beim Schreiben in meta:', e);
  }
}

export async function getAllChannels() {
  const result = await db.sql`SELECT * FROM channels;`;
  return result;
}

export async function getAllPrograms() {
  const result = await db.sql`SELECT * FROM programs;`;
  return result;
}

export async function insertChannels(channels: Channel[]) {
  for (const c of channels) {
    await db.sql`INSERT OR REPLACE INTO channels (id, name, icon) VALUES (${c.id}, ${c.name}, ${c.icon});`;
  }
}

export async function insertPrograms(programs: Program[]) {
  for (const p of programs) {
    // Prüfe Pflichtfelder
    if (!p.channel || !p.start || !p.stop) continue;
    // Generiere ID, falls nicht vorhanden
    const id = p.id || `${p.channel}_${p.start}_${p.stop}`;
    await db.sql`INSERT OR REPLACE INTO programs (id, channel, title, description, start, stop) VALUES (${id}, ${p.channel}, ${p.title}, ${p.description}, ${p.start}, ${p.stop});`;
  }
}
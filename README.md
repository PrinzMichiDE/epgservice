# EPG Merger

Ein NextJS-Projekt, das verschiedene EPG XMLTV-Quellen zusammenführt und über eine API bereitstellt.

## Funktionen

- Zusammenführen mehrerer EPG XMLTV-Quellen
- Automatische Aktualisierung der Daten alle 4 Stunden
- REST-API für den Zugriff auf die EPG-Daten
- Responsive Frontend-Anzeige der Programmübersicht

## Installation

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

## Konfiguration

Die EPG-Quellen können in der Datei `src/services/epgService.ts` konfiguriert werden. Fügen Sie Ihre XMLTV-Quellen im folgenden Format hinzu:

```typescript
{
  name: 'Quellenname',
  url: 'https://example.com/epg.xml',
  enabled: true
}
```

## API-Endpunkte

- `GET /api/epg`: Gibt die zusammengeführten EPG-Daten zurück
- `GET /api/cron/update-epg`: Endpunkt für den Cron-Job zur Aktualisierung der Daten

## Deployment auf Vercel

1. Projekt auf GitHub hochladen
2. In Vercel ein neues Projekt erstellen und das Repository verbinden
3. Die Umgebungsvariablen in Vercel konfigurieren
4. Deployen

Der Cron-Job wird automatisch alle 4 Stunden ausgeführt, um die EPG-Daten zu aktualisieren.

## Lizenz

MIT

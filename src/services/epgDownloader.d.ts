import type { EPGData } from '../types/epg';

export interface EPGDownloader {
  downloadAll(): Promise<EPGData>;
}

export const epgDownloader: EPGDownloader; 
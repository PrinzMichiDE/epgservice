export interface Channel {
  id: string;
  name: string;
  icon?: string;
}

export interface Program {
  channel: string;
  start: string;
  stop: string;
  title: string;
  description?: string;
  category?: string;
  episode?: string;
}

export interface EPGData {
  channels: Channel[];
  programs: Program[];
}

export interface EPGSource {
  name: string;
  url: string;
  enabled: boolean;
} 
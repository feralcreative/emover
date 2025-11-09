import dotenv from 'dotenv';
import { SourceConfig, DestinationConfig } from './types.js';

dotenv.config();

export function getSourceConfig(): SourceConfig {
  return {
    email: process.env.SOURCE_EMAIL || '',
    password: process.env.SOURCE_PASSWORD || '',
    host: process.env.SOURCE_HOST || '',
    port: parseInt(process.env.SOURCE_PORT || '995', 10),
    protocol: (process.env.SOURCE_PROTOCOL || 'pop3') as 'imap' | 'pop3',
    mailbox: process.env.SOURCE_MAILBOX,
  };
}

export function getDestinationConfig(): DestinationConfig {
  return {
    email: process.env.DEST_EMAIL || '',
    password: process.env.DEST_PASSWORD || '',
    host: process.env.DEST_HOST || '',
    port: parseInt(process.env.DEST_PORT || '587', 10),
    useTls: process.env.DEST_USE_TLS !== 'false',
  };
}

export function validateConfig(source: SourceConfig, dest: DestinationConfig): void {
  const errors: string[] = [];

  if (!source.email) errors.push('SOURCE_EMAIL is required');
  if (!source.password) errors.push('SOURCE_PASSWORD is required');
  if (!source.host) errors.push('SOURCE_HOST is required');
  if (!dest.email) errors.push('DEST_EMAIL is required');
  if (!dest.password) errors.push('DEST_PASSWORD is required');
  if (!dest.host) errors.push('DEST_HOST is required');

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}


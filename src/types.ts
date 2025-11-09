export interface SourceConfig {
  email: string;
  password: string;
  host: string;
  port: number;
  protocol: 'imap' | 'pop3';
  mailbox?: string;
}

export interface DestinationConfig {
  email: string;
  password: string;
  host: string;
  port: number;
  useTls: boolean;
}

export interface EmailMessage {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  date?: Date;
}

export interface MigrationStats {
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
  startTime: Date;
  endTime?: Date;
}


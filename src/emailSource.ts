import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EmailMessage, SourceConfig } from './types.js';
import { logger } from './logger.js';

export class EmailSource {
  private imap: Imap;
  private config: SourceConfig;

  constructor(config: SourceConfig) {
    this.config = config;
    this.imap = new Imap({
      user: config.email,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.port === 995,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(this.config.mailbox || 'INBOX', false, (err) => {
        if (err) reject(err);
        else resolve();
      });
      this.imap.openBox(this.config.mailbox || 'INBOX', false, (err) => {
        if (err) reject(err);
        else resolve();
      });
      this.imap.connect();
    });
  }

  async fetchEmails(): Promise<EmailMessage[]> {
    const emails: EmailMessage[] = [];

    return new Promise((resolve, reject) => {
      this.imap.search(['ALL'], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          logger.info('No emails found');
          resolve(emails);
          return;
        }

        logger.info(`Found ${results.length} emails to migrate`);

        const f = this.imap.fetch(results, { bodies: '' });

        f.on('message', (msg) => {
          simpleParser(msg, async (err, parsed) => {
            if (err) {
              logger.error({ err }, 'Error parsing email');
              return;
            }

            const email: EmailMessage = {
              from: parsed.from?.text,
              to: parsed.to?.text,
              subject: parsed.subject,
              text: parsed.text,
              html: parsed.html,
              headers: Object.fromEntries(parsed.headers),
              messageId: parsed.messageId,
              inReplyTo: parsed.inReplyTo,
              references: parsed.references,
              date: parsed.date,
              attachments: parsed.attachments?.map((att) => ({
                filename: att.filename || 'attachment',
                content: att.content as Buffer,
                contentType: att.contentType,
              })),
            };

            emails.push(email);
          });
        });

        f.on('error', reject);
        f.on('end', () => {
          this.imap.closeBox(false, (err) => {
            if (err) reject(err);
            else resolve(emails);
          });
        });
      });
    });
  }

  disconnect(): void {
    this.imap.end();
  }
}


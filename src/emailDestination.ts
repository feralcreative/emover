import nodemailer from 'nodemailer';
import { EmailMessage, DestinationConfig } from './types.js';
import { logger } from './logger.js';

export class EmailDestination {
  private transporter: nodemailer.Transporter;
  private config: DestinationConfig;

  constructor(config: DestinationConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.useTls && config.port === 465,
      auth: {
        user: config.email,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(email: EmailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: email.from || this.config.email,
        to: email.to || this.config.email,
        subject: email.subject || '(no subject)',
        text: email.text,
        html: email.html,
        attachments: email.attachments,
        headers: {
          'Message-ID': email.messageId,
          'In-Reply-To': email.inReplyTo,
          References: email.references,
          Date: email.date?.toUTCString(),
        },
      });

      logger.debug({ subject: email.subject }, 'Email sent successfully');
    } catch (error) {
      logger.error({ error, subject: email.subject }, 'Failed to send email');
      throw error;
    }
  }

  async close(): Promise<void> {
    this.transporter.close();
  }
}


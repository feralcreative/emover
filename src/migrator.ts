import { EmailSource } from './emailSource.js';
import { EmailDestination } from './emailDestination.js';
import { SourceConfig, DestinationConfig, MigrationStats } from './types.js';
import { logger } from './logger.js';

export class EmailMigrator {
  private source: EmailSource;
  private destination: EmailDestination;

  constructor(sourceConfig: SourceConfig, destConfig: DestinationConfig) {
    this.source = new EmailSource(sourceConfig);
    this.destination = new EmailDestination(destConfig);
  }

  async migrate(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      totalEmails: 0,
      successfulEmails: 0,
      failedEmails: 0,
      startTime: new Date(),
    };

    try {
      logger.info('Connecting to source email account...');
      await this.source.connect();

      logger.info('Fetching emails from source...');
      const emails = await this.source.fetchEmails();
      stats.totalEmails = emails.length;

      logger.info(`Starting migration of ${emails.length} emails...`);

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        try {
          await this.destination.sendEmail(email);
          stats.successfulEmails++;
          logger.info(
            { progress: `${i + 1}/${emails.length}`, subject: email.subject },
            'Email migrated'
          );
        } catch (error) {
          stats.failedEmails++;
          logger.error(
            { error, subject: email.subject },
            'Failed to migrate email'
          );
        }
      }

      stats.endTime = new Date();
      logger.info(stats, 'Migration completed');

      return stats;
    } finally {
      this.source.disconnect();
      await this.destination.close();
    }
  }
}


import { getSourceConfig, getDestinationConfig, validateConfig } from './config.js';
import { EmailMigrator } from './migrator.js';
import { logger } from './logger.js';

async function main() {
  try {
    logger.info('Starting email migration...');

    const sourceConfig = getSourceConfig();
    const destConfig = getDestinationConfig();

    validateConfig(sourceConfig, destConfig);

    const migrator = new EmailMigrator(sourceConfig, destConfig);
    const stats = await migrator.migrate();

    logger.info(
      {
        total: stats.totalEmails,
        successful: stats.successfulEmails,
        failed: stats.failedEmails,
        duration: stats.endTime
          ? `${(stats.endTime.getTime() - stats.startTime.getTime()) / 1000}s`
          : 'unknown',
      },
      'Migration summary'
    );

    process.exit(stats.failedEmails > 0 ? 1 : 0);
  } catch (error) {
    logger.error(error, 'Migration failed');
    process.exit(1);
  }
}

main();


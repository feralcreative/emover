# Emover - Email Migration Tool

A Node.js application that downloads emails from one POP/IMAP account and uploads them to another via SMTP.

## Features

- Support for POP3 and IMAP protocols for source accounts
- SMTP support for destination accounts
- Preserves email metadata (headers, message IDs, dates)
- Handles attachments
- Comprehensive logging
- Configuration via environment variables

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your email account credentials:

```env
# Source Email Account (POP/IMAP)
SOURCE_EMAIL=source@example.com
SOURCE_PASSWORD=your_password
SOURCE_HOST=pop.example.com
SOURCE_PORT=995
SOURCE_PROTOCOL=pop3

# Destination Email Account (SMTP)
DEST_EMAIL=destination@example.com
DEST_PASSWORD=your_password
DEST_HOST=smtp.example.com
DEST_PORT=587
DEST_USE_TLS=true

# Optional: Mailbox to migrate (leave empty for all)
SOURCE_MAILBOX=INBOX

# Logging
LOG_LEVEL=info
```

## Usage

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Scripts

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled application
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

- **EmailSource** - Handles connecting to and fetching emails from POP/IMAP servers
- **EmailDestination** - Handles sending emails via SMTP
- **EmailMigrator** - Orchestrates the migration process
- **Config** - Loads and validates configuration from environment variables
- **Logger** - Provides structured logging with Pino

## Error Handling

The application logs detailed error information and continues processing remaining emails if one fails. A summary is provided at the end showing successful and failed email counts.

## License

MIT


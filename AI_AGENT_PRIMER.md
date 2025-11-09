# 🚀 EMOVER - AI Agent Primer

**Project:** Email Migration Tool  
**Version:** 0.1.0  
**Language:** TypeScript (Node.js)  
**Purpose:** Download emails from one POP/IMAP account and push to another via SMTP  
**Status:** ✅ Scaffolded & Ready for Development

---

## 🔒 SECRETS REFERENCE GUIDE

**CRITICAL:** All credentials are environment-based. Never commit `.env` file.

### Email Account Credentials

**Location:** `.env` (root directory)

- `SOURCE_EMAIL` → Email address (e.g., `user@example.com`)
- `SOURCE_PASSWORD` → Password (8+ chars, obfuscated as `pge****!`)
- `SOURCE_HOST` → POP/IMAP server (e.g., `pop.gmail.com`)
- `SOURCE_PORT` → Port number (typically `995` for POP3 SSL, `993` for IMAP SSL)
- `DEST_EMAIL` → Destination email address
- `DEST_PASSWORD` → Destination password (obfuscated as `gra****`)
- `DEST_HOST` → SMTP server (e.g., `smtp.gmail.com`)
- `DEST_PORT` → SMTP port (typically `587` for TLS, `465` for SSL)

### Configuration Variables

**Location:** `.env` (root directory)

- `SOURCE_PROTOCOL` → `pop3` or `imap` (default: `pop3`)
- `SOURCE_MAILBOX` → Mailbox name (default: `INBOX`, optional)
- `DEST_USE_TLS` → `true` or `false` (default: `true`)
- `LOG_LEVEL` → `debug`, `info`, `warn`, `error` (default: `info`)

### .gitignore Requirements

**File:** `.gitignore` (already configured)

- ✅ `**/.env` - Never commit environment files
- ✅ `node_modules/` - Dependencies
- ✅ `dist/` - Compiled output
- ✅ `*.log` - Log files

---

## 📁 DIRECTORY STRUCTURE

```
emover/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Entry point (lines 1-37)
│   ├── types.ts                  # Type definitions (lines 1-44)
│   ├── config.ts                 # Configuration loader (lines 1-42)
│   ├── logger.ts                 # Logging setup (lines 1-17)
│   ├── emailSource.ts            # POP/IMAP email fetcher (lines 1-101)
│   ├── emailDestination.ts       # SMTP email sender (lines 1-54)
│   └── migrator.ts               # Migration orchestrator (lines 1-62)
├── dist/                         # Compiled JavaScript (generated)
├── node_modules/                 # Dependencies (generated)
├── package.json                  # Project metadata & scripts
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment template
├── .env                          # Environment variables (DO NOT COMMIT)
├── .eslintrc.json                # ESLint rules
├── .prettierrc.json              # Code formatting rules
├── README.md                     # User documentation
└── AI_AGENT_PRIMER.md            # This file
```

---

## 🏗️ ARCHITECTURE & DATA FLOW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      EMOVER MIGRATION FLOW                   │
└─────────────────────────────────────────────────────────────┘

1. INITIALIZATION
   ├─ Load .env file (dotenv)
   ├─ Parse SOURCE_* and DEST_* variables
   └─ Validate all required fields

2. SOURCE CONNECTION (EmailSource class)
   ├─ Create IMAP connection
   ├─ Connect to SOURCE_HOST:SOURCE_PORT
   ├─ Authenticate with SOURCE_EMAIL:SOURCE_PASSWORD
   └─ Open SOURCE_MAILBOX (default: INBOX)

3. EMAIL FETCHING
   ├─ Search for all emails (IMAP: ['ALL'])
   ├─ Parse each email with mailparser
   ├─ Extract: from, to, subject, text, html, headers, attachments
   └─ Build EmailMessage[] array

4. EMAIL MIGRATION (EmailMigrator class)
   ├─ For each email in array:
   │  ├─ Create SMTP connection (EmailDestination)
   │  ├─ Send via nodemailer
   │  ├─ Preserve headers (Message-ID, In-Reply-To, References, Date)
   │  └─ Log success/failure
   └─ Collect migration statistics

5. CLEANUP & REPORTING
   ├─ Close IMAP connection
   ├─ Close SMTP connection
   ├─ Log final statistics
   └─ Exit with code 0 (success) or 1 (failures)
```

### Data Flow Diagram

```
.env File
   ↓
config.ts (getSourceConfig, getDestinationConfig)
   ↓
index.ts (main)
   ├─→ EmailMigrator.migrate()
   │    ├─→ EmailSource.connect()
   │    ├─→ EmailSource.fetchEmails()
   │    │    └─→ EmailMessage[]
   │    ├─→ For each EmailMessage:
   │    │    └─→ EmailDestination.sendEmail()
   │    └─→ MigrationStats
   └─→ logger.info(stats)
```

---

## 🔧 TECHNOLOGY STACK

| Component | Package | Version | Purpose |
|-----------|---------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Language** | TypeScript | ^5.3.3 | Type-safe development |
| **Email Fetch** | imap | ^0.8.19 | POP3/IMAP protocol |
| **Email Parse** | mailparser | ^3.6.5 | Parse email content |
| **Email Send** | nodemailer | ^6.9.7 | SMTP email sending |
| **Config** | dotenv | ^16.3.1 | Environment variables |
| **Logging** | pino | ^8.17.2 | Structured logging |
| **Dev Runtime** | tsx | ^4.7.0 | TypeScript execution |
| **Compiler** | tsc | ^5.3.3 | TypeScript compiler |
| **Testing** | vitest | ^1.1.0 | Unit testing framework |
| **Linting** | eslint | ^8.56.0 | Code quality |
| **Formatting** | prettier | ^3.1.1 | Code formatting |

---

## 📋 KEY CLASSES & FUNCTIONS

### 1. EmailSource (src/emailSource.ts)

**Purpose:** Connects to POP/IMAP server and fetches emails

**Key Methods:**

- `constructor(config: SourceConfig)` (lines 10-20)
  - Initializes IMAP connection with credentials
  - Sets TLS based on port (995 = SSL)
  
- `async connect(): Promise<void>` (lines 22-34)
  - Opens mailbox connection
  - **BUG:** Lines 24-31 call `openBox` twice (duplicate code)
  
- `async fetchEmails(): Promise<EmailMessage[]>` (lines 36-94)
  - Searches for all emails
  - Parses each with mailparser
  - Returns array of EmailMessage objects
  
- `disconnect(): void` (lines 96-98)
  - Closes IMAP connection

**Critical Code:**

```typescript
// Line 17: TLS detection
tls: config.port === 995,

// Line 40: Search all emails
this.imap.search(['ALL'], (err, results) => {

// Lines 56-82: Parse email with mailparser
simpleParser(msg, async (err, parsed) => {
```

### 2. EmailDestination (src/emailDestination.ts)

**Purpose:** Sends emails via SMTP

**Key Methods:**

- `constructor(config: DestinationConfig)` (lines 9-23)
  - Creates nodemailer transporter
  - Configures SMTP auth
  
- `async sendEmail(email: EmailMessage): Promise<void>` (lines 25-47)
  - Sends email via SMTP
  - Preserves headers (Message-ID, In-Reply-To, References, Date)
  - Logs success/failure
  
- `async close(): Promise<void>` (lines 49-51)
  - Closes SMTP connection

**Critical Code:**

```typescript
// Line 14: Secure flag for port 465
secure: config.useTls && config.port === 465,

// Lines 34-39: Header preservation
headers: {
  'Message-ID': email.messageId,
  'In-Reply-To': email.inReplyTo,
  References: email.references,
  Date: email.date?.toUTCString(),
},
```

### 3. EmailMigrator (src/migrator.ts)

**Purpose:** Orchestrates the migration process

**Key Methods:**

- `constructor(sourceConfig, destConfig)` (lines 10-13)
  - Instantiates EmailSource and EmailDestination
  
- `async migrate(): Promise<MigrationStats>` (lines 15-60)
  - Main migration logic
  - Connects to source
  - Fetches emails
  - Sends each email
  - Tracks statistics
  - Cleans up connections

**Critical Code:**

```typescript
// Lines 33-49: Email migration loop
for (let i = 0; i < emails.length; i++) {
  const email = emails[i];
  try {
    await this.destination.sendEmail(email);
    stats.successfulEmails++;
  } catch (error) {
    stats.failedEmails++;
  }
}
```

### 4. Configuration (src/config.ts)

**Functions:**

- `getSourceConfig(): SourceConfig` (lines 6-15)
  - Loads SOURCE_* env vars
  - Parses port as integer
  - Defaults: port=995, protocol=pop3
  
- `getDestinationConfig(): DestinationConfig` (lines 17-25)
  - Loads DEST_* env vars
  - Parses port as integer
  - Defaults: port=587, useTls=true
  
- `validateConfig(source, dest): void` (lines 27-40)
  - Validates all required fields
  - Throws error if missing

### 5. Logger (src/logger.ts)

**Purpose:** Structured logging with Pino

**Configuration:**

- Log level from `LOG_LEVEL` env var (default: `info`)
- Pretty-printed output with colors
- Timestamps in system format
- Ignores pid and hostname

**Usage:**

```typescript
logger.info('Message');
logger.error({ error }, 'Error message');
logger.debug({ subject }, 'Debug info');
```

### 6. Types (src/types.ts)

**Interfaces:**

- `SourceConfig` - Source account configuration
- `DestinationConfig` - Destination account configuration
- `EmailMessage` - Email data structure
- `MigrationStats` - Migration statistics

---

## 🚀 DEVELOPMENT WORKFLOW

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your credentials
# SOURCE_EMAIL=your_source@gmail.com
# SOURCE_PASSWORD=your_app_password
# DEST_EMAIL=your_dest@gmail.com
# DEST_PASSWORD=your_app_password
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run compiled version
npm start

# Run with custom log level
LOG_LEVEL=debug npm run dev
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### Common Development Tasks

**Task: Add a new email field to preserve**

1. Add field to `EmailMessage` interface (src/types.ts)
2. Extract field in `emailSource.ts` (lines 63-79)
3. Add field to `sendEmail` call in `emailDestination.ts` (lines 27-40)

**Task: Change source protocol**

1. Update `SOURCE_PROTOCOL` in `.env`
2. Modify IMAP connection in `emailSource.ts` (lines 12-19)

**Task: Add retry logic**

1. Modify `migrate()` loop in `migrator.ts` (lines 33-49)
2. Add retry counter and exponential backoff

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Duplicate openBox Call

**Location:** `src/emailSource.ts`, lines 24-31  
**Problem:** `openBox` is called twice in `connect()` method  
**Impact:** May cause connection issues or race conditions  
**Workaround:** Remove duplicate call (line 28-31)  
**Fix Priority:** HIGH - Should be fixed immediately

### Issue 2: TLS Certificate Validation Disabled

**Location:** `src/emailSource.ts` line 18, `src/emailDestination.ts` line 20  
**Problem:** `rejectUnauthorized: false` disables SSL certificate validation  
**Impact:** Security risk in production  
**Workaround:** Use trusted email providers (Gmail, Outlook, etc.)  
**Fix Priority:** MEDIUM - Should be configurable

### Issue 3: No Retry Logic

**Location:** `src/migrator.ts`, lines 33-49  
**Problem:** Single email failure stops entire migration  
**Impact:** Large migrations may fail partially  
**Workaround:** Re-run migration for failed emails  
**Fix Priority:** MEDIUM - Add retry mechanism

### Issue 4: No Duplicate Detection

**Location:** `src/migrator.ts`  
**Problem:** No check for already-migrated emails  
**Impact:** Re-running migration duplicates emails  
**Workaround:** Manually delete duplicates or use unique message IDs  
**Fix Priority:** HIGH - Add idempotency check

### Issue 5: Memory Issues with Large Mailboxes

**Location:** `src/emailSource.ts`, line 36  
**Problem:** Loads all emails into memory before sending  
**Impact:** May crash with 10,000+ emails  
**Workaround:** Process emails in batches  
**Fix Priority:** MEDIUM - Implement streaming

---

## 🔐 AUTHENTICATION & CREDENTIALS

### Email Provider Setup

**Gmail:**

```
SOURCE_HOST=imap.gmail.com
SOURCE_PORT=993
SOURCE_PROTOCOL=imap
DEST_HOST=smtp.gmail.com
DEST_PORT=587
DEST_USE_TLS=true
```

⚠️ Use App Password, not regular password

**Outlook/Office365:**

```
SOURCE_HOST=outlook.office365.com
SOURCE_PORT=993
SOURCE_PROTOCOL=imap
DEST_HOST=smtp.office365.com
DEST_PORT=587
DEST_USE_TLS=true
```

**Generic IMAP/SMTP:**

```
SOURCE_HOST=mail.example.com
SOURCE_PORT=993
SOURCE_PROTOCOL=imap
DEST_HOST=mail.example.com
DEST_PORT=587
DEST_USE_TLS=true
```

### TLS/SSL Configuration

- **Port 465:** SSL (secure=true)
- **Port 587:** TLS (secure=false, STARTTLS)
- **Port 995:** POP3 SSL
- **Port 993:** IMAP SSL

---

## 📊 API & PROTOCOL DETAILS

### IMAP Protocol (Email Fetching)

**Connection:**

```typescript
new Imap({
  user: SOURCE_EMAIL,
  password: SOURCE_PASSWORD,
  host: SOURCE_HOST,
  port: SOURCE_PORT,
  tls: true,
})
```

**Search Syntax:**

- `['ALL']` - All emails
- `['UNSEEN']` - Unread emails
- `['SINCE', 'Jan 1, 2024']` - Emails since date

**Response Format:**

```typescript
// Parsed email from mailparser
{
  from: { text: 'sender@example.com' },
  to: { text: 'recipient@example.com' },
  subject: 'Email Subject',
  text: 'Plain text body',
  html: '<p>HTML body</p>',
  headers: Map<string, string>,
  attachments: Array<Attachment>,
  messageId: '<unique-id@example.com>',
  date: Date,
}
```

### SMTP Protocol (Email Sending)

**Connection:**

```typescript
nodemailer.createTransport({
  host: DEST_HOST,
  port: DEST_PORT,
  secure: DEST_PORT === 465,
  auth: {
    user: DEST_EMAIL,
    pass: DEST_PASSWORD,
  },
})
```

**Send Request:**

```typescript
transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Subject',
  text: 'Plain text',
  html: '<p>HTML</p>',
  attachments: [...],
  headers: { ... },
})
```

---

## 📈 DEPLOYMENT

### Build for Production

```bash
# Compile TypeScript
npm run build

# Output: dist/index.js
```

### Environment Setup

```bash
# Create production .env
cp .env.example .env.production

# Set production credentials
SOURCE_EMAIL=prod_source@example.com
SOURCE_PASSWORD=PROD_PASSWORD_HERE
DEST_EMAIL=prod_dest@example.com
DEST_PASSWORD=PROD_PASSWORD_HERE
LOG_LEVEL=info
```

### Running in Production

```bash
# Option 1: Direct Node
node dist/index.js

# Option 2: With process manager (PM2)
pm2 start dist/index.js --name emover

# Option 3: Docker
docker build -t emover .
docker run --env-file .env emover
```

### Docker Setup (Optional)

**Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

**Build & Run:**

```bash
docker build -t emover .
docker run --env-file .env emover
```

---

## ✅ TESTING

### Test Structure

**Location:** Tests should be in `src/**/*.test.ts`  
**Framework:** Vitest  
**Run:** `npm test`

### Example Test

```typescript
// src/config.test.ts
import { describe, it, expect } from 'vitest';
import { validateConfig } from './config';

describe('validateConfig', () => {
  it('should throw on missing SOURCE_EMAIL', () => {
    expect(() => {
      validateConfig(
        { email: '', password: 'p', host: 'h', port: 995, protocol: 'pop3' },
        { email: 'd', password: 'p', host: 'h', port: 587, useTls: true }
      );
    }).toThrow();
  });
});
```

---

## 🔍 DEBUGGING

### Enable Debug Logging

```bash
LOG_LEVEL=debug npm run dev
```

### Common Issues & Solutions

**Issue:** "Authentication failed"

- Check credentials in `.env`
- Verify email provider settings
- Use app-specific passwords (Gmail, Office365)

**Issue:** "Connection timeout"

- Verify HOST and PORT are correct
- Check firewall/network access
- Ensure TLS settings match provider

**Issue:** "No emails found"

- Verify SOURCE_MAILBOX exists
- Check email account has messages
- Try different mailbox name

**Issue:** "Email send failed"

- Verify DEST_* credentials
- Check destination account quota
- Verify SMTP server settings

### Log Locations

- **Console:** All logs output to stdout
- **Format:** JSON (structured) or pretty-printed
- **Levels:** debug, info, warn, error

---

## 🎯 NEXT STEPS & ROADMAP

### Immediate Fixes (Priority: HIGH)

- [ ] Fix duplicate `openBox` call in `emailSource.ts`
- [ ] Add idempotency check to prevent duplicate migrations
- [ ] Add retry logic with exponential backoff
- [ ] Make TLS certificate validation configurable

### Short-term Improvements (Priority: MEDIUM)

- [ ] Implement batch processing for large mailboxes
- [ ] Add progress bar for long migrations
- [ ] Add email filtering (by date, sender, etc.)
- [ ] Add dry-run mode to preview migration
- [ ] Add resume capability for interrupted migrations

### Long-term Features (Priority: LOW)

- [ ] Web UI for configuration
- [ ] Database to track migration history
- [ ] Support for multiple source/destination pairs
- [ ] Scheduled migrations
- [ ] Email transformation/mapping
- [ ] Webhook notifications on completion

### Documentation Gaps

- [ ] Add API documentation
- [ ] Add troubleshooting guide
- [ ] Add performance tuning guide
- [ ] Add security best practices

---

## 📝 QUICK REFERENCE

### File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `src/index.ts` | Entry point | 1-37 |
| `src/types.ts` | Type definitions | 1-44 |
| `src/config.ts` | Config loader | 1-42 |
| `src/logger.ts` | Logging | 1-17 |
| `src/emailSource.ts` | IMAP/POP3 | 1-101 |
| `src/emailDestination.ts` | SMTP | 1-54 |
| `src/migrator.ts` | Orchestrator | 1-62 |
| `.env` | Credentials | N/A |
| `package.json` | Dependencies | 1-44 |

### Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Run in development
npm run build        # Compile TypeScript
npm start            # Run compiled version
npm test             # Run tests
npm run lint         # Check code quality
npm run format       # Format code
```

### Environment Variables

```bash
SOURCE_EMAIL         # Source email address
SOURCE_PASSWORD      # Source password
SOURCE_HOST          # POP/IMAP server
SOURCE_PORT          # POP/IMAP port (default: 995)
SOURCE_PROTOCOL      # pop3 or imap (default: pop3)
SOURCE_MAILBOX       # Mailbox name (default: INBOX)
DEST_EMAIL           # Destination email
DEST_PASSWORD        # Destination password
DEST_HOST            # SMTP server
DEST_PORT            # SMTP port (default: 587)
DEST_USE_TLS         # Use TLS (default: true)
LOG_LEVEL            # Log level (default: info)
```

---

**Last Updated:** 2025-11-09  
**Status:** ✅ Ready for Development  
**Next Action:** Install dependencies and configure `.env`

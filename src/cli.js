import yargs from "yargs";
import { hideBin } from "yargs";
import { createBackup } from './backup';
import { restoreBackup } from './restore';
import { logMessage, logError } from './utils/logger';

yargs(hideBin(process.argv))
  .scriptName('pralaya-db')
  .usage('$0 <command> [options]')
  .command(
    'backup',
    'Create a database backup',
    (yargs) => {
      return yargs
        .option('dbType', {
          alias: 'd',
          type: 'string',
          demandOption: true,
          describe: 'Type of database (mysql, postgres, mongodb, sqlite)',
        })
        .option('config', {
          alias: 'c',
          type: 'string',
          demandOption: true,
          describe: 'Path to JSON config file with database connection details',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          demandOption: true,
          describe: 'Output file path for the backup',
        });
    },
    async (argv) => {
      try {
        const config = require(argv.config);
        createBackup(argv.dbType, config, argv.output);
        logMessage(`Backup started for ${argv.dbType} database.`);
      } catch (err) {
        logError(err);
      }
    }
  )
  .command(
    'restore',
    'Restore a database from a backup',
    (yargs) => {
      return yargs
        .option('dbType', {
          alias: 'd',
          type: 'string',
          demandOption: true,
          describe: 'Type of database (mysql, postgres, mongodb, sqlite)',
        })
        .option('config', {
          alias: 'c',
          type: 'string',
          demandOption: true,
          describe: 'Path to JSON config file with database connection details',
        })
        .option('backup', {
          alias: 'b',
          type: 'string',
          demandOption: true,
          describe: 'Path to the backup file to restore from',
        });
    },
    async (argv) => {
      try {
        const config = require(argv.config);
        restoreBackup(argv.dbType, argv.backup, config);
        logMessage(`Restore started for ${argv.dbType} database.`);
      } catch (err) {
        logError(err);
      }
    }
  )
  .command(
    'schedule',
    'Schedule recurring database backups',
    (yargs) => {
      return yargs
        .option('cron', {
          alias: 'x',
          type: 'string',
          demandOption: true,
          describe: 'Cron expression for scheduling the backup',
        })
        .option('dbType', {
          alias: 'd',
          type: 'string',
          demandOption: true,
          describe: 'Type of database (mysql, postgres, mongodb, sqlite)',
        })
        .option('config', {
          alias: 'c',
          type: 'string',
          demandOption: true,
          describe: 'Path to JSON config file with database connection details',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          demandOption: true,
          describe: 'Output file path for the backup',
        });
    },
    (argv) => {
      try {
        const config = require(argv.config);
        const task = scheduleBackup(argv.cron, argv.dbType, config, argv.output);
        logMessage(`Backup scheduled for ${argv.dbType} database.`);
        console.log(
          'Use "CTRL+C" to exit, or manually stop the process when needed.'
        );
      } catch (err) {
        logError(err);
      }
    }
  )
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .demandCommand(1, 'You need to specify at least one command before moving on.')
  .epilog('Pralaya-DB: Reliable database backup and restore utility.')
  .argv;
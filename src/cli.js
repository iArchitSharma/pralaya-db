#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createBackup } from "./backup.js";
import { restoreBackup } from "./restore.js";
import { logMessage, logError } from "./utils/logger.js";
import fs from "fs";

/**
 * Load configuration file dynamically using fs.
 * @param {string} configPath - Path to the configuration JSON file.
 * @returns {object} Parsed configuration object.
 */
function loadConfig(configPath) {
  try {
    const rawData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    logError(`Error loading configuration file: ${err.message}`);
    process.exit(1); 
  }
}

yargs(hideBin(process.argv))
  .command(
    "backup",
    "Create a backup of the database",
    (yargs) => {
      yargs
        .option("dbType", { describe: "Database type", demandOption: true })
        .option("config", {
          describe: "Path to DB config file",
          demandOption: true,
        })
        .option("output", {
          describe: "Path for the backup file",
          demandOption: true,
        });
    },
    async (argv) => {
      try {
        const config = loadConfig(argv.config);
        await createBackup(argv.dbType, config, argv.output);
        logMessage(`Backup started for ${argv.dbType} database.`);
      } catch (err) {
        logError(err);
      }
    }
  )
  .command(
    "restore",
    "Restore a database from a backup",
    (yargs) => {
      yargs
        .option("dbType", { describe: "Database type", demandOption: true })
        .option("config", {
          describe: "Path to DB config file",
          demandOption: true,
        })
        .option("backup", {
          describe: "Path to the backup file",
          demandOption: true,
        });
    },
    async (argv) => {
      const config = loadConfig(argv.config);
      await restoreBackup(argv.dbType, argv.backup, config);
      logMessage(`Restore started for ${argv.dbType} database.`);
    }
  )
  .command(
    "schedule",
    "Schedule periodic database backups",
    (yargs) => {
      yargs
        .option("cron", { describe: "Cron expression", demandOption: true })
        .option("dbType", { describe: "Database type", demandOption: true })
        .option("config", {
          describe: "Path to DB config file",
          demandOption: true,
        })
        .option("output", {
          describe: "Path for the backup file",
          demandOption: true,
        });
    },
    async (argv) => {
      const config = loadConfig(argv.config);
      await scheduleBackup(argv.cron, argv.dbType, config, argv.output);
    }
  )
  .demandCommand(1, "You must provide a valid command.")
  .help().argv;

import pkg from 'pg';
const { Client } = pkg;
import { spawn } from 'child_process';

/**
 * Test the connection to the PostgreSQL database.
 * @param {Object} config - Database connection parameters.
 */
async function testConn(config) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('PostgreSQL connection successful.');
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
  } finally {
    await client.end();
  }
}

/**
 * @param {string} outputFile - Path for the backup file.
 * @param {Function} callback - Callback function to execute after the backup is complete.
 */
function createBackup(config, outputFile, callback) {
  const { host, port, user, password, database } = config;

  console.log('Starting PostgreSQL backup...');
  const backupCommand = spawn('pg_dump', [
    '-h', host,
    '-p', port,
    '-U', user,
    '-d', database,
    '-f', outputFile
  ], {
    env: {
      ...process.env, // Preserve existing environment variables
      PGPASSWORD: password
    }
  });

  backupCommand.stdout.on('data', (data) => {
    console.log(`Backup output: ${data}`);
  });

  backupCommand.stderr.on('data', (data) => {
    console.error(`Backup error: ${data}`);
  });

  backupCommand.on('close', (code) => {
    if (code === 0) {
      console.log('PostgreSQL backup successful:', outputFile);
      if(callback) callback();
    } else {
      console.error(`Backup process exited with code ${code}`);
    }
  });
}

/**
 * @param {string} backupFile - Path to the backup file.
 */
function restoreBackup(config, backupFile, callback) {
  const { host, port, user, password, database } = config;

  console.log('Starting PostgreSQL restore...');
  const restoreCommand = spawn('psql', [
    '-h', host,
    '-p', port,
    '-U', user,
    '-d', database,
    '-f', backupFile
  ], {
    env: {
      ...process.env,
      PGPASSWORD: password
    }
  });

  restoreCommand.stdout.on('data', (data) => {
    console.log(`Restore output: ${data}`);
  });

  restoreCommand.stderr.on('data', (data) => {
    console.error(`Restore error: ${data}`);
  });

  restoreCommand.on('close', (code) => {
    if (code === 0) {
      console.log('PostgreSQL restore successful.');
      if(callback) callback();
    } else {
      console.error(`Restore process exited with code ${code}`);
    }
  });
}

export default {
  testConn,
  createBackup,
  restoreBackup
};
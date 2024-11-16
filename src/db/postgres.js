import { Client } from 'pg';
import { exec } from 'child_process';

/**
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
 */
function createBackup(config, outputFile) {
  const { host, port, user, password, database } = config;
  
  
  const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} > ${outputFile}`;
  
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('PostgreSQL backup failed:', stderr || err.message);
    } else {
      console.log('PostgreSQL backup successful:', outputFile);
    }
  });
}

/**
 * @param {string} backupFile - Path to the backup file.
 */
function restoreBackup(config, backupFile) {
  const { host, port, user, password, database } = config;
  
  
  const command = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${user} -d ${database} < ${backupFile}`;
  
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('PostgreSQL restore failed:', stderr || err.message);
    } else {
      console.log('PostgreSQL restore successful.');
    }
  });
}

export default {
  testConn,
  createBackup,
  restoreBackup,
};

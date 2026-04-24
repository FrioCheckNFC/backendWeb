const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'friocheckdb.postgres.database.azure.com',
  port: 5432,
  user: 'friocheck_admin',
  password: 'Fr1o-Ch3ck',
  database: 'friocheckdb',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    const migrationPath = path.join(__dirname, 'migrations', '002_add_sector_id_to_machines.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Ejecutando migración...');
    await client.query(sql);
    console.log('✓ Migración ejecutada exitosamente');

  } catch (error) {
    console.error('Error al ejecutar migración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const migrationPath = path.join(__dirname, '..', 'migrations', '005_fix_user_role_enum.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await client.query(sql);

  const verify = await client.query(
    "SELECT data_type, udt_name FROM information_schema.columns WHERE table_name='users' AND column_name='role';",
  );

  console.log('Tipo actual de users.role:');
  console.log(JSON.stringify(verify.rows, null, 2));

  await client.end();
}

run().catch(async (error) => {
  console.error('Error ejecutando migracion:', error.message);
  process.exit(1);
});

require('dotenv').config();
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

  await client.query(`
    ALTER TABLE users
    ALTER COLUMN role DROP DEFAULT,
    ALTER COLUMN role TYPE text[]
    USING (
      CASE
        WHEN role IS NULL THEN NULL
        ELSE ARRAY[role::text]
      END
    ),
    ALTER COLUMN role SET DEFAULT '{VENDOR}'::text[];
  `);

  const verify = await client.query(
    "SELECT data_type, udt_name FROM information_schema.columns WHERE table_name='users' AND column_name='role';",
  );

  console.log('Tipo actual de users.role:');
  console.log(JSON.stringify(verify.rows, null, 2));

  await client.end();
}

run().catch((error) => {
  console.error('Error revirtiendo role a array:', error.message);
  process.exit(1);
});

import { createPool, createConnection } from 'mariadb';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = createPool({
    host:            process.env.DB_HOST,
    port:            Number(process.env.DB_PORT),
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,
    connectionLimit: 5
});

const migrate = async () => {
    const conn = await createConnection({
    host:            process.env.DB_HOST,
    port:            Number(process.env.DB_PORT),
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,
    multipleStatements: true
    });

    // Check if Tasks table already exists
    const rows = await conn.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'Tasks'`,
        [process.env.DB_NAME]
    );

    if (rows[0].count === 0n) {
        console.log('First run detected — running migration...');
        const schema = readFileSync(join(__dirname, '../database/schema.sql'), 'utf8');
        await conn.query(schema);
        console.log('Schema done.');

        const seed = readFileSync(join(__dirname, '../database/seed.sql'), 'utf8');
        await conn.query(seed);
        console.log('Seed done.');
    } else {
        console.log('DB already set up, skipping migration.');
    }

    await conn.end();
}

// Run migration then verify pool connection
migrate()
    .then(() => pool.getConnection())
    .then(conn => {
        console.log('DB connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('DB error:', err.message);
    });

export default pool;
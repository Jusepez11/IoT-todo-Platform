import { createPool } from 'mariadb';

const pool = createPool({
    host:            process.env.DB_HOST,
    port:            Number(process.env.DB_PORT),
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,
    connectionLimit: 5
});

pool.getConnection()
    .then(conn => {
        console.log('DB connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('DB connection failed:', err.message);
    });

export default pool;
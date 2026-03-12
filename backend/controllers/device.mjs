import pool from '../db.mjs';
import { respond } from '../middleware/response.mjs' ;

const table = "device";

export const handleDevice = async (event) => {
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    try {
        switch (method) {
            case 'GET':
                const id = path.split('/device/')[1];
                return id ? await get(id) : await getAll(event);
                
            case 'POST':
                return await create(event);

            case 'DELETE':
                return await remove(event);

            default:
               return respond(405, { message: 'Method not allowed' });
        }
    } catch (err) {
        console.error(err);
        return respond(500, { message: 'Internal server error' });
    }
}

const get = async (event) => {
    try{
        const { device_id } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM device WHERE device_id = ?', [device_id]
        );
        conn.release();
        return response(200, rows);
    } catch (error) {
        return response(400, error.message);
    }
}

const getAll = async (event) => {
    try{
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM device'        
        );
        conn.release();
        return response(200, rows);
    } catch (error) {
        return response(400, error.message);
    }
}


const create = async (event) => {
    try{
        const { device_id } = JSON.parse(event.body);
        const conn = await pool.getConnection();

        const existing = await conn.query(
            'SELECT * FROM Devices WHERE device_id = ?', [device_id]
        );
        if (existing.length > 0) {
            conn.release();
            return respond(200, { message: 'Device already registered' });
        }

        await conn.query(
            'INSERT INTO Devices (device_id) VALUES (?)', [device_id]
        );
        conn.release();
        return respond(201, { message: 'Device registered' });
    } catch (error) {
        return response(400, error.message);
    }
}

const remove = async (event) => {
    try{
        const { device_id } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'DELETE FROM device WHERE device_id = ?', [device_id]
        );
        conn.release();
        return response(200, { message: 'Device deleted'});
    } catch (error) {
        return response(400, error.message);
    }
}


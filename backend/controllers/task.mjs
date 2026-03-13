import pool from '../db.mjs';
import { respond } from '../middleware/response.mjs' ;

const table = "task";

export const handleTask = async (event) => {
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    try {
        switch (method) {
            case 'GET':
                //const id = path.split('/task/')[1];
                return await getALL(event);//id ? await get(id) : 

            case 'POST':
                return await create(event);

            case 'PUT':
                return await update(event);

            case 'PATCH':
                return await done(event);

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
        const { task_id, device_id } = event.queryStringParameters;
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM task WHERE device_id = ? and task_id = ?', [task_id, device_id]
        );
        conn.release();
        return respond(200, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}


const getAll = async (event) => {
    try{
        const { device_id } = event.queryStringParameters;
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM task WHERE device_id = ?', [device_id]
        );
        conn.release();
        return respond(200, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}

//to be integraded
const getALL = async (event) => {
    try{
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM task'        
        );
        conn.release();
        return respond(200, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}


const create = async (event) => {
    try{
        const { device_id, task_description,  due_date } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'INSERT INTO task (device_id, task_description, due_date) VALUES (?, ?, ?)', [device_id, task_description, due_date]
        );
        conn.release();
        return respond(201, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}

const update = async (event) => {
    try{
        const { device_id, task_description,  due_date } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'UPDATE task SET task_description = ?, due_date = ? WHERE device_id = ?', [task_description, due_date, device_id]
        );
        conn.release();
        return respond(200, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}

const done = async (event) => {
    try{
        const { task_id, is_complete } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'UPDATE task SET is_complete = ? WHERE task_id = ?', [is_complete, task_id]
        );
        conn.release();
        return respond(200, rows);
    } catch (error) {
        return respond(400, error.message);
    }
}

const remove = async (event) => {
    try{
        const { task_id } = JSON.parse(event.body);
        const conn = await pool.getConnection();
        const rows = await conn.query(
            'DELETE FROM task WHERE task_id = ?', [task_id]
        );
        conn.release();
        return respond(200, { message: 'Task deleted'});
    } catch (error) {
        return respond(400, error.message);
    }
}


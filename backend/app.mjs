import { handleTask } from './controllers/task.mjs';
import { handleDevice } from './controllers/device.mjs';

export const handler = async (event) => {
    const path = event.requestContext.http.path;
    const method = event.requestContext.http.method;

    console.log(`${method} ${path}`);

    if (path.startsWith('/task')) {
        return await handleTask(event);
    }

    if (path.startsWith('/device')) {
        return await handleDevice(event);
    }

    return {
        statusCode: 404,
        body: JSON.stringify({
            message: 'Route not found'
        })
    };
};
import express from 'express';
import { handler } from './index.mjs';

const app = express();
app.use(express.json());

app.use(async (req, res) => {
    const event = {
        requestContext: {
            http: {
                method: req.method,
                path: req.path
            }
        },
        queryStringParameters: req.query || {},
        body: req.body ? JSON.stringify(req.body) : null
    };

    const result = await handler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
});

app.listen(3000, () => console.log('Local server running on http://localhost:3000'));

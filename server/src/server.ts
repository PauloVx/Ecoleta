import express from 'express';

const app = express();

app.get('/users', (request, response) => {
    return response.json({
        msg: 'Hello World!',
        author: 'PauloVx',
        ok: true
    });
});

app.listen(3333);
import express from 'express';
import cors from 'cors';
import colmapRouter from './router/colmapRouter.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

//endpoint here to give the .zip file of video frames to <--------------------
app.use('/colmap-api', colmapRouter);

const port = 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};
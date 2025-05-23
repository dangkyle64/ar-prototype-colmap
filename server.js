import express from 'express';
import cors from 'cors';
import colmapRouter from './router/colmapRouter.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

let allowedOrigins = [];

if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
};

app.use(cors({
    origin: function (origin, callback) {
        console.log('Request Origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));  
        }
    },
    methods: ['POST'],  
    allowedHeaders: ['Content-Type', 'Authorization'],  
    credentials: true, 
}));

app.use(express.json());
app.use(express.static('public'));

app.use('/colmap-api', colmapRouter);

/*
app.get('/', async (request, response) => {
    try {
        await runPipeline();
        response.status(200).json({ message: 'Pipeline COLMAP successful '});
    } catch(error) {
        response.status(500).json({ error: 'Error loading pipeline' });
    };
});
*/

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};
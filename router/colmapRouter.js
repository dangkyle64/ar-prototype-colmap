import express from 'express';
import multer from 'multer';
import { colmapController } from '../controller/colmapController.js';

const storage = multer.memoryStorage();
const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: MAX_SIZE_BYTES,
    },
});

const colmapRouter = express.Router();

colmapRouter.post('/', upload.single('zip'), colmapController);

export default colmapRouter;
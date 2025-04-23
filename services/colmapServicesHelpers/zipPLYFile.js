import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createOutputStream } from './zipPLYFileHelpers/createOutputStream.js';
import { handleOutputErrors } from './zipPLYFileHelpers/handleOutputErrors.js';
import { uploadZippedDirectory } from './zipPLYFileHelpers/uploadZippedDirectory.js';
import { createZipArchive } from './zipPLYFileHelpers/createZipArchive.js';

dotenv.config();

export const zipPlyDirectory = (sourceDir, outputPath) => {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(sourceDir)) {
            return reject(new Error(`Source directory does not exist: ${sourceDir}`));
        };
        
        const zipDir = path.dirname(outputPath);
        fs.mkdirSync(zipDir, { recursive: true });

        console.log('[zipPlyDirectory] Output path being used for zip file:', outputPath);
        const output = createOutputStream(outputPath, reject);

        output.on('error', handleOutputErrors(reject));

        output.on('close', () => {

            const apiUrl = process.env.BACKEND_ENDPOINT;

            console.log(`ZIP complete.`);
            console.log('OutputPath: ', outputPath);
            uploadZippedDirectory(outputPath, apiUrl)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(new Error(`Upload failed: ${err.message}`));
            });
        });

        createZipArchive(sourceDir, reject, output);
    });
};

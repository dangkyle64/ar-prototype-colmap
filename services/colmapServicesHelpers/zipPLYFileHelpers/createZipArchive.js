import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { handleArchiveError } from './handleArchiveError.js';

export const createZipArchive = (sourceDir, reject, output) => {
    let archive;
    try {
        archive = archiver('zip', { zlib: { level: 9 } });
    } catch (error) {
        return reject(new Error(`Failed to create archive: ${error.message}`));
    };

    archive.pipe(output);
    archive.on('error', handleArchiveError(reject));

    fs.readdirSync(sourceDir).forEach(file => {
        const fullPath = path.join(sourceDir, file);

        if (file.endsWith('.ply.vis')) {
            return;
        };  

        archive.file(fullPath, { name: file });
    });

    archive.finalize();
};


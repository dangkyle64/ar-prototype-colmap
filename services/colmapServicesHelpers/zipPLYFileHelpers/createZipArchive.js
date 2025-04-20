import archiver from 'archiver';
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
    archive.directory(sourceDir, false);
    archive.finalize();
};


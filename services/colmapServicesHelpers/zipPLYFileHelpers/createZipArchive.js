import archiver from 'archiver';
import { handleArchiveError } from './handleArchiveError.js';

export const createZipArchive = (sourceDir, reject, output) => {
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.on('error', handleArchiveError(reject));
    archive.directory(sourceDir, false);
    archive.finalize();
};
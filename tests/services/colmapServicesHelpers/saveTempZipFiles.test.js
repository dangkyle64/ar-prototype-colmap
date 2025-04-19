import fs from 'fs';
import path from 'path';

import { PassThrough } from 'stream';
import { saveTempZipFiles } from '../../../services/colmapServicesHelpers/saveTempZipFiles';

vi.mock('fs');

describe('saveTempZipFiles', () => {
    const mockWriteStream = new PassThrough();

    beforeEach(() => {
        vi.resetAllMocks();
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
        fs.createWriteStream.mockReturnValue(mockWriteStream);
    });

    it('should sanitize and save the file correctly', async () => {
        const mockStream = new PassThrough();
        const fileEntry = {
            path: '../../evil.jpg',
            stream: () => mockStream
        };

        const expectedPath = path.join('images', 'evil.jpg');

        const finished = new Promise((resolve) => {
            mockWriteStream.on('finish', resolve);
        });

        const savePromise = saveTempZipFiles(fileEntry, 'images');

        mockStream.pipe(mockWriteStream);
        mockStream.emit('end');
        mockWriteStream.emit('finish');

        await finished;
        await savePromise;

        expect(fs.existsSync).toHaveBeenCalledWith('images');
        expect(fs.mkdirSync).toHaveBeenCalledWith('images', { recursive: true });
        expect(fs.createWriteStream).toHaveBeenCalledWith(expectedPath);
    });
});

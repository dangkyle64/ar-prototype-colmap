import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processZipFile, saveTempZipFiles } from '../../services/colmapServices.js';
import { PassThrough } from 'stream';

vi.mock('unzipper');

describe('processZipFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if ZIP is empty', async () => {
        unzipper.Open.buffer.mockResolvedValue({
            files: []
        });

        const result = await processZipFile(Buffer.from('fake'));

        expect(result.status).toBe(400);
        expect(result.error).toBe('Uploaded ZIP is empty ');
    });

    it('should return 200 and log file paths if ZIP contains files', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        unzipper.Open.buffer.mockResolvedValue({
            files: [
                { type: 'File', path: 'frame001.jpg' },
                { type: 'File', path: 'frame002.jpg' },
            ]
        });

        const result = await processZipFile(Buffer.from('fake'));

        expect(result.status).toBe(200);
        expect(result.message).toBe('ZIP processed successfully');

        consoleSpy.mockRestore();
    });

    it('should ignore non-File entries in the ZIP', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        unzipper.Open.buffer.mockResolvedValue({
            files: [
                { type: 'Directory', path: 'folder/' },
                { type: 'File', path: 'image.jpg' },
            ]
        });

        const result = await processZipFile(Buffer.from('fake'));

        expect(result.status).toBe(200);
        expect(result.message).toBe('ZIP processed successfully');

        consoleSpy.mockRestore();
    });

    it('should return 500 if unzipper throws', async () => {
        unzipper.Open.buffer.mockRejectedValue(new Error('zip broke'));

        const result = await processZipFile(Buffer.from('fake'));

        expect(result.status).toBe(500);
        expect(result.error).toBe('Error processing ZIP');
    });
});

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

        // Start the file save
        const savePromise = saveTempZipFiles(fileEntry, 'images');

        // Simulate data flow + end the stream
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

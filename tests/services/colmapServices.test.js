import unzipper from 'unzipper';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processZipFile } from '../../services/colmapServices.js';


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


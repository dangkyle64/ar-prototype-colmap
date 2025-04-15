import { describe, it, expect, vi } from 'vitest';
import { processZipFile } from '../../services/colmapServices.js';
import { colmapController } from '../../controller/colmapController.js';

vi.mock('../../services/colmapServices.js');

describe('colmapController', () => {
    it('should return 400 if no file is uploaded', async () => {
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        await colmapController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    it('should return error from processZipFile when service fails', async () => {
        const req = {
            file: { buffer: Buffer.from('fake zip') }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        processZipFile.mockResolvedValue({
            status: 400,
            error: 'Uploaded ZIP is empty.'
        });

        await colmapController(req, res);

        expect(processZipFile).toHaveBeenCalledWith(req.file.buffer);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Uploaded ZIP is empty.' });
    });

    it('should return 200 and success message on valid zip', async () => {
        const req = {
            file: { buffer: Buffer.from('valid zip') }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        processZipFile.mockResolvedValue({
            status: 200,
            message: 'ZIP processed successfully.'
        });

        await colmapController(req, res);

        expect(processZipFile).toHaveBeenCalledWith(req.file.buffer);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'ZIP processed successfully.' });
    });

    it('should return 500 if controller itself throws', async () => {
        const req = {
            file: { buffer: Buffer.from('valid zip') }
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        processZipFile.mockRejectedValue(new Error('Unexpected'));

        await colmapController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
});

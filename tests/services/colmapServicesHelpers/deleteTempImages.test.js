import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTempImages } from '../../../services/colmapServicesHelpers/deleteTempImages';

import fs from 'fs';

vi.mock('fs');
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return {
        ...actual,
        join: vi.fn((...args) => actual.join(...args)),
    };
});

describe('deleteTempImages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should resolve if directory does not exist', async () => {
        fs.existsSync.mockReturnValue(false);

        const result = await deleteTempImages('images');
        expect(result).toEqual({ status: 200, message: 'No temp images to delete.' });
        expect(fs.existsSync).toHaveBeenCalledWith('images');
    });

    it('should delete all files in the directory', async () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdir.mockImplementation((_, cb) => cb(null, ['file1.jpg', 'file2.png']));
        vi.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);


        const result = await deleteTempImages('images');

        expect(fs.readdir).toHaveBeenCalled();
        expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ status: 200, message: 'Temp images deleted successfully.' });
    });

    it('should reject if reading directory fails', async () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdir.mockImplementation((_, cb) => cb(new Error('Read error'), null));

        await expect(deleteTempImages('images')).rejects.toThrow('Failed to read directory: Read error');
    });

    it('should reject if deleting one or more files fails', async () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdir.mockImplementation((_, cb) => cb(null, ['file1.jpg']));
        vi.spyOn(fs.promises, 'unlink').mockRejectedValue(new Error('Delete error'));

        await expect(deleteTempImages('images')).rejects.toThrow('Failed to delete one or more files: Delete error');
    });
});

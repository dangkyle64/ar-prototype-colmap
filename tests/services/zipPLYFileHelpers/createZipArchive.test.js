import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import { createZipArchive } from '../../../services/colmapServicesHelpers/zipPLYFileHelpers/createZipArchive.js';
import { handleArchiveError } from '../../../services/colmapServicesHelpers/zipPLYFileHelpers/handleArchiveError.js';

import archiver from 'archiver';
import fs from 'fs';


vi.mock('../../../services/colmapServicesHelpers/zipPLYFileHelpers/handleArchiveError.js', () => ({
    handleArchiveError: vi.fn()
}));

vi.mock('archiver', () => ({
    default: vi.fn()
}));

vi.mock('fs', () => ({
    default: {
        readdirSync: vi.fn(),
    },
}));

describe('createZipArchive', () => {
    let archiveMock;
    let outputStream;
    let rejectMock;

    beforeEach(() => {
        outputStream = new PassThrough();
        rejectMock = vi.fn();

        archiveMock = {
            pipe: vi.fn(),
            on: vi.fn(),
            file: vi.fn(),
            finalize: vi.fn()
        };

        archiver.mockReturnValue(archiveMock);

        fs.readdirSync.mockReturnValue([
            'fused.ply',
            'fused.ply.vis',
        ]);
    });

    it('should correctly create and finalize a zip archive', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);

        expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
        expect(archiveMock.pipe).toHaveBeenCalledWith(outputStream);
        expect(archiveMock.file).toHaveBeenCalled();
        expect(archiveMock.finalize).toHaveBeenCalled();
    });

    it('should attach error handler from handleArchiveError', () => {
        const mockErrorHandler = vi.fn();
        handleArchiveError.mockReturnValue(mockErrorHandler);

        createZipArchive('/some/dir', rejectMock, outputStream);

        expect(handleArchiveError).toHaveBeenCalledWith(rejectMock);
        expect(archiveMock.on).toHaveBeenCalledWith('error', mockErrorHandler);
    });

    it('should trigger the error handler when archive emits an error', () => {
        const fakeError = new Error('oops');
        const mockErrorHandler = vi.fn();
        handleArchiveError.mockReturnValue(mockErrorHandler);

        createZipArchive('/some/dir', rejectMock, outputStream);

        const onErrorCallback = archiveMock.on.mock.calls.find(
        ([event]) => event === 'error'
        )[1];

        onErrorCallback(fakeError);

        expect(mockErrorHandler).toHaveBeenCalledWith(fakeError);
    });

    it('should not call reject on successful archive creation', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(rejectMock).not.toHaveBeenCalled();
    });

    it('should call reject if archiver throws during creation', () => {
        archiver.mockImplementation(() => {
            throw new Error('Archiver broke');
        });
    
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(rejectMock).toHaveBeenCalledWith(expect.any(Error));
        expect(rejectMock.mock.calls[0][0].message).toMatch(/Archiver broke/);
    });
    
    it('should not call directory or finalize if archiver fails', () => {
        archiver.mockImplementation(() => {
            throw new Error('Archiver broke');
        });
    
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(archiveMock.file).not.toHaveBeenCalled();
        expect(archiveMock.finalize).not.toHaveBeenCalled();
    });
    
    it('should initialize archiver with correct compression settings', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);

        expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    });
});

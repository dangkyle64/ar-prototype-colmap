import unzipper from 'unzipper';
import { runPipeline } from '../docker_services/colmapPipeline.js';
import { saveTempZipFiles } from './colmapServicesHelpers/saveTempZipFiles.js';
import { deleteTempImages } from './colmapServicesHelpers/deleteTempImages.js';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);

        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty '};
        };

        for (const fileEntry of directory.files) {
            if (fileEntry.type === 'File') {
                await saveTempZipFiles(fileEntry);
            };
        };

        //await runPipeline();

        deleteTempImages();

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};
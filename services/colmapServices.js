import unzipper from 'unzipper';
import path from 'path';
import { runPipeline } from '../docker_services/colmapPipeline.js';
import { saveTempZipFiles } from './colmapServicesHelpers/saveTempZipFiles.js';
import { deleteTempImages } from './colmapServicesHelpers/deleteTempImages.js';
import { zipPlyDirectory } from './colmapServicesHelpers/zipPLYFile.js';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);
        
        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty '};
        };
        /*
        for (const fileEntry of directory.files) {
            if (fileEntry.type === 'File') {
                await saveTempZipFiles(fileEntry);
            };
        };

        await runPipeline();

        deleteTempImages('images');
        */
        await zipPlyDirectory(
            path.resolve('./colmap_output/fused_output'),
            path.resolve('./zipped_fused_output/fused.zip')
        );

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};
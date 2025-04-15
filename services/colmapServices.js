import path from 'path';
import fs from 'fs';
import unzipper from 'unzipper';

export const saveTempZipFiles = async (fileEntry, outputDirectory = 'images') => {

    try {
         // sanitize filename just in case
        const safeFilename = path.basename(fileEntry.path);
        const savePath = path.join(outputDirectory, safeFilename);

        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }

        const writeStream = fs.createWriteStream(savePath);

        await new Promise((resolve, reject) => {
            fileEntry.stream()
                .pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log(`Saved: ${safeFilename}`);

        return { status: 200, message: 'Temp files saved successfully' };
    } catch(error) {
        return { status: 500, error: 'Server Error' };
    };
};

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

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};


import unzipper from 'unzipper';

export const colmapController = async (request, response) => {
    try {
        console.log('colmapController hit');

        if (!request.file) {
            return response.status(400).json({ error: 'No file uploaded' });
        };

        const zipBuffer = request.file.buffer;
        const directory = await unzipper.Open.buffer(zipBuffer);

        for (const fileEntry of directory.files) {
            if (fileEntry.type === 'File') {
                console.log(`Extracting: ${fileEntry.path}`);
            };
        };

        return response.status(200).json({ message: 'ZIP processed successfully' });
    } catch(error) {
        console.log(error);
    };
};

/**
 * 
Empty ZIP?

Unsupported file types?

Duplicate paths?
 */
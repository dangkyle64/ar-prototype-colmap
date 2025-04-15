import unzipper from 'unzipper';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);

        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty '};
        };

        for (const fileEntry of directory.files) {
            if (fileEntry.type === 'File') {
                console.log(`Extracting: ${fileEntry.path}`);
            };
        };

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};
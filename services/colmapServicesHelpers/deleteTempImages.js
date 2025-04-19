import fs from 'fs';
import path from 'path';

export const deleteTempImages = (directory = 'images') => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(directory)) {
            return resolve({ status: 200, message: 'No temp images to delete.' });
        };

        fs.readdir(directory, (err, files) => {
            if (err) return reject(new Error(`Failed to read directory: ${err.message}`));

            Promise.all(
                files.map((file) => {
                    const filePath = path.join(directory, file);
                    return fs.promises.unlink(filePath);
                })
            )
            .then(() => {
                console.log(`All files in '${directory}' deleted.`);
                resolve({ status: 200, message: 'Temp images deleted successfully.' });
            })
            .catch((deleteErr) => {
                reject(new Error(`Failed to delete one or more files: ${deleteErr.message}`));
            });
        });
    });
};
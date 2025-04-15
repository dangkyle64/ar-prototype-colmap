import { processZipFile } from "../services/colmapServices.js";

export const colmapController = async (request, response) => {
    try {
        if (!request.file) {
            return response.status(400).json({ error: 'No file uploaded' });
        };

        const zipBuffer = request.file.buffer;
        const result = await processZipFile(zipBuffer);

        if (result.error) {
            return response.status(result.status).json({ error: result.error });
        };

        return response.status(result.status).json({ message: result.message });
    } catch(error) {
        console.log(error);
        return response.status(500).json({ error: 'Server error' });
    };
};
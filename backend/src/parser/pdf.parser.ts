import fs from 'fs';
import pdfParse from 'pdf-parse';

export class PdfParser {
    /**
     * Extracts raw text from a PDF file located at the given path.
     * @param filePath Absolute or relative path to the PDF file.
     * @returns The extracted raw text string.
     */
    static async parse(filePath: string): Promise<string> {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } catch (error: any) {
            console.error(`Error parsing PDF at ${filePath}:`, error);
            // By prefixing it, the controller knows this was a known parsing failure
            // and we append the exact error message so the user sees exactly what failed.
            throw new Error(`PARSE_ERROR: ${error.message || 'Unknown parsing failure'}`);
        }
    }
}

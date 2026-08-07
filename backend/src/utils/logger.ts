import * as fs from 'fs';
import * as path from 'path';

/**
 * Lightweight Logging Utility organically isolating trace bounds synchronously capturing outputs elegantly natively.
 */
export class Logger {
    private static logFilePath: string;

    static {
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const now = new Date();
        const timestamp = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0') + '-' +
            String(now.getSeconds()).padStart(2, '0');

        this.logFilePath = path.join(logsDir, `${timestamp}.log`);

        const initMessage = `=====================================\nLogging Initialized\nLog File:\nlogs/${timestamp}.log\n=====================================\n`;
        console.log(initMessage);
        fs.writeFileSync(this.logFilePath, initMessage + '\n', 'utf8');
    }

    /**
     * Appends entries securely preserving single timestamps elegantly natively.
     */
    static log(message: string): void {
        const now = new Date();
        const timestamp = `[${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;

        const timestampedMessage = `${timestamp}\n${message}`;

        // Print to console identical to prior requirements natively seamlessly
        console.log(timestampedMessage);

        // Append gracefully natively mapping string structures seamlessly natively
        fs.appendFileSync(this.logFilePath, timestampedMessage + '\n\n', 'utf8');
    }
}

export class CustomLogger {
  static info(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] => ${message}`, context ? JSON.stringify(context) : '');
  }

  static warn(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    console.warn(`[INFO] [${timestamp}] => ${message}`, context ? JSON.stringify(context) : '');
  }  

  static error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] => ${message}`, error || '');
  }
}

// 🔑 Chave de persistência na memória do navegador
const DEBUG_KEY = '@erpmagico:debug_mode';

class FrontendCustomLogger {
    // Ativa por padrão em ambiente de desenvolvimento (Vite)
    private isDebugEnabled(): boolean {
        const stored = localStorage.getItem(DEBUG_KEY);
        if (stored !== null) return stored === 'true';
        return import.meta.env.DEV; // Fallback automático para true se estiver em npm run dev
    }

    // Ativa ou desativa o modo debug dinamicamente pelo console do navegador
    public setDebugMode(enabled: boolean): void {
        localStorage.setItem(DEBUG_KEY, String(enabled));
        console.info(`[Logger] Modo Debug alterado para: ${enabled ? 'ATIVADO 🟢' : 'DESATIVADO 🔴'}`);
    }

    public get debugActive(): boolean {
        return localStorage.getItem(DEBUG_KEY) !== null;
    }

    public info(message: string, ...optionalParams: any[]): void {
        if (this.isDebugEnabled()) {
            console.log(
                `%c[INFO] [${new Date().toLocaleTimeString()}] => ${message}`,
                'color: #6366f1; font-weight: bold;',
                ...optionalParams
            );
        }
    }

    public warn(message: string, ...optionalParams: any[]): void {
        if (this.isDebugEnabled()) {
            console.warn(
                `%c[WARN] [${new Date().toLocaleTimeString()}] => ${message}`,
                'color: #f59e0b; font-weight: bold;',
                ...optionalParams
            );
        }
    }

    public error(message: string, error?: any): void {
        // 🛡️ Erros críticos SEMPRE são impressos para diagnóstico, mas com layout corporativo
        console.error(
            `%c[ERROR] [${new Date().toLocaleTimeString()}] => ${message}`,
            'color: #ef4444; font-weight: bold;',
            error || ''
        );
    }
}

export const CustomLogger = new FrontendCustomLogger();

// ✨ TRUQUE OPERACIONAL: Expõe o ativador globalmente no objeto window para você testar no navegador
(window as any).toggleERPDebug = (enabled: boolean) => CustomLogger.setDebugMode(enabled);
(window as any).isDebugActive = () => CustomLogger.debugActive;

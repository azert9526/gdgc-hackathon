export interface Message {
    role: 'user' | 'assistant';
    text: string;
    time: string;
    maskedText?: string;
    redactedEntities?: Record<string, string>;
}

export interface ThemeProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}
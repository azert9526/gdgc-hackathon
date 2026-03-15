import { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Type a message..."
            />
            <button disabled={isLoading} type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span>Send</span>
                <span className="material-symbols-outlined text-sm">send</span>
            </button>
        </form>
    );
};

export default ChatInput;
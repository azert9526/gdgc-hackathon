import type {Message} from "../../types/chat.ts";

interface ChatMessageProps {
    msg: Message;
}

const ChatMessage = ({ msg }: ChatMessageProps) => {
    // Helper: Escapes special characters
    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Helper: Highlights sensitive data
    const renderHighlightedText = (text: string, entities?: Record<string, string>) => {
        if (!entities || Object.keys(entities).length === 0) return text;

        const sensitiveValues = Object.values(entities);
        const regex = new RegExp(`(${sensitiveValues.map(escapeRegExp).join('|')})`, 'g');
        const parts = text.split(regex);

        return parts.map((part, i) => {
            const tag = Object.keys(entities).find(k => entities[k] === part);
            if (tag) {
                return (
                    // 1. Added 'group' and 'relative' to the parent wrapper
                    <span
                        key={i}
                        className="group relative inline-block bg-red-100 dark:bg-red-900/40
                            text-red-800 dark:text-red-200 px-1 rounded font-medium border
                             border-red-200 dark:border-red-800 transition-colors hover:bg-red-200
                             dark:hover:bg-red-800/60"
                    >
                        {part}

                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2
                                       rounded-lg bg-slate-800 dark:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-lg
                                       opacity-0 translate-y-2 scale-95
                                       group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                                       transition-all duration-200 ease-out z-50">{tag}

                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-100" />
                        </span>
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const isUser = msg.role === 'user';

    return (
        <div className={`rounded-lg p-3 max-w-[75%] shadow-sm ${isUser ? 
            'bg-primary/10 border border-primary/20 text-slate-900 dark:text-white self-end' : 
            'dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 self-start'}`}>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {renderHighlightedText(msg.text, msg.redactedEntities)}
            </div>
        </div>
    );
};

export default ChatMessage;
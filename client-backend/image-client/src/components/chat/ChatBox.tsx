
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type {Message} from "../../types/chat.ts";

interface ChatBoxProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const ChatBox = ({ messages, onSendMessage, isLoading }: ChatBoxProps) => {
    return (
        // 1. Make the outer container a flex column that takes up the full height
        <div className="flex flex-col h-full">

            {/* Message List */}
            {/* 2. flex-1 pushes the input down, overflow-y-auto makes only THIS area scroll */}
            {/* I also removed mb-4 so you don't have a weird gap at the bottom */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <ChatMessage key={idx} msg={msg} />
                ))}

                {isLoading && (
                    <div className="text-sm text-slate-500 flex items-center gap-2 self-start bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-3 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        Sanitizing & processing...
                    </div>
                )}
            </div>

            {/* Input Form */}
            {/* 3. Wrap it in a div with some padding so it doesn't touch the very edges of the screen */}
            <div className="p-4 shrink-0 bg-transparent">
                <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default ChatBox;
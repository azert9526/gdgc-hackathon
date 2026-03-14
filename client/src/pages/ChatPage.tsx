import { useState } from 'react';
import Header from '../components/chat/Header.tsx';
import ChatBox from '../components/chat/ChatBox.tsx';
import type {Message, ThemeProps} from '../types/chat';

const ChatPage = ({ theme, onToggleTheme }: ThemeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', text, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].maskedText = data.masked_prompt;
        newMessages[newMessages.length - 1].redactedEntities = data.redacted_entities;
        return newMessages;
      });

      const assistantMessage: Message = {
        role: 'assistant',
        text: data.final_response,
        time: new Date().toLocaleTimeString(),
        redactedEntities: data.redacted_entities
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: "Error connecting to the Privacy Proxy. Is your FastAPI server running on port 8000?",
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="h-[calc(100vh-84px)]">
        <Header theme={theme} onToggleTheme={onToggleTheme} />
        <ChatBox messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
  );
};

export default ChatPage;
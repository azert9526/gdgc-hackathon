import { useEffect, useState } from 'react';
import Header from '../components/chat/Header.tsx';
import ChatBox from '../components/chat/ChatBox.tsx';
import type { Message, ThemeProps } from '../types/chat';

interface ChatPageProps extends ThemeProps {
  sessionKey: string;
}

const ChatPage = ({ theme, onToggleTheme, sessionKey }: ChatPageProps) => {
  const storageKey = `privacy-chat-${sessionKey}`;

  const createInitialMessages = (): Message[] => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (error) {
        console.error("Failed to parse local storage messages", error);
      }
    }
    return [];
  };

  const [messages, setMessages] = useState<Message[]>(createInitialMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Message[];
        setMessages(Array.isArray(parsed) ? parsed : []);
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = { 
      role: 'user', 
      text, 
      time: new Date().toLocaleTimeString() 
    };
    
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
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].role === 'user') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            maskedText: data.masked_prompt,
            redactedEntities: data.redacted_entities
          };
        }
        return updated;
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
    <div className="h-[calc(100vh-84px)] bg-background-light dark:bg-background-dark">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="mx-auto w-full max-w-4xl p-4">
        <ChatBox 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default ChatPage;
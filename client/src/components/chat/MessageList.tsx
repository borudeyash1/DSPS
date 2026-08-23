import { useEffect, useRef } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
    messages: Array<{
        id: string;
        sender: 'user' | 'bot' | 'agent';
        content: string;
        timestamp: Date;
        type?: 'text' | 'quick-reply' | 'card';
        quickReplies?: string[];
    }>;
    isTyping: boolean;
    onQuickReply: (reply: string) => void;
}

export const MessageList = ({ messages, isTyping, onQuickReply }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Date separator */}
            <div className="flex justify-center">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                    Today
                </span>
            </div>

            {/* Messages */}
            {messages.map((message) => (
                <Message
                    key={message.id}
                    message={message}
                    onQuickReply={onQuickReply}
                />
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};

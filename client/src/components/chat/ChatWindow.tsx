import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useState, useEffect } from 'react';

interface ChatWindowProps {
    onClose: () => void;
}

interface Message {
    id: string;
    sender: 'user' | 'bot' | 'agent';
    content: string;
    timestamp: Date;
    type?: 'text' | 'quick-reply' | 'card';
    quickReplies?: string[];
}

export const ChatWindow = ({ onClose }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Initialize with welcome message
    useEffect(() => {
        const welcomeMessage: Message = {
            id: '1',
            sender: 'bot',
            content: "👋 Hi, I am BOTAM AI - your friendly shopping assistant!\n\nI can help you with your orders, product recommendations and even connect you with a live agent.",
            timestamp: new Date(),
            type: 'text',
        };

        const followUpMessage: Message = {
            id: '2',
            sender: 'bot',
            content: "What can I help you with today?",
            timestamp: new Date(),
            type: 'quick-reply',
            quickReplies: ['Manage my Order', 'FAQs', 'Talk to Live Agent'],
        };

        setTimeout(() => {
            setMessages([welcomeMessage]);
            setTimeout(() => {
                setMessages(prev => [...prev, followUpMessage]);
            }, 500);
        }, 300);
    }, []);

    const handleSendMessage = (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content,
            timestamp: new Date(),
            type: 'text',
        };

        setMessages(prev => [...prev, userMessage]);

        // Simulate bot typing
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: "Thanks for your message! I'm still learning. How else can I help you?",
                timestamp: new Date(),
                type: 'quick-reply',
                quickReplies: ['Manage my Order', 'FAQs', 'Talk to Live Agent'],
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    const handleQuickReply = (reply: string) => {
        handleSendMessage(reply);
    };

    return (
        <div className="w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <ChatHeader onClose={onClose} />

            {/* Messages */}
            <MessageList
                messages={messages}
                isTyping={isTyping}
                onQuickReply={handleQuickReply}
            />

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} />

            {/* Powered by */}
            <div className="px-4 py-2 text-center text-xs text-gray-500 border-t">
                Powered by Your E-Commerce Platform
            </div>
        </div>
    );
};

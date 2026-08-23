import { useState } from 'react';
import { Send, Paperclip, Home } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t bg-white p-4">
            <div className="flex items-center gap-2">
                {/* Home button */}
                <button
                    type="button"
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Home"
                >
                    <Home className="w-5 h-5" />
                </button>

                {/* Input field */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {/* Attachment button */}
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full transition-colors"
                        aria-label="Attach file"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>
                </div>

                {/* Send button */}
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

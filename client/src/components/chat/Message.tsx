interface MessageProps {
    message: {
        id: string;
        sender: 'user' | 'bot' | 'agent';
        content: string;
        timestamp: Date;
        type?: 'text' | 'quick-reply' | 'card';
        quickReplies?: string[];
    };
    onQuickReply: (reply: string) => void;
}

export const Message = ({ message, onQuickReply }: MessageProps) => {
    const isUser = message.sender === 'user';
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Avatar for bot */}
                {!isUser && (
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                            <img
                                src="https://ui-avatars.com/api/?name=Bot&background=F5A623&color=000&size=32"
                                alt="Bot"
                                className="w-full h-full rounded-full"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            {/* Message bubble */}
                            <div className={`px-4 py-3 rounded-2xl ${isUser
                                    ? 'bg-orange-100 text-black rounded-br-sm'
                                    : 'bg-gray-200 text-black rounded-bl-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {/* Quick replies */}
                            {message.type === 'quick-reply' && message.quickReplies && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {message.quickReplies.map((reply, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onQuickReply(reply)}
                                            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-black text-sm rounded-full transition-colors border border-orange-200"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* User message */}
                {isUser && (
                    <div className={`px-4 py-3 rounded-2xl ${isUser
                            ? 'bg-orange-100 text-black rounded-br-sm'
                            : 'bg-gray-200 text-black rounded-bl-sm'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                )}

                {/* Timestamp */}
                <span className={`text-xs text-gray-500 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

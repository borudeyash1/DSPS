export const TypingIndicator = () => {
    return (
        <div className="flex justify-start">
            <div className="flex items-start gap-2">
                {/* Bot avatar */}
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <img
                        src="https://ui-avatars.com/api/?name=Bot&background=F5A623&color=000&size=32"
                        alt="Bot"
                        className="w-full h-full rounded-full"
                    />
                </div>

                {/* Typing animation */}
                <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

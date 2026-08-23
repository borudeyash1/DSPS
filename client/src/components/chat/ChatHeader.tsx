import { X } from 'lucide-react';

interface ChatHeaderProps {
    onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
    return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img
                            src="https://ui-avatars.com/api/?name=Shopping+Assistant&background=F5A623&color=000"
                            alt="Assistant"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Name and status */}
                <div>
                    <h3 className="font-semibold text-base">BOTAM AI</h3>
                    <p className="text-xs opacity-90">Your Shopping Assistant</p>
                </div>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                aria-label="Close chat"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

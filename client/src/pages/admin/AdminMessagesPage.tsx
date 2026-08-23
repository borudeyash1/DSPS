import { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Reply } from 'lucide-react';
import api from '../../services/api';
import { useToastStore } from '../../store/toastStore';
import { format } from 'date-fns';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const AdminMessagesPage = () => {
    const { showToast } = useToastStore();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showReplyOptions, setShowReplyOptions] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contact');
            setMessages(response.data.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            showToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m._id !== id));
            showToast('Message deleted successfully', 'success');
            if (selectedMessage?._id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
            showToast('Failed to delete message', 'error');
        }
    };

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await api.patch(`/contact/${id}/read`, { isRead: true });
            setMessages(messages.map(m =>
                m._id === id ? { ...m, isRead: true } : m
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleReply = (message: ContactMessage, provider: string = 'default') => {
        const subject = `Re: ${message.subject} - Botam Apparels Support`;
        const body =
            `Hi ${message.name},

Thank you for contacting Botam Apparels.

[Write your reply here]

Best regards,
Botam Apparels Support Team

--------------------------------------------------
On ${format(new Date(message.createdAt), 'PPP p')}
${message.name} <${message.email}> wrote:

${message.message}`;

        let url = '';

        if (provider === 'gmail') {
            url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else if (provider === 'outlook') {
            url = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(message.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else if (provider === 'yahoo') {
            url = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(message.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else {
            // Default mailto
            url = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }

        window.open(url, '_blank');
    };

    const handleViewMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            handleMarkAsRead(message._id);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 h-[calc(100vh-theme(spacing.24))] flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-2xl font-bold">Messages</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Message List */}
                <div className="w-1/3 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Mail className="w-12 h-12 mb-2 opacity-20" />
                                <p>No messages found</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredMessages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        onClick={() => handleViewMessage(msg)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?._id === msg._id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                            } ${!msg.isRead ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-medium truncate pr-2 ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {msg.name}
                                            </h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {format(new Date(msg.createdAt), 'MMM d')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 truncate mb-1">{msg.subject}</p>
                                        <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail View */}
                <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                    {selectedMessage ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">{selectedMessage.subject}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">{selectedMessage.name}</span>
                                        <span>&lt;{selectedMessage.email}&gt;</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {format(new Date(selectedMessage.createdAt), 'PPpp')}
                                    </p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (showReplyOptions === selectedMessage._id) {
                                                setShowReplyOptions(null);
                                            } else {
                                                setShowReplyOptions(selectedMessage._id);
                                            }
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Reply via Email"
                                    >
                                        <Reply className="w-5 h-5" />
                                    </button>

                                    {showReplyOptions === selectedMessage._id && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                                            {[
                                                { id: 'default', label: 'Default App' },
                                                { id: 'gmail', label: 'Gmail' },
                                                { id: 'outlook', label: 'Outlook Web' },
                                                { id: 'yahoo', label: 'Yahoo Mail' }
                                            ].map(provider => (
                                                <button
                                                    key={provider.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReply(selectedMessage, provider.id);
                                                        setShowReplyOptions(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 block"
                                                >
                                                    {provider.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(selectedMessage._id, e)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Message"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                {selectedMessage.message}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Mail className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a message to read</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesPage;

import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Search, MessageCircle, Phone, Mail, Calendar, User, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  orderCount?: number;
}

const AdminWhatsAppPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      if (searchTerm) params.append('search', searchTerm);

      const response = await adminApi.get(`/admin/customers?${params.toString()}`);
      setUsers(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openChatModal = (user: User) => {
    if (!user.phone) {
      showToast('No phone number available for this user', 'error');
      return;
    }
    setSelectedUser(user);
    setMessage('');
    setIsModalOpen(true);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }
    if (!selectedUser?.phone) return;

    try {
      setSending(true);
      await adminApi.post('/admin/whatsapp/send', {
        phoneNumber: selectedUser.phone,
        message: message,
        userId: selectedUser._id
      });
      showToast('Message sent successfully', 'success');
      setIsModalOpen(false);
      setMessage('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="bg-white rounded-lg border border-gray-200 h-96"></div>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            WhatsApp Members
          </h1>
          <p className="text-gray-600">Connect with your customers directly on WhatsApp</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No members found matching your search' : 'No members found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 text-green-700">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Mail className="w-3.5 h-3.5 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-3.5 h-3.5 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {user.phone ? (
                             <button
                             onClick={() => openChatModal(user)}
                             className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors shadow-sm font-medium"
                           >
                             <MessageCircle className="w-4 h-4" />
                             Chat
                           </button>
                        ) : (
                            <span className="text-gray-400 text-sm italic">No Phone</span>
                        )}
                     
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded hover:bg-white disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded hover:bg-white disabled:opacity-50"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                   <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Message {selectedUser.fullName.split(' ')[0]}</h3>
                  <p className="text-xs text-gray-500">{selectedUser.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    ></textarea>
                     <p className="text-xs text-gray-500 mt-2">
                        Note: You can only send free-form messages if the user has messaged you in the last 24 hours. Otherwise, use a template (coming soon).
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsModalOpen(false)}
                         className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={sendMessage}
                        disabled={sending || !message.trim()}
                        className="px-6 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Send
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWhatsAppPage;

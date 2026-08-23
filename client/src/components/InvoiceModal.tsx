import React from 'react';
import { X } from 'lucide-react';
import Invoice from './Invoice';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    user: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order, user }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Invoice Content */}
                    <Invoice order={order} user={user} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;

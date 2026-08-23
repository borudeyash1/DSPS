import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
    // TODO: Replace with actual phone number and message
    const phoneNumber = '919552178287'; // Placeholder
    const message = encodeURIComponent('Hello! I visited your website and would like to know more about your products.');

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce-slow"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
        >
            <FaWhatsapp size={32} />
        </a>
    );
};

export default WhatsAppButton;

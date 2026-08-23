import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-lg text-gray-900">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQPage = () => {
    const faqs = [
        {
            question: "How do I track my order?",
            answer: "Once your order is shipped, you will receive a tracking ID via email/SMS. You can also track your order status in the 'My Orders' section of your account or use the 'Track Order' link in the footer."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Wallet payments. Cash on Delivery (COD) is available for eligible pin codes."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we only ship within India. We are working on expanding our services to international locations soon."
        },
        {
            question: "Can I cancel my order?",
            answer: "Yes, you can cancel your order before it has been shipped. Go to 'My Orders', select the order, and click 'Cancel'. If the order is already shipped, you can refuse delivery or initiate a return after receiving it."
        },
        {
            question: "What if I receive a defective product?",
            answer: "We have a strict quality check process, but if you receive a damaged product, please report it within 24 hours of delivery. We will arrange a free pickup and replacement."
        },
        {
            question: "How do I determine my size?",
            answer: "We have a detailed Size Guide available on every product page. We recommend measuring yourself and comparing it with our size chart for the best fit."
        },
    ];

    return (
        <div className="min-h-screen bg-white pt-12 pb-24">
            <div className="container-custom max-w-3xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-500">Find answers to common questions about your shopping experience</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                <div className="mt-16 text-center bg-blue-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <a href="/contact" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-block">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import axios from 'axios';

interface GenderSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({ isOpen, onClose }) => {
    const { user, setUser } = useAuthStore();
    const { showToast } = useToast();
    const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Other'>(user?.gender === 'Other' ? '' as any : user?.gender || '');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedGender) {
            showToast('Please select a gender', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.put('/api/auth/profile', {
                gender: selectedGender
            });

            if (data.success) {
                setUser(data.data.user);
                showToast('Profile updated & Avatar assigned!', 'success');
                onClose();
            }
        } catch (error) {
            console.error('Failed to update gender:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
                    <p className="text-gray-500">Select your gender to get a personalized avatar.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {['Male', 'Female', 'Other'].map((gender) => (
                        <button
                            key={gender}
                            onClick={() => setSelectedGender(gender as any)}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                                ${selectedGender === gender
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600'}
                            `}
                        >
                            <span className="text-2xl">
                                {gender === 'Male' ? '👨' : gender === 'Female' ? '👩' : '🧑'}
                            </span>
                            <span className="font-medium text-sm">{gender}</span>

                            {selectedGender === gender && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedGender}
                    className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Continue'
                    )}
                </button>
            </div>
        </div>
    );
};

export default GenderSelectionModal;

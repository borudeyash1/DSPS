import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Newspaper,
    Shirt,
    Gamepad2,
    X
} from 'lucide-react';

interface PageSwitcherFloaterProps {
    isSidebarCollapsed?: boolean;
}

const PageSwitcherFloater = ({ isSidebarCollapsed = false }: PageSwitcherFloaterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Only show if we are in the sections builder context
    const isBuilderPage = location.pathname.includes('/my-admin/sections');

    // If we want this to be global in admin sections, we can remove this check or keep it
    if (!isBuilderPage) return null;

    const pages = [
        { name: 'Homepage', path: '/my-admin/sections/homepage', icon: <Home size={20} />, color: '#3b82f6' },
        { name: 'Men\'s', path: '/my-admin/sections/men', icon: <Shirt size={20} />, color: '#10b981' },
        { name: 'Blog', path: '/my-admin/sections/blog', icon: <Newspaper size={20} />, color: '#6366f1' },
    ];

    const toggleOpen = () => setIsOpen(!isOpen);

    const containerVariants = {
        open: {
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 20,
                staggerChildren: 0.05
            }
        },
        closed: {
            scale: 0.9,
            transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 20
            }
        }
    };

    const itemVariants = {
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            pointerEvents: 'auto' as const
        },
        closed: {
            opacity: 0,
            y: -20,
            scale: 0.5,
            pointerEvents: 'none' as const
        }
    };

    // Calculate left position based on sidebar state + some padding
    // Sidebar is w-64 (256px) or w-20 (80px)
    // We want it slightly to the right of the sidebar
    const leftPositionClassName = isSidebarCollapsed ? 'left-24' : 'left-72';

    return (
        <div className={`fixed top-6 z-[9999] flex flex-col-reverse items-start gap-4 transition-all duration-300 ${leftPositionClassName}`}>
            {/* Expanded Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="flex flex-col gap-3 items-start"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={containerVariants}
                    >
                        {pages.map((page) => {
                            const isActive = location.pathname === page.path;
                            return (
                                <motion.div
                                    key={page.path}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <button
                                        onClick={() => {
                                            navigate(page.path);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 ${isActive
                                            ? 'bg-white text-black border-black/20 font-bold ring-2 ring-offset-2 ring-black/10'
                                            : 'bg-white/90 text-gray-700 border-white/40 hover:bg-white'
                                            }`}
                                        style={{ minWidth: '160px' }}
                                    >
                                        <div
                                            className="p-1.5 rounded-full"
                                            style={{ backgroundColor: page.color + '20', color: page.color }}
                                        >
                                            {page.icon}
                                        </div>
                                        <span className="text-sm">{page.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-dot"
                                                className="w-2 h-2 rounded-full bg-green-500 ml-auto"
                                            />
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Joystick Button */}
            <div className="relative">
                <motion.button
                    onClick={toggleOpen}
                    whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-4 transition-colors duration-300 ${isOpen
                        ? 'bg-gray-900 border-gray-800 text-white'
                        : 'bg-white border-white text-gray-900'
                        }`}
                    style={{
                        boxShadow: isOpen
                            ? '0 20px 40px -10px rgba(0,0,0,0.5)'
                            : '0 10px 25px -5px rgba(0,0,0,0.2)'
                    }}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/10 pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X size={20} strokeWidth={3} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="joystick"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                className="relative"
                            >
                                <Gamepad2 size={24} strokeWidth={2.5} />
                                {/* Pulse effect */}
                                <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Label helper */}
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded-md font-medium whitespace-nowrap backdrop-blur-sm"
                        >
                            Switch Page
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PageSwitcherFloater;

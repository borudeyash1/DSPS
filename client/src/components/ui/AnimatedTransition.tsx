import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export type AnimationStyle = 'fade' | 'slide' | 'zoom' | 'flip' | 'slideUp' | 'slideDown';

interface AnimatedTransitionProps {
    children: ReactNode;
    animationStyle?: AnimationStyle;
    duration?: number;
    className?: string;
}

// Global animation variants library
export const getAnimationVariants = (style: AnimationStyle = 'fade') => {
    const variants = {
        fade: {
            enter: { opacity: 0 },
            center: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            enter: { x: 100, opacity: 0 },
            center: { x: 0, opacity: 1 },
            exit: { x: -100, opacity: 0 },
        },
        slideUp: {
            enter: { y: 50, opacity: 0 },
            center: { y: 0, opacity: 1 },
            exit: { y: -50, opacity: 0 },
        },
        slideDown: {
            enter: { y: -50, opacity: 0 },
            center: { y: 0, opacity: 1 },
            exit: { y: 50, opacity: 0 },
        },
        zoom: {
            enter: { scale: 0.8, opacity: 0 },
            center: { scale: 1, opacity: 1 },
            exit: { scale: 1.2, opacity: 0 },
        },
        flip: {
            enter: { rotateY: 90, opacity: 0 },
            center: { rotateY: 0, opacity: 1 },
            exit: { rotateY: -90, opacity: 0 },
        },
    };
    return variants[style] || variants.fade;
};

/**
 * Global animated transition component
 * Use this for consistent animations across the app
 * 
 * @example
 * <AnimatedTransition animationStyle="slide" duration={0.5}>
 *   <YourContent />
 * </AnimatedTransition>
 */
export const AnimatedTransition = ({
    children,
    animationStyle = 'fade',
    duration = 0.3,
    className = '',
}: AnimatedTransitionProps) => {
    return (
        <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={getAnimationVariants(animationStyle)}
            transition={{ duration }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

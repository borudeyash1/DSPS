import React from 'react';

interface TextBlockProps {
    config: {
        content?: string;
        alignment?: 'left' | 'center' | 'right';
        backgroundColor?: string;
    };
}

const TextBlock: React.FC<TextBlockProps> = ({ config }) => {
    const { content, alignment = 'center', backgroundColor = '#ffffff' } = config;

    if (!content) return null;

    const alignmentClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }[alignment];

    return (
        <div className="py-16" style={{ backgroundColor }}>
            <div className="container-custom">
                <div className={`max-w-4xl mx-auto ${alignmentClass}`}>
                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TextBlock;

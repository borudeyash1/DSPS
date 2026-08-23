import React from 'react';

interface HeadlineBarRendererProps {
  sectionId?: string;
  content: {
    text: string;
    speed?: number;
    direction?: 'left' | 'right';
    textColor?: string;
  };
  background?: {
    type: 'image' | 'solid';
    imageUrl?: string;
    color?: string;
    opacity?: number;
  };
  isEditMode?: boolean;
  onEdit?: (element: any) => void;
}

export const HeadlineBarRenderer: React.FC<HeadlineBarRendererProps> = ({
  sectionId,
  content,
  background,
  isEditMode,
  onEdit
}) => {
  const { text = "This is a scrolling headline", speed = 20, direction = 'left' } = content || {};
  const bgImage = background?.imageUrl || '';
  const bgColor = background?.color || '#f0f0f0';
  const bgOpacity = background?.opacity || 1;

  const [isHovered, setIsHovered] = React.useState(false);

  // Animation style
  const animationName = direction === 'left' ? 'scrollLeft' : 'scrollRight';

  return (
    <div
      className="relative overflow-hidden w-full h-[60px] flex items-center group cursor-default"
      style={{
        backgroundColor: bgColor,
      }}
      onClick={(e) => {
        if (isEditMode && onEdit) {
          e.stopPropagation();
          onEdit({
            type: 'headline-bar',
            sectionId,
            elementPath: 'content', // Simple path for now
            currentValue: content,
            background: background
          });
        }
      }}
    >
      {/* Background Image */}
      {background?.type === 'image' && bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: bgOpacity
          }}
        />
      )}

      {/* Scrolling Text Container */}
      <div
        className="relative z-10 w-full overflow-hidden whitespace-nowrap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="inline-block whitespace-nowrap text-lg font-medium px-4"
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            animationPlayState: isHovered ? 'paused' : 'running',
            // Duplicate content to ensure smooth loop
            // We'll render it twice for seamless scrolling
            color: content.textColor || '#000000'
          }}
        >
          {[...Array(20)].map((_, i) => (
            <span key={i} className="mr-8">{text}</span>
          ))}
        </div>
      </div>

      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 z-50 pointer-events-none flex items-center justify-center">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Edit Headline</span>
        </div>
      )}

    </div>
  );
};

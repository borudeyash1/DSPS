import { ReactNode } from 'react';

interface EditableWrapperProps {
  children: ReactNode;
  type: 'text' | 'image' | 'video' | 'background' | 'button' | 'layout' | 'product' | 'link';
  sectionId: string;
  elementPath: string;
  currentValue: any;
  currentStyle?: any;
  allProducts?: any[];
  productIndex?: number;
  isEditMode: boolean;
  onEdit: (element: {
    type: string;
    sectionId: string;
    elementPath: string;
    currentValue: any;
    currentStyle?: any;
    allProducts?: any[];
    productIndex?: number;
  }) => void;
  className?: string;
}

export const EditableWrapper = ({
  children,
  type,
  sectionId,
  elementPath,
  currentValue,
  currentStyle,
  allProducts,
  productIndex,
  isEditMode,
  onEdit,
  className = '',
}: EditableWrapperProps) => {
  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleClick = () => {
    onEdit({
      type,
      sectionId,
      elementPath,
      currentValue,
      currentStyle,
      allProducts,
      productIndex,
    });
  };

  // Color-coded borders per element type
  const getBorderColor = () => {
    switch (type) {
      case 'text':
        return 'border-blue-500 hover:border-blue-600';
      case 'image':
        return 'border-green-500 hover:border-green-600';
      case 'video':
        return 'border-purple-500 hover:border-purple-600';
      case 'background':
        return 'border-orange-500 hover:border-orange-600';
      case 'button':
        return 'border-pink-500 hover:border-pink-600';
      case 'product':
        return 'border-teal-500 hover:border-teal-600';
      case 'layout':
        return 'border-yellow-500 hover:border-yellow-600';
      case 'link':
        return 'border-indigo-500 hover:border-indigo-600';
      default:
        return 'border-blue-500 hover:border-blue-600';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'text':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'image':
        return 'bg-green-500 hover:bg-green-600';
      case 'video':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'background':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'button':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'product':
        return 'bg-teal-500 hover:bg-teal-600';
      case 'layout':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'link':
        return 'bg-indigo-500 hover:bg-indigo-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className={`absolute inset-0 border-2 border-dashed ${getBorderColor()} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      <button
        onClick={handleClick}
        className={`absolute top-2 right-2 ${getButtonColor()} text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-10`}
      >
        Edit
      </button>
    </div>
  );
};

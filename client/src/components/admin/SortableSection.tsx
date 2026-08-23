import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';

interface SortableSectionProps {
  section: {
    _id: string;
    name: string;
    type: string;
    isActive: boolean;
  };
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SortableSection = ({ section, onToggleStatus, onDelete }: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded-lg ${
        section.isActive ? 'border-border bg-white' : 'border-border bg-gray-50 opacity-60'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move mt-1 text-secondary hover:text-primary touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate mb-1">{section.name}</div>
          <div className="text-xs text-secondary">{section.type}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStatus(section._id)}
            className={`p-1.5 rounded ${
              section.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(section._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

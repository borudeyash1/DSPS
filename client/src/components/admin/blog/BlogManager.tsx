import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Check, ArrowLeft, Bookmark, GripVertical } from 'lucide-react';
import adminApi from '../../../services/adminApi';
import { BlogEditor } from './BlogEditor';
import Toast from '../../Toast';
import { useToast } from '../../../hooks/useToast';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlogManagerProps {
    onClose?: () => void;
    mode?: 'manage' | 'select';
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    isModal?: boolean;
    sectionId?: string;
    maxBlogs?: number;
}

export const BlogManager = ({
    onClose,
    mode = 'manage',
    selectedIds = [],
    onSelectionChange,
    isModal = true,
    sectionId,
    maxBlogs
}: BlogManagerProps) => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const { toasts, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBlog, setEditingBlog] = useState<any | null>(null); // null means list view, {} means create new, object means edit

    // Local state for selection to avoid prop-drilling delays, synced with prop
    const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

    useEffect(() => {
        fetchBlogs();
    }, [sectionId]);

    useEffect(() => {
        setLocalSelectedIds(selectedIds);
    }, [selectedIds]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params: any = {};

            // Only filter by sectionId if we are managing a specific section, 
            // NOT when we are selecting blogs to add to it (we want to see all candidates)
            if (sectionId && mode !== 'select') params.sectionId = sectionId;

            const res = await adminApi.get('/blogs/admin/all', { params });
            if (res.data.success) {
                setBlogs(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch blogs', error);
            try {
                // Fallback attempt
                const res = await adminApi.get('/blogs?limit=100');
                if (res.data.success) {
                    setBlogs(res.data.data.blogs || res.data.data);
                }
            } catch (e) {
                console.error('Fallback fetch failed', e);
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-select native blogs when opening in select mode with no prior selection
    useEffect(() => {
        if (mode === 'select' && sectionId && blogs.length > 0 && selectedIds.length === 0) {
            const nativeIds = blogs.filter(b => b.sectionId === sectionId).map(b => b._id);
            if (nativeIds.length > 0) {
                // We only update local state so that subsequent toggles include these
                // We don't trigger onSelectionChange immediately to avoid marking them as "manually selected" if the user cancels
                setLocalSelectedIds(nativeIds);
            }
        }
    }, [blogs, sectionId, mode, selectedIds.length]);

    const handleSave = async (blogData: any) => {
        try {
            // Apply sectionId if creating a new blog or if we want to enforce it on edit? 
            // Usually only on create, or if we want to move it. 
            // Let's enforce it if provided.
            const payload = sectionId ? { ...blogData, sectionId } : blogData;

            let res;
            if (editingBlog && editingBlog._id) {
                res = await adminApi.put(`/blogs/${editingBlog._id}`, payload);
            } else {
                res = await adminApi.post('/blogs', payload);
                // If in select mode, automatically select the newly created blog
                if (res.data.success && mode === 'select' && onSelectionChange) {
                    const newBlogId = res.data.data._id;
                    const newSelection = [...localSelectedIds, newBlogId];
                    setLocalSelectedIds(newSelection);
                    onSelectionChange(newSelection);
                }
            }
            if (res.data.success) {
                showToast('Blog saved successfully', 'success');
                setEditingBlog(null);
                fetchBlogs();
            }
        } catch (error) {
            console.error('Failed to save blog', error);
            showToast('Failed to save blog', 'error');
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;
        try {
            await adminApi.delete(`/blogs/${id}`);
            fetchBlogs();
            showToast('Blog deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete blog', error);
            showToast('Failed to delete blog', 'error');
        }
    };

    const toggleSelection = (id: string) => {
        if (mode !== 'select' || !onSelectionChange) return;

        let newSelection;
        if (localSelectedIds.includes(id)) {
            newSelection = localSelectedIds.filter(sid => sid !== id);
        } else {
            // Check max limit
            if (maxBlogs && localSelectedIds.length >= maxBlogs) {
                showToast(`You can only select up to ${maxBlogs} blogs for this section type.`, 'warning');
                return;
            }
            newSelection = [...localSelectedIds, id];
        }
        setLocalSelectedIds(newSelection);
        onSelectionChange(newSelection);
    };

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end - reorder selected blogs
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = localSelectedIds.indexOf(active.id as string);
        const newIndex = localSelectedIds.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(localSelectedIds, oldIndex, newIndex);
            setLocalSelectedIds(newOrder);
            onSelectionChange?.(newOrder);

            // If we have a sectionId, persist the new order to backend
            if (sectionId && mode === 'select') {
                try {
                    await adminApi.post(`/sections/${sectionId}/blogs/reorder`, {
                        blogIds: newOrder
                    });
                } catch (error) {
                    console.error('Failed to reorder blogs:', error);
                    // Revert on error
                    setLocalSelectedIds(localSelectedIds);
                    onSelectionChange?.(localSelectedIds);
                }
            }
        }
    };

    if (editingBlog !== null) {
        return (
            <div className={isModal ? "fixed inset-0 bg-white z-[60] overflow-hidden flex flex-col" : "h-full flex flex-col bg-white"}>
                <div className="p-6 border-b border-gray-100 flex items-center bg-white sticky top-0 z-10">
                    <button onClick={() => setEditingBlog(null)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold">
                        {editingBlog._id ? 'Edit Blog' : 'New Blog'}
                    </h2>
                </div>
                <div className="flex-1 overflow-auto">
                    <BlogEditor
                        blog={editingBlog._id ? editingBlog : undefined}
                        onSave={handleSave}
                        onCancel={() => setEditingBlog(null)}
                    />

                </div>
                {/* Toast Notifications */}
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => hideToast(toast.id)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={isModal ? "fixed inset-0 bg-white z-[60] overflow-hidden flex flex-col" : "h-full flex flex-col bg-white"}>
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center bg-white ${!isModal ? 'sticky top-0 z-10' : ''}`}>
                <div>
                    <h2 className="text-xl font-bold">
                        {mode === 'select' ? 'Select Blogs' : 'Manage Blogs'}
                    </h2>
                    {mode === 'select' && (
                        <div className="flex flex-col">
                            <p className="text-sm text-gray-500">
                                {localSelectedIds.length} {maxBlogs ? `/ ${maxBlogs}` : ''} selected
                            </p>
                        </div>
                    )}
                    {mode === 'manage' && (
                        <p className="text-sm text-gray-400">
                            Manage your created blogs
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setEditingBlog({})}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        <Plus className="w-5 h-5" />
                        New Blog
                    </button>
                    {isModal && onClose && (
                        <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                            {mode === 'select' ? 'Done' : 'Close'}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading blogs...</div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localSelectedIds}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blogs
                                        .filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((blog) => {
                                            const isSelected = localSelectedIds.includes(blog._id);
                                            const isNativeSection = sectionId && blog.sectionId === sectionId;
                                            const isDimmed = mode === 'select' && !isSelected && !isNativeSection;

                                            const SortableCard = ({ blog, isSelected, isNativeSection, isDimmed }: any) => {
                                                const {
                                                    attributes,
                                                    listeners,
                                                    setNodeRef,
                                                    transform,
                                                    transition,
                                                    isDragging,
                                                } = useSortable({
                                                    id: blog._id,
                                                    disabled: !isSelected // Only selected cards are draggable
                                                });

                                                const style = {
                                                    transform: CSS.Transform.toString(transform),
                                                    transition,
                                                    opacity: isDragging ? 0.5 : 1,
                                                };

                                                return (
                                                    <div
                                                        ref={setNodeRef}
                                                        style={style}
                                                        className={`border rounded-xl overflow-hidden transition-all bg-white group relative ${mode === 'select' ? 'cursor-pointer hover:border-black' : 'hover:shadow-lg'
                                                            } ${isSelected ? 'ring-2 ring-black border-transparent' : 'border-gray-200'} ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}
                                                        onClick={() => mode === 'select' && toggleSelection(blog._id)}
                                                    >
                                                        {/* Drag Handle - Only show for selected cards */}
                                                        {mode === 'select' && isSelected && (
                                                            <div
                                                                {...attributes}
                                                                {...listeners}
                                                                className="absolute top-2 left-2 z-10 p-2 bg-white/95 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white shadow-md border border-gray-200"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <GripVertical className="w-4 h-4 text-gray-700" />
                                                            </div>
                                                        )}

                                                        <div className="aspect-video bg-gray-100 relative">
                                                            {blog.featuredImage ? (
                                                                <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <FileText className="w-12 h-12" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2 flex gap-2">
                                                                <div className="px-2 py-1 bg-white/90 rounded text-xs font-semibold uppercase tracking-wider">
                                                                    {blog.isPublished ? 'Published' : 'Draft'}
                                                                </div>
                                                            </div>

                                                            {/* Selection Checkbox Overlay */}
                                                            {mode === 'select' && (
                                                                <div className={`absolute ${isSelected ? 'top-2 left-14' : 'top-2 left-2'} w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black' : 'bg-white/80 border-gray-300'
                                                                    }`}>
                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                                </div>
                                                            )}

                                                            {/* Native Section Indicator */}
                                                            {isNativeSection && (
                                                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded flex items-center gap-1">
                                                                    Originally from this section
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>{blog.category}</span>
                                                                {blog.saveCount > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                            <Bookmark className="w-3 h-3" />
                                                                            {blog.saveCount}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
                                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{blog.excerpt || blog.content?.substring(0, 100)}...</p>

                                                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => setEditingBlog(blog)}
                                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(blog._id)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            };

                                            return <SortableCard key={blog._id} blog={blog} isSelected={isSelected} isNativeSection={isNativeSection} isDimmed={isDimmed} />;
                                        })}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div>
    );
};

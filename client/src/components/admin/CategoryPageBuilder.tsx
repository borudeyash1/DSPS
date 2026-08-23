import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import Toast from '../Toast';
import { useToast } from '../../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CategoryPageSection {
    _id?: string;
    category: 'men' | 'women' | 'kids' | 'living';
    type: 'hero' | 'banner' | 'featured-products' | 'image-grid' | 'video' | 'text-block';
    title: string;
    order: number;
    isActive: boolean;
    config: any;
}

interface CategoryPageBuilderProps {
    category: 'men' | 'women' | 'kids' | 'living';
}

const CategoryPageBuilder: React.FC<CategoryPageBuilderProps> = ({ category }) => {
    const [sections, setSections] = useState<CategoryPageSection[]>([]);
    const { toasts, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<CategoryPageSection | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchSections();
    }, [category]);

    const fetchSections = async () => {
        try {
            const response = await axios.get(`${API_URL}/category-sections/admin/${category}`, {
                withCredentials: true,
            });
            setSections(response.data.data || []);
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const createSection = async (type: string) => {
        try {
            const newSection: CategoryPageSection = {
                category,
                type: type as any,
                title: `New ${type} Section`,
                order: sections.length,
                isActive: true,
                config: getDefaultConfig(type),
            };

            const response = await axios.post(`${API_URL}/category-sections`, newSection, {
                withCredentials: true,
            });

            setSections([...sections, response.data.data]);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error creating section:', error);
            showToast('Failed to create section', 'error');
        }
    };

    const updateSection = async (section: CategoryPageSection) => {
        try {
            await axios.put(`${API_URL}/category-sections/${section._id}`, section, {
                withCredentials: true,
            });
            fetchSections();
            fetchSections();
            showToast('Section updated successfully', 'success');
        } catch (error) {
            console.error('Error updating section:', error);
            showToast('Failed to update section', 'error');
        }
    };

    const deleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            await axios.delete(`${API_URL}/category-sections/${id}`, {
                withCredentials: true,
            });
            setSections(sections.filter(s => s._id !== id));
            setSelectedSection(null);
        } catch (error) {
            console.error('Error deleting section:', error);
            showToast('Failed to delete section', 'error');
        }
    };

    const toggleActive = async (section: CategoryPageSection) => {
        const updated = { ...section, isActive: !section.isActive };
        await updateSection(updated);
    };

    const getDefaultConfig = (type: string) => {
        switch (type) {
            case 'hero':
                return {
                    heroImage: '',
                    heroTitle: `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`,
                    heroSubtitle: 'Discover the latest trends',
                    heroOverlay: true,
                    heroButton: { text: 'Shop Now', link: `/products?category=${category}` },
                };
            case 'banner':
                return { bannerImage: '', bannerText: '', bannerLink: '', bannerPosition: 'center' };
            case 'featured-products':
                return { productIds: [], showPrice: true, columns: 4 };
            case 'image-grid':
                return { images: [], gridLayout: '2x2' };
            case 'video':
                return { videoUrl: '', videoThumbnail: '', autoplay: false, videoTitle: '', videoDescription: '' };
            case 'text-block':
                return { content: '', alignment: 'center', backgroundColor: '#ffffff' };
            default:
                return {};
        }
    };

    const sectionTypes = [
        { value: 'hero', label: 'Hero Banner' },
        { value: 'banner', label: 'Promotional Banner' },
        { value: 'featured-products', label: 'Featured Products' },
        { value: 'image-grid', label: 'Image Grid' },
        { value: 'video', label: 'Video Section' },
        { value: 'text-block', label: 'Text Block' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold capitalize">{category} Page Builder</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                    <Plus className="w-5 h-5" />
                    Add Section
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sections List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Sections</h2>

                    {sections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No sections yet. Add your first section!
                        </div>
                    ) : (
                        sections.map((section) => (
                            <div
                                key={section._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedSection?._id === section._id
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                onClick={() => setSelectedSection(section)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{section.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleActive(section);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        {section.isActive ? (
                                            <Eye className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-sm text-gray-500 capitalize">{section.type}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Section Editor */}
                <div className="lg:col-span-2">
                    {selectedSection ? (
                        <div className="border rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Edit Section</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateSection(selectedSection)}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => deleteSection(selectedSection._id!)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Section Title</label>
                                    <input
                                        type="text"
                                        value={selectedSection.title}
                                        onChange={(e) =>
                                            setSelectedSection({ ...selectedSection, title: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                {/* Hero Config */}
                                {selectedSection.type === 'hero' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                                            <input
                                                type="text"
                                                value={selectedSection.config.heroImage || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, heroImage: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Hero Title</label>
                                            <input
                                                type="text"
                                                value={selectedSection.config.heroTitle || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, heroTitle: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                                            <input
                                                type="text"
                                                value={selectedSection.config.heroSubtitle || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, heroSubtitle: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Video Config */}
                                {selectedSection.type === 'video' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Video URL (YouTube or Google Drive)</label>
                                            <input
                                                type="text"
                                                value={selectedSection.config.videoUrl || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, videoUrl: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Video Title</label>
                                            <input
                                                type="text"
                                                value={selectedSection.config.videoTitle || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, videoTitle: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Text Block Config */}
                                {selectedSection.type === 'text-block' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Content (HTML)</label>
                                            <textarea
                                                value={selectedSection.config.content || ''}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, content: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                                rows={6}
                                                placeholder="<p>Your content here...</p>"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Alignment</label>
                                            <select
                                                value={selectedSection.config.alignment || 'center'}
                                                onChange={(e) =>
                                                    setSelectedSection({
                                                        ...selectedSection,
                                                        config: { ...selectedSection.config, alignment: e.target.value },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg"
                                            >
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-12 text-center text-gray-500">
                            Select a section to edit
                        </div>
                    )}
                </div>
            </div>

            {/* Add Section Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Section</h2>
                        <div className="space-y-2">
                            {sectionTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => createSection(type.value)}
                                    className="w-full px-4 py-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

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

export default CategoryPageBuilder;

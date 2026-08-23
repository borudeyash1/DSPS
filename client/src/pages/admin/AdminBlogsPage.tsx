import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layout, FileText, Check, X } from 'lucide-react';
import adminApi from '../../services/adminApi';
import { BlogManager } from '../../components/admin/blog/BlogManager';
import { COMPONENT_LIBRARY } from '../../data/componentLibrary';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Section {
    _id: string;
    name: string;
    type: string;
    page: string;
    isActive: boolean;
    layoutStyle?: 'standard-grid' | 'masonry' | 'carousel' | 'list';
    blogs?: Array<{
        blog: string | { _id: string };
        order: number;
    }>;
    content: {
        blogIds?: string[];
        heading?: string;
        [key: string]: any;
    };
    gridSettings?: any;
}

const BLOG_TEMPLATES = [
    { id: 'blog-grid', name: 'Standard Blog Grid', icon: <Layout className="w-6 h-6" /> },
    { id: 'blog-uneven-2', name: 'Uneven Grid (2 Items)', icon: <Layout className="rotate-90 w-6 h-6" /> },
    { id: 'blog-uneven-3', name: 'Uneven Grid (3 Items)', icon: <Layout className="w-6 h-6" /> },
    { id: 'blog-single-row', name: 'Single Row Feature', icon: <Layout className="w-6 h-6" /> },
];

const ALLOWED_BLOG_TYPES = BLOG_TEMPLATES.map(t => t.id);

const AdminBlogsPage = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [sectionName, setSectionName] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { toasts, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchSections();
    }, [refreshTrigger]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/sections/admin/all', {
                params: { page: 'blog' }
            });
            if (response.data.success) {
                // Filter to only show relevant blog sections
                const blogSections = response.data.data.sections.filter((s: Section) =>
                    ALLOWED_BLOG_TYPES.includes(s.type)
                );
                setSections(blogSections);
            }
        } catch (error) {
            console.error('Failed to fetch blog sections:', error);
            showToast('Failed to fetch blog sections', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (templateId: string, templateName: string) => {
        setSelectedTemplate(templateId);
        setSectionName(templateName); // Pre-fill with template name
    };

    const handleAddSection = async () => {
        if (!selectedTemplate || !sectionName.trim()) {
            showToast('Please enter a section name', 'warning');
            return;
        }

        try {
            const template = COMPONENT_LIBRARY.find((t: any) => t.id === selectedTemplate);
            const defaultConfig = template ? template.defaultConfig : {};

            await adminApi.post('/sections', {
                name: sectionName.trim(),
                type: selectedTemplate,
                page: 'blog',
                isActive: true,
                ...defaultConfig,
                content: {
                    ...(defaultConfig as any).content,
                    blogIds: []
                }
            });
            setShowAddModal(false);
            setSelectedTemplate(null);
            setSectionName('');
            setRefreshTrigger(prev => prev + 1);
            showToast('Blog section created successfully!', 'success');
        } catch (error) {
            console.error('Failed to create section:', error);
            showToast('Failed to create section', 'error');
        }
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
        setSelectedTemplate(null);
        setSectionName('');
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await adminApi.delete(`/sections/${id}`);
            setRefreshTrigger(prev => prev + 1);
            showToast('Section deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete section:', error);
            showToast('Failed to delete section', 'error');
        }
    };

    const updateEditingSectionField = (field: string, value: any) => {
        if (!editingSection) return;
        if (field.startsWith('content.')) {
            const contentField = field.split('.')[1];
            setEditingSection({
                ...editingSection,
                content: { ...editingSection.content, [contentField]: value }
            });
        } else if (field.startsWith('gridSettings.')) {
            const setting = field.split('.')[1];
            setEditingSection({
                ...editingSection,
                gridSettings: { ...(editingSection.gridSettings || {}), [setting]: value }
            });
        } else {
            setEditingSection({ ...editingSection, [field]: value });
        }
    };

    // We need to store temporary selection to save on button click
    const [tempSelection, setTempSelection] = useState<string[]>([]);

    const openEditModal = (section: Section) => {
        // Deep copy to avoid mutating sections state directly by reference
        setEditingSection(JSON.parse(JSON.stringify(section)));
        // Load selected blogs from section.blogs array (new structure)
        const selectedIds = section.blogs?.map((b: any) => b.blog?._id || b.blog) ||
            section.content?.blogIds || []; // Fallback to old structure
        setTempSelection(selectedIds);
    };

    const saveSelection = async () => {
        if (editingSection) {
            try {
                // Use new blog-section linking API
                await adminApi.put(`/sections/${editingSection._id}/blogs`, {
                    blogIds: tempSelection,
                    layoutStyle: editingSection.layoutStyle || 'standard-grid'
                });

                // Also update section name and other fields
                await adminApi.put(`/sections/${editingSection._id}`, {
                    name: editingSection.name,
                    content: editingSection.content,
                    gridSettings: editingSection.gridSettings
                });

                setEditingSection(null);
                setRefreshTrigger(prev => prev + 1);
                showToast('Blog section updated successfully!', 'success');
            } catch (error) {
                console.error('Failed to update section:', error);
                showToast('Failed to save changes', 'error');
            }
        }
    };

    if (loading && sections.length === 0) {
        return (
            <div className="p-8 animate-pulse">
                <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blog Page Management</h1>
                    <p className="text-gray-600">Manage sections and featured stories on your blog page</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Blog Section
                </button>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <div key={section._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteSection(section._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>


                            <h3 className="text-lg font-bold text-gray-900 mb-1">{section.name}</h3>
                            <p className="text-sm text-gray-500 mb-2 capitalize">
                                {section.type.replace(/-/g, ' ')}
                            </p>
                            {section.content?.heading && section.content.heading !== section.name && (
                                <p className="text-xs text-gray-400 mb-4 italic">
                                    Display: "{section.content.heading}"
                                </p>
                            )}

                            <div className="flex items-center gap-2 mb-6">
                                <div className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                    {(section.blogs?.length || 0)} Stories Selected
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${section.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                    {section.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            <button
                                onClick={() => openEditModal(section)}
                                className="w-full py-2.5 bg-white border-2 border-gray-100 text-gray-700 font-medium rounded-lg hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Manage Content
                            </button>
                        </div>
                    </div>
                ))}

                {sections.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Custom Sections</h3>
                        <p className="text-gray-500 mb-4">Create your first blog section to start featuring stories</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create Section
                        </button>
                    </div>
                )}
            </div>

            {/* Add Section Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                {selectedTemplate ? 'Name Your Section' : 'Add New Blog Section'}
                            </h2>
                            <button onClick={handleCancelAdd} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!selectedTemplate ? (
                            // Step 1: Select Template
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {BLOG_TEMPLATES.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template.id, template.name)}
                                        className="flex flex-col items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-center"
                                    >
                                        <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform text-gray-700 group-hover:text-blue-600">
                                            {template.icon}
                                        </div>
                                        <span className="font-bold text-gray-900 group-hover:text-blue-700">{template.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Step 2: Enter Section Name
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Template:</span> {BLOG_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionName}
                                        onChange={(e) => setSectionName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                                        placeholder="e.g., Latest Stories, Featured Posts"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        This name will be displayed as the section heading on your blog page
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleAddSection}
                                        disabled={!sectionName.trim()}
                                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Create Section
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Content Modal (Blog Manager) */}
            {editingSection && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white w-full h-full md:w-[90%] md:h-[90%] md:rounded-xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b bg-white z-10 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold">Manage Stories</h2>
                                    <p className="text-sm text-gray-500">{tempSelection.length} stories selected</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditingSection(null)}
                                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveSelection}
                                        className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2 shadow-lg"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            {/* Section Settings Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Internal Name</label>
                                    <input
                                        type="text"
                                        value={editingSection.name}
                                        onChange={(e) => updateEditingSectionField('name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Layout Style</label>
                                    <select
                                        value={editingSection.layoutStyle || 'standard-grid'}
                                        onChange={(e) => updateEditingSectionField('layoutStyle', e.target.value)}
                                        disabled={true}
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm cursor-not-allowed opacity-75"
                                    >
                                        <option value="standard-grid">Standard Grid</option>
                                        <option value="masonry">Masonry</option>
                                        <option value="carousel">Carousel</option>
                                        <option value="list">List View</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Fixed by section type</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Public Heading</label>
                                    <input
                                        type="text"
                                        value={editingSection.content?.heading || ''}
                                        onChange={(e) => updateEditingSectionField('content.heading', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="e.g. LATEST STORIES"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Public Subheading</label>
                                    <input
                                        type="text"
                                        value={editingSection.content?.subheading || ''}
                                        onChange={(e) => updateEditingSectionField('content.subheading', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="e.g. Read our latest articles"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-gray-50">
                            <BlogManager
                                isModal={false} // Embedded inside our modal wrapper
                                mode="select" // Use selection mode
                                selectedIds={tempSelection}
                                onSelectionChange={setTempSelection}
                                sectionId={editingSection._id}
                                maxBlogs={
                                    editingSection.type === 'blog-grid-uneven-2' ? 2 :
                                        editingSection.type === 'blog-grid-uneven-3' ? 3 :
                                            editingSection.type === 'blog-single-row' ? 4 :
                                                undefined
                                }
                            />
                        </div>
                    </div>
                </div>
            )
            }
            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div >
    );
};

export default AdminBlogsPage;

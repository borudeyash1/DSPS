import { useState, useEffect } from 'react';
import { Plus, Monitor, ChevronDown, ChevronUp, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSection } from './SortableSection';
import adminApi from '../../services/adminApi';
import { COMPONENT_CATEGORIES, getComponentsByCategory, getComponentById } from '../../data/componentLibrary';
import { HeroCarouselRenderer } from '../../components/renderers/HeroCarouselRenderer';
import { ProductCarouselRenderer } from '../../components/renderers/ProductCarouselRenderer';
import { ProductGridRenderer } from '../../components/renderers/ProductGridRenderer';
import { CategoryCardsRenderer } from '../../components/renderers/CategoryCardsRenderer';
import { BannerRenderer } from '../../components/renderers/BannerRenderer';
import { VideoRenderer } from '../../components/renderers/VideoRenderer';
import { TextBlockRenderer } from '../../components/renderers/TextBlockRenderer';
import { SplitHeroCarouselRenderer } from '../../components/renderers/SplitHeroCarouselRenderer';
import { NewArrivalsShowcaseRenderer } from '../../components/renderers/NewArrivalsShowcaseRenderer';
import { JockeyNewArrivalsRenderer } from '../../components/renderers/JockeyNewArrivalsRenderer';
import { ColossalCarouselRenderer } from '../../components/renderers/ColossalCarouselRenderer';
import { ColossalStaticGridRenderer } from '../../components/renderers/ColossalStaticGridRenderer';
import { SlideIntoColorsRenderer } from '../../components/renderers/SlideIntoColorsRenderer';
import { EssentialsCategoryGridRenderer } from '../../components/renderers/EssentialsCategoryGridRenderer';
import { PrimeSelectionsRenderer } from '../../components/renderers/PrimeSelectionsRenderer';
import { BlogGridRenderer } from '../../components/renderers/BlogGridRenderer';
import { ImageTextSplitRenderer } from '../../components/renderers/ImageTextSplitRenderer';
import { HeadlineBarRenderer } from '../../components/renderers/HeadlineBarRenderer';
import { PropertyPanel } from '../../components/editor/PropertyPanel';


interface Section {
    _id: string;
    name: string;
    type: string;
    order: number;
    isActive: boolean;
    layout: any;
    content: any;
    background?: any;
    carouselSettings?: any;
    gridSettings?: any;
    page?: string; // Added for page-specific sections
}

interface PageBuilderProps {
    pageType: 'homepage' | 'blog' | 'men' | 'women' | 'kids' | 'living';
    pageTitle: string;
}

const PageBuilder: React.FC<PageBuilderProps> = ({ pageType, pageTitle }) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPreview] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Hero Banners']);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [livePreviewData, setLivePreviewData] = useState<Map<string, any>>(new Map());

    const [sidebarMode, setSidebarMode] = useState<'expanded' | 'compact' | 'collapsed'>('expanded');

    const toggleSidebarMode = () => {
        if (sidebarMode === 'expanded') setSidebarMode('compact');
        else if (sidebarMode === 'compact') setSidebarMode('collapsed');
        else setSidebarMode('expanded');
    };

    const getSidebarWidth = () => {
        switch (sidebarMode) {
            case 'compact': return 'w-52';
            case 'collapsed': return 'w-12';
            case 'expanded':
            default: return 'w-96';
        }
    };

    // Get API endpoint based on page type
    const getApiEndpoint = () => {
        if (pageType === 'homepage') {
            return '/sections';
        }
        // For other pages, we'll use the same sections API but filter by page
        return '/sections';
    };

    useEffect(() => {
        fetchSections();
    }, [pageType]);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const endpoint = getApiEndpoint();
            const response = await adminApi.get(`${endpoint}/admin/all`, {
                params: pageType !== 'homepage' ? { page: pageType } : {},
            });
            if (response.data.success) {
                const allSections = response.data.data.sections;
                // Filter sections by page type
                const filteredSections = pageType === 'homepage'
                    ? allSections.filter((s: Section) => !s.page || s.page === 'homepage')
                    : allSections.filter((s: Section) => s.page === pageType);

                setSections(filteredSections);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sections');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComponent = async () => {
        if (!selectedTemplate) return;

        const template = getComponentById(selectedTemplate);
        if (!template) return;

        try {
            const endpoint = getApiEndpoint();
            const response = await adminApi.post(
                endpoint,
                {
                    name: template.name,
                    ...template.defaultConfig,
                    isActive: true,
                    page: pageType, // Add page identifier
                }
            );

            if (response.data.success) {
                setSuccess(`${template.name} added successfully!`);
                fetchSections();
                setSelectedTemplate(null);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add component');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const endpoint = getApiEndpoint();
            const response = await adminApi.put(
                `${endpoint}/${id}/toggle`,
                {}
            );
            if (response.data.success) {
                setSuccess('Section status updated');
                fetchSections();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update status');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            const endpoint = getApiEndpoint();
            const response = await adminApi.delete(`${endpoint}/${id}`);
            if (response.data.success) {
                setSuccess('Section deleted successfully');
                fetchSections();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete section');
            setTimeout(() => setError(''), 3000);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const handleSave = async (sectionId: string, updates: { path: string; value: any }[]) => {
        try {
            const updateObj: any = {};

            updates.forEach(({ path, value }) => {
                updateObj[path] = value;
            });

            const endpoint = getApiEndpoint();
            const response = await adminApi.put(
                `${endpoint}/${sectionId}`,
                updateObj
            );

            if (response.data.success) {
                setSuccess('Section updated successfully');
                setTimeout(() => setSuccess(''), 2000);
                await fetchSections();

                setLivePreviewData(prev => {
                    const newMap = new Map(prev);
                    Array.from(newMap.keys()).forEach(key => {
                        if (key.startsWith(sectionId)) {
                            newMap.delete(key);
                        }
                    });
                    return newMap;
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save changes');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleEdit = (element: any) => {
        setSelectedElement(element);
    };

    const handleLiveUpdate = (sectionId: string, path: string, value: any) => {
        setLivePreviewData(prev => {
            const newMap = new Map(prev);
            newMap.set(`${sectionId}.${path}`, value);
            return newMap;
        });

        setSelectedElement((prev: any) => {
            if (prev && prev.sectionId === sectionId && prev.elementPath === path) {
                return { ...prev, currentValue: value };
            }
            return prev;
        });
    };

    // Drag and Drop Logic
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over?.id);

                const newSections = arrayMove(items, oldIndex, newIndex);

                // Persist new order
                const sectionOrders = newSections.map((section, index) => ({
                    id: section._id,
                    order: index,
                }));

                const endpoint = getApiEndpoint();
                adminApi.put(`${endpoint}/reorder/all`, { sectionOrders })
                    .then(() => {
                        console.log('✅ Order updated successfully');
                    })
                    .catch((err) => {
                        console.error('❌ Failed to update order:', err);
                        setError('Failed to save new order');
                    });

                return newSections;
            });
        }
    };

    const getPreviewSection = (section: Section) => {
        const previewSection = JSON.parse(JSON.stringify(section));

        livePreviewData.forEach((value, key) => {
            if (key.startsWith(section._id)) {
                const path = key.replace(`${section._id}.`, '');
                const pathParts = path.split('.');
                let current: any = previewSection;

                for (let i = 0; i < pathParts.length - 1; i++) {
                    if (!current[pathParts[i]]) {
                        current[pathParts[i]] = {};
                    }
                    current = current[pathParts[i]];
                }

                current[pathParts[pathParts.length - 1]] = value;
            }
        });

        return previewSection;
    };

    const getPreviewWidth = () => {
        switch (previewMode) {
            case 'mobile':
                return '375px';
            case 'tablet':
                return '768px';
            case 'desktop':
            default:
                return '150%';
        }
    };

    const renderComponent = (section: Section) => {
        switch (section.type) {
            case 'hero':
                return (
                    <HeroCarouselRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        carouselSettings={section.carouselSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                        isPreview={true}
                    />
                );
            case 'product-carousel':
                return (
                    <ProductCarouselRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        carouselSettings={section.carouselSettings}
                        gridSettings={section.gridSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'product-grid':
                return (
                    <ProductGridRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        gridSettings={section.gridSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'category-cards':
                return (
                    <CategoryCardsRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        gridSettings={section.gridSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'image-banner':
                return (
                    <BannerRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        layout={section.layout}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'video':
                return (
                    <VideoRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        layout={section.layout}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'text-block':
                return (
                    <TextBlockRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        layout={section.layout}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'split-hero-carousel':
                return (
                    <SplitHeroCarouselRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        settings={section.carouselSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                        isPreview={true}
                    />
                );
            case 'new-arrivals-showcase':
                return (
                    <NewArrivalsShowcaseRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'jockey-new-arrivals':
                return (
                    <JockeyNewArrivalsRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'essentials-category-grid':
                return (
                    <EssentialsCategoryGridRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'colossal-carousel':
                return (
                    <ColossalCarouselRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        carouselSettings={section.carouselSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'colossal-static-grid':
                return (
                    <ColossalStaticGridRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        gridSettings={section.gridSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'prime-selections':
                return (
                    <PrimeSelectionsRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'blog-grid':
                return (
                    <BlogGridRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        gridSettings={section.gridSettings}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'slide-into-colors':
                return (
                    <SlideIntoColorsRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'image-text-split':
                return (
                    <ImageTextSplitRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        layout={section.layout}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            case 'headline-bar':
                return (
                    <HeadlineBarRenderer
                        sectionId={section._id}
                        content={section.content}
                        background={section.background}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                    />
                );
            default:
                return (
                    <div className="bg-muted rounded p-8 text-center text-secondary">
                        <p className="text-sm">Preview for {section.type}</p>
                        <p className="text-xs mt-1">Renderer coming soon</p>
                    </div>
                );
        }
    };

    const getPreviewScale = () => {
        // Adjust subtraction based on sidebar states (approximate)
        // AdminSidebar (256px -> 80px) + PageBuilderSidebar (384px -> 80px) + Padding
        // We use a safe estimate.
        const chromeWidth = sidebarMode === 'collapsed' ? 180 : (sidebarMode === 'compact' ? 340 : 500);
        const containerWidth = typeof window !== 'undefined' ? window.innerWidth - chromeWidth : 1200;

        switch (previewMode) {
            case 'mobile':
                return containerWidth < 375 ? containerWidth / 375 : 1;
            case 'tablet':
                return containerWidth < 768 ? containerWidth / 768 : 1;
            case 'desktop':
            default:
                // Scale to fit if container is smaller than standard desktop, else 0.67
                const scale = containerWidth / 1440;
                return Math.min(scale, 0.67);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-secondary">Loading sections...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex relative">
            {/* Left Panel - Component Library & Sections List */}
            <div className={`${getSidebarWidth()} bg-white border-r border-border flex flex-col overflow-hidden transition-all duration-300 relative z-20`}>
                {/* Header */}
                <div className="p-4 border-b border-border relative flex items-center justify-between min-h-[60px]">
                    {sidebarMode !== 'collapsed' && (
                        <div className="overflow-hidden">
                            <h1 className={`font-bold truncate ${sidebarMode === 'compact' ? 'text-sm' : 'text-xl'}`}>{pageTitle}</h1>
                            {sidebarMode === 'expanded' && <p className="text-sm text-secondary truncate">32 components available</p>}
                        </div>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebarMode}
                        className={`p-1.5 hover:bg-muted rounded-full transition-all ${sidebarMode === 'collapsed' ? 'mx-auto' : ''}`}
                        title="Toggle Sidebar View"
                    >
                        {sidebarMode === 'collapsed' ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
                    </button>

                    {sidebarMode === 'collapsed' && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-xs font-bold text-secondary uppercase -rotate-90 whitespace-nowrap origin-center translate-y-8">Library</span>
                        </div>
                    )}
                </div>

                {/* Success/Error Messages */}
                {/* ... (keep messages, maybe hide in compact/collapsed?) */}
                {success && sidebarMode === 'expanded' && (
                    <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm rounded">
                        {success}
                    </div>
                )}

                {error && sidebarMode === 'expanded' && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm rounded">
                        {error}
                    </div>
                )}

                {/* Component Library */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sidebarMode !== 'collapsed' && (
                        <>
                            <div className="p-4 border-b border-border">
                                <h2 className={`font-bold mb-3 text-secondary uppercase ${sidebarMode === 'compact' ? 'text-xs' : 'text-sm'}`}>Library</h2>

                                {COMPONENT_CATEGORIES.map((category) => {
                                    const components = getComponentsByCategory(category);
                                    const isExpanded = expandedCategories.includes(category);

                                    return (
                                        <div key={category} className="mb-2">
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className={`w-full flex items-center justify-between p-2 hover:bg-muted rounded transition-colors ${sidebarMode === 'compact' ? 'text-xs' : ''}`}
                                            >
                                                <span className="font-semibold truncate">{category}</span>
                                                {sidebarMode === 'expanded' && (isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />)}
                                            </button>

                                            {isExpanded && (
                                                <div className={`grid gap-2 mt-1 ${sidebarMode === 'compact' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                                    {components.map((template) => (
                                                        <button
                                                            key={template.id}
                                                            onClick={() => setSelectedTemplate(template.id)}
                                                            className={`border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-center 
                                                                ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-border'}
                                                                ${sidebarMode === 'compact' ? 'p-2 gap-2' : 'p-3 flex-col'}
                                                            `}
                                                        >
                                                            <div className={`${sidebarMode === 'compact' ? 'text-lg' : 'text-2xl mb-1'}`}>{template.icon}</div>
                                                            <div className={`font-medium ${sidebarMode === 'compact' ? 'text-xs truncate' : 'text-xs line-clamp-2'}`}>{template.name}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {selectedTemplate && (
                                    <button
                                        onClick={handleAddComponent}
                                        className="w-full mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {sidebarMode === 'expanded' && "Add"}
                                    </button>
                                )}
                            </div>

                            {/* Current Sections */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className={`font-bold text-secondary uppercase ${sidebarMode === 'compact' ? 'text-xs' : 'text-sm'}`}>Sections</h2>
                                </div>

                                {sections.length === 0 ? (
                                    <div className="text-center py-8 text-secondary text-sm">
                                        <p>Empty</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={sections.map(s => s._id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {sections.map((section) => (
                                                    <SortableSection
                                                        key={section._id}
                                                        section={section}
                                                        onToggleStatus={handleToggleStatus}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Live Preview */}
            {showPreview && (
                <div className="flex-1 bg-muted flex flex-col">
                    <div className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold">Live Preview</h2>
                            <p className="text-xs text-secondary">See your components in action</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`px-3 py-1.5 text-sm border rounded flex items-center gap-2 ${isEditMode ? 'bg-blue-600 text-white border-blue-600' : 'border-border hover:bg-muted'
                                    }`}
                            >
                                <Edit2 className="w-4 h-4" />
                                {isEditMode ? 'Edit Mode: ON' : 'Edit Mode: OFF'}
                            </button>
                            <div className="w-px h-6 bg-border"></div>
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`px-3 py-1.5 text-sm border rounded ${previewMode === 'desktop' ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
                                    }`}
                            >
                                Desktop
                            </button>
                            <button
                                onClick={() => setPreviewMode('tablet')}
                                className={`px-3 py-1.5 text-sm border rounded ${previewMode === 'tablet' ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
                                    }`}
                            >
                                Tablet
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`px-3 py-1.5 text-sm border rounded ${previewMode === 'mobile' ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
                                    }`}
                            >
                                Mobile
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col items-center custom-scrollbar">
                        <div
                            className="transition-all duration-300 origin-top flex-shrink-0"
                            style={{
                                width: getPreviewWidth(),
                                transform: `scale(${getPreviewScale()})`,
                                transformOrigin: 'top center',
                            }}
                        >
                            <div className="bg-white rounded-lg shadow-lg">
                                {sections.filter((s) => s.isActive).length === 0 ? (
                                    <div className="flex items-center justify-center py-32 text-secondary">
                                        <div className="text-center">
                                            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium mb-2">No active sections</p>
                                            <p className="text-sm">Add and activate sections to see preview</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {sections
                                            .filter((s) => s.isActive)
                                            .map((section) => (
                                                <div key={section._id} className="mb-8 last:mb-0">
                                                    {renderComponent(getPreviewSection(section))}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Property Panel */}
            <PropertyPanel
                element={selectedElement}
                onClose={() => setSelectedElement(null)}
                onSave={handleSave}
                onLiveUpdate={handleLiveUpdate}
            />

        </div >
    );
};

export default PageBuilder;

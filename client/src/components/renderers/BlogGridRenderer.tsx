import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User, Newspaper } from 'lucide-react';
import axios from 'axios';
import { EditableWrapper } from '../editor/EditableWrapper';

interface BlogGridProps {
    sectionId?: string;
    content?: {
        heading?: string;
        subheading?: string;
        count?: number;
        blogIds?: string[];
    };
    gridSettings?: {
        columns?: number;
        gap?: string;
        layout?: 'grid' | 'uneven-2' | 'uneven-3' | 'single-row';
    };
    background?: any;
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
}

export const BlogGridRenderer = ({
    sectionId = '',
    content,
    gridSettings,
    background,
    isEditMode = false,
    onEdit = () => { },
}: BlogGridProps) => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchBlogs();
    }, [content?.count, gridSettings?.layout, content?.blogIds]);

    const getEffectiveLayout = () => {
        if (gridSettings?.layout) return gridSettings.layout;
        // Heuristic fallback for legacy sections saved with missing layout type
        if (gridSettings?.columns === 4) return 'uneven-2';
        return 'grid';
    };

    const getEffectiveLimit = () => {
        const layout = getEffectiveLayout();
        if (layout === 'single-row') return 1;
        if (layout === 'uneven-2') return 2;
        if (layout === 'uneven-3') return 3;
        return content?.count || 3;
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const manualIds = content?.blogIds || [];

            // Fetch Logic (Priority Order):
            // 1. If sectionId exists, fetch from section endpoint (new structure with populated blogs)
            // 2. If manual IDs are selected, use them (legacy)
            // 3. Otherwise, return empty (Strict Mode)

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Priority 1: Fetch from section endpoint if sectionId exists AND no manual IDs are selected
            if (sectionId && manualIds.length === 0) {
                console.log(`ℹ️ [BlogGridRenderer] Fetching blogs from section endpoint: ${sectionId}`);
                try {
                    const response = await axios.get(`${API_URL}/sections/${sectionId}/blogs`);
                    if (response.data.success && response.data.data.blogs) {
                        // Extract populated blog objects from section.blogs array
                        const populatedBlogs = response.data.data.blogs
                            .map((item: any) => item.blog)
                            .filter((blog: any) => blog && blog._id); // Filter out null/undefined
                        
                        // Show all selected blogs, don't limit by layout
                        setBlogs(populatedBlogs);
                        console.log(`✅ [BlogGridRenderer] Loaded ${populatedBlogs.length} blogs from section`);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error('Failed to fetch from section endpoint, falling back:', error);
                }
            }

            // Priority 2: Fallback to manual IDs (legacy structure)
            const params: any = {
                status: 'published',
                sort: '-createdAt'
            };

            if (manualIds.length > 0) {
                params.ids = manualIds.join(',');
                console.log(`[BlogGridRenderer] Fetching specific blogs: ${params.ids}`);
            } else {
                console.log(`[BlogGridRenderer] No manual IDs. Fetching latest blogs.`);
                params.limit = content?.count || 3;
            }

            // Fetch specific blogs
            const response = await axios.get(`${API_URL}/blogs/public`, { params });

            if (response.data.success) {
                const blogsData = response.data.data;
                const fetchedBlogs = Array.isArray(blogsData) ? blogsData : (blogsData.blogs || []);
                // Show all selected blogs, don't limit by layout
                setBlogs(fetchedBlogs);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const isHorizontalCard = () => getEffectiveLayout() === 'single-row';

    const getGridClass = () => {
        const layout = getEffectiveLayout();
        if (isHorizontalCard()) return 'grid-cols-1';

        switch (layout) {
            case 'uneven-2':
            case 'uneven-3':
                return 'grid-cols-1 lg:grid-cols-12';
            case 'grid':
            default:
                const cols = gridSettings?.columns || 3;
                switch (cols) {
                    case 1: return 'grid-cols-1';
                    case 2: return 'grid-cols-1 md:grid-cols-2';
                    case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
                    case 3:
                    default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
                }
        }
    };

    const pseudoRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    const getItemSpanClass = (index: number, total: number) => {
        const layout = getEffectiveLayout();

        // Use sectionId to deterministically randomize the layout pattern for this specific section
        const rand = pseudoRandom(sectionId + 'layout');

        if (layout === 'uneven-2') {
            if (total === 1) return 'lg:col-span-12';

            // Randomize: either Big-Small or Small-Big
            const isVariantA = rand % 2 === 0;

            if (isVariantA) {
                // Variant A: Big (8) - Small (4)
                return index === 0 ? 'lg:col-span-8' : 'lg:col-span-4';
            } else {
                // Variant B: Small (4) - Big (8)
                return index === 0 ? 'lg:col-span-4' : 'lg:col-span-8';
            }
        }

        if (layout === 'uneven-3') {
            if (total === 1) return 'lg:col-span-12';
            if (total === 2) return 'lg:col-span-6';

            // For 3 items, ensure we always show all 3
            // Randomize: Big-Small-Small, Small-Big-Small, Small-Small-Big
            const variant = rand % 3;

            if (variant === 0) {
                // Big (6) - Small (3) - Small (3) = 12
                if (index === 0) return 'lg:col-span-6';
                if (index === 1) return 'lg:col-span-3';
                if (index === 2) return 'lg:col-span-3';
            } else if (variant === 1) {
                // Small (3) - Big (6) - Small (3) = 12
                if (index === 0) return 'lg:col-span-3';
                if (index === 1) return 'lg:col-span-6';
                if (index === 2) return 'lg:col-span-3';
            } else {
                // Small (3) - Small (3) - Big (6) = 12
                if (index === 0) return 'lg:col-span-3';
                if (index === 1) return 'lg:col-span-3';
                if (index === 2) return 'lg:col-span-6';
            }
        }
        return '';
    };

    return (
        <>
            <EditableWrapper
                type="background"
                sectionId={sectionId}
                elementPath="background"
                currentValue={background}
                isEditMode={isEditMode}
                onEdit={onEdit}
            >
                <section
                    className="py-16 px-4 transition-all duration-300"
                    style={{ backgroundColor: background?.color || '#ffffff' }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className={`mb-12 ${isHorizontalCard() ? 'text-left border-l-4 border-black pl-6' : 'text-center'}`}>
                            <EditableWrapper
                                type="text"
                                sectionId={sectionId}
                                elementPath="content.heading"
                                currentValue={content?.heading || 'LATEST STORIES'}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight">{content?.heading}</h2>
                            </EditableWrapper>
                            <EditableWrapper
                                type="text"
                                sectionId={sectionId}
                                elementPath="content.subheading"
                                currentValue={content?.subheading || 'Read our latest articles'}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <p className="text-gray-500 text-lg">{content?.subheading}</p>
                            </EditableWrapper>
                        </div>

                        {/* Edit Mode: Manage Button */}
                        {isEditMode && (
                            <div className="flex justify-center mb-8">
                                <button
                                    onClick={() => {
                                        onEdit({
                                            type: 'blog-grid',
                                            sectionId,
                                            elementPath: 'content.blogIds',
                                            currentValue: content?.blogIds || []
                                        });
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    <Newspaper className="w-5 h-5" />
                                    Manage Blogs & Content
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className={`grid ${getGridClass()} gap-8`}>
                                {Array.from({ length: getEffectiveLimit() }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`animate-pulse flex ${isHorizontalCard() ? 'flex-col md:flex-row gap-8 items-center' : 'flex-col'} ${getItemSpanClass(index, getEffectiveLimit())}`}
                                    >
                                        <div className={`bg-gray-200 rounded-2xl mb-6 ${isHorizontalCard() ? 'w-full md:w-1/2 aspect-[16/9]' : 'w-full h-[340px]'}`}></div>
                                        <div className={`flex flex-col flex-1 ${isHorizontalCard() ? 'w-full md:w-1/2' : 'w-full'}`}>
                                            <div className="h-3 bg-gray-200 w-24 rounded mb-4"></div>
                                            <div className="h-8 bg-gray-200 w-3/4 rounded mb-2"></div>
                                            <div className="h-4 bg-gray-200 w-full rounded mb-2"></div>
                                            <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`grid ${getGridClass()} gap-8`}>
                                {blogs.length > 0 ? (
                                    blogs.map((blog, index) => (
                                        <motion.article
                                            key={blog._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`group cursor-pointer ${getItemSpanClass(index, blogs.length)} ${isHorizontalCard() ? 'flex flex-col md:flex-row items-center gap-8' : 'flex flex-col h-full'}`}
                                            onClick={() => window.location.href = `/blogs/${blog.slug}`}
                                        >
                                            <div className={`${isHorizontalCard() ? 'w-full md:w-1/2 aspect-[16/9]' : 'w-full h-[340px]'} overflow-hidden rounded-2xl mb-6 bg-gray-100 relative shadow-sm group-hover:shadow-md transition-all`}>
                                                {blog.featuredImage ? (
                                                    <img
                                                        src={blog.featuredImage}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Newspaper className="w-16 h-16" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-gray-100 shadow-sm">
                                                    {blog.category}
                                                </div>
                                            </div>
                                            <div className={`flex flex-col flex-1 ${isHorizontalCard() ? 'w-full md:w-1/2 justify-center' : ''}`}>
                                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    {blog.author && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5" />
                                                            {blog.author.name || 'Admin'}
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className={`${isHorizontalCard() ? 'text-4xl' : 'text-xl'} font-bold mb-2 group-hover:text-gray-600 transition-colors leading-tight`}>
                                                    {blog.title}
                                                </h3>
                                                {!isHorizontalCard() && (
                                                    <p className="text-xs text-gray-300 mb-4 font-mono">
                                                        /{blog.slug}
                                                    </p>
                                                )}
                                                <p className={`text-gray-600 ${isHorizontalCard() ? 'text-lg line-clamp-4 mb-8' : 'line-clamp-3 mb-6 flex-1'}`}>
                                                    {blog.excerpt || blog.content?.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm font-bold underline decoration-2 underline-offset-4 decoration-gray-200 group-hover:decoration-black transition-all">
                                                    Learn More <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="font-medium text-lg">No Stories Selected</p>
                                        <p className="text-sm">Select blogs via 'Manage Blogs' to display content.</p>
                                        {isEditMode && <p className="text-xs text-blue-500 mt-2 font-mono">Debug: Strict Mode Active. IDs: {content?.blogIds?.length || 0}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </EditableWrapper>

        </>
    );
};

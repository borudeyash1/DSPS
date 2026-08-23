import { Link } from 'react-router-dom';
import { Clock, User, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
    category: string;
    author: {
        name: string;
        avatar?: string;
    };
    readTime: number;
    publishedAt: string;
}

interface BlogListProps {
    config: {
        showCategories?: boolean;
        postsPerPage?: number;
        layout?: 'grid' | 'list' | 'masonry';
    };
}

const BlogList: React.FC<BlogListProps> = ({ config }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const categories = ['fashion', 'lifestyle', 'tips', 'news', 'trends', 'style'];

    useEffect(() => {
        fetchBlogs();
    }, [page, selectedCategory]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const limit = config.postsPerPage || 9;
            const url = selectedCategory
                ? `${API_URL}/blogs/public/category/${selectedCategory}?page=${page}&limit=${limit}`
                : `${API_URL}/blogs/public?page=${page}&limit=${limit}`;

            const response = await axios.get(url);
            setBlogs(response.data.data || []);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const layout = config.layout || 'grid';
    const showCategories = config.showCategories !== false;

    const gridClass = layout === 'list'
        ? 'grid-cols-1'
        : layout === 'masonry'
            ? 'md:grid-cols-3 gap-4'
            : 'md:grid-cols-3 gap-8';

    return (
        <div className="container-custom py-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className={`grid grid-cols-1 ${gridClass}`}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
                                    <div className="h-4 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No blogs found</p>
                        </div>
                    ) : (
                        <>
                            <div className={`grid grid-cols-1 ${gridClass}`}>
                                {blogs.map((blog) => (
                                    <Link
                                        key={blog._id}
                                        to={`/blogs/${blog.slug}`}
                                        className={`group block ${layout === 'list' ? 'flex gap-6' : ''}`}
                                    >
                                        {/* Image */}
                                        <div className={`overflow-hidden rounded-lg mb-4 bg-gray-100 ${layout === 'list' ? 'w-64 h-48 flex-shrink-0' : 'aspect-[4/3]'
                                            }`}>
                                            <img
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            {/* Category Badge */}
                                            <div className="mb-2">
                                                <span className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full uppercase">
                                                    {blog.category}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className={`font-bold mb-2 group-hover:text-gray-600 transition-colors line-clamp-2 ${layout === 'list' ? 'text-2xl' : 'text-xl'
                                                }`}>
                                                {blog.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                {blog.excerpt}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>{blog.author.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{blog.readTime} min read</span>
                                                </div>
                                            </div>

                                            {/* Read More */}
                                            {layout === 'list' && (
                                                <div className="mt-4">
                                                    <span className="text-sm font-semibold text-black group-hover:underline flex items-center gap-1">
                                                        Read More <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`px-4 py-2 border rounded-lg ${page === p ? 'bg-black text-white' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar */}
                {showCategories && (
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-4">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === '' ? 'bg-black text-white' : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        All Posts
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${selectedCategory === cat ? 'bg-black text-white' : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;

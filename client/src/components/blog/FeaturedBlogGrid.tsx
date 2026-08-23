import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
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

interface FeaturedBlogGridProps {
    config: {
        featuredBlogs?: string[];
        gridColumns?: number;
    };
}

const FeaturedBlogGrid: React.FC<FeaturedBlogGridProps> = ({ config }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedBlogs();
    }, [config.featuredBlogs]);

    const fetchFeaturedBlogs = async () => {
        try {
            setLoading(true);

            if (config.featuredBlogs && config.featuredBlogs.length > 0) {
                // Fetch specific blogs by IDs
                const blogPromises = config.featuredBlogs.map(id =>
                    axios.get(`${API_URL}/blogs/public/${id}`)
                );
                const responses = await Promise.all(blogPromises);
                setBlogs(responses.map(res => res.data.data).filter(Boolean));
            } else {
                // Fetch featured blogs
                const response = await axios.get(`${API_URL}/blogs/public/featured?limit=6`);
                setBlogs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching featured blogs:', error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const gridCols = config.gridColumns || 3;
    const gridClass = gridCols === 2 ? 'md:grid-cols-2' : gridCols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

    if (loading) {
        return (
            <div className="container-custom py-16">
                <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
                    {[1, 2, 3, 4, 5, 6].slice(0, gridCols * 2).map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
                            <div className="h-4 bg-gray-200 rounded mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return null;
    }

    return (
        <div className="container-custom py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Stories</h2>

            <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
                {blogs.map((blog) => (
                    <Link
                        key={blog._id}
                        to={`/blogs/${blog.slug}`}
                        className="group block"
                    >
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-gray-100">
                            <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Category Badge */}
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full uppercase">
                                {blog.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                            {blog.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FeaturedBlogGrid;

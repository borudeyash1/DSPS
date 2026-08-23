import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthorProfilePage = () => {
    const { id } = useParams();
    const { toasts, showToast, hideToast } = useToast();
    const [author, setAuthor] = useState<any>(null);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchAuthorProfile();
        }
    }, [id]);

    const fetchAuthorProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/blogs/public/author/${id}`);
            if (response.data.success) {
                setAuthor(response.data.data.author);
                setBlogs(response.data.data.blogs);
            } else {
                setError('Author not found');
                showToast('Author not found', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch author profile:', error);
            setError('Failed to load author profile');
            showToast('Failed to load author profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-1 bg-black animate-pulse rounded-full"></div>
                    <p className="text-gray-400 font-medium tracking-widest text-xs uppercase">Loading Profile</p>
                </div>
            </div>
        );
    }

    if (error || !author) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center px-4">
                <h2 className="text-3xl font-bold mb-4">{error || 'Author not found'}</h2>
                <Link to="/blogs" className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                    Return to Journal
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-16">
                <div className="container mx-auto px-6">
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Journal
                        </Link>
                    </div>

                    {/* Author Profile Header */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 overflow-hidden mb-6 ring-4 ring-offset-4 ring-gray-50">
                            {author.avatar ? (
                                <img src={author.avatar} alt={author.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black text-white text-4xl font-bold">
                                    {(author.fullName || 'A').charAt(0)}
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{author.fullName}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {author.bio || 'Content creator and editor.'}
                        </p>
                    </div>

                    {/* Author's Articles */}
                    <div className="max-w-7xl mx-auto">
                        <div className="border-t border-gray-100 pt-16">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-2xl font-bold">Latest Articles</h2>
                                <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                                    {blogs.length} Stories
                                </span>
                            </div>

                            {blogs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {blogs.map((blog) => (
                                        <Link key={blog._id} to={`/blogs/${blog.slug}`} className="group cursor-pointer">
                                            <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-4 relative">
                                                {blog.featuredImage ? (
                                                    <img
                                                        src={blog.featuredImage}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">
                                                        📰
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-widest">
                                                    {blog.category}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {blog.readTime} min read
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-gray-600 transition-colors">
                                                {blog.title}
                                            </h3>
                                            <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                                {blog.excerpt}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No stories published yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
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

export default AuthorProfilePage;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Share2, Link as LinkIcon, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BlogPostPage = () => {
    const { slug } = useParams();
    const { toasts, showToast, hideToast } = useToast();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [latestBlogs, setLatestBlogs] = useState<any[]>([]);

    useEffect(() => {
        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/blogs/public/${slug}`);
            if (response.data.success) {
                setBlog(response.data.data);
                // Fetch latest blogs
                fetchLatestBlogs(response.data.data._id);
            } else {
                setError('Blog post not found');
            }
        } catch (error) {
            console.error('Failed to fetch blog:', error);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestBlogs = async (currentBlogId: string) => {
        try {
            const response = await axios.get(`${API_URL}/blogs/public`, {
                params: { limit: 3 }
            });
            if (response.data.success) {
                // Filter out the current blog
                const blogs = Array.isArray(response.data.data) ? response.data.data : [];
                const filtered = blogs.filter((b: any) => b._id !== currentBlogId);
                setLatestBlogs(filtered.slice(0, 3));
            }
        } catch (error) {
            console.error('Failed to fetch latest blogs:', error);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'success');
    };

    const handleShare = (platform: string) => {
        if (!blog) return;

        const url = window.location.href;
        const title = blog.title;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'instagram':
                // Instagram doesn't support web sharing, copy link instead
                navigator.clipboard.writeText(url);
                showToast('Link copied! Share it on Instagram.', 'success');
                break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-1 bg-black animate-pulse rounded-full"></div>
                    <p className="text-gray-400 font-medium tracking-widest text-xs uppercase">Loading Story</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center px-4">
                <h2 className="text-3xl font-bold mb-4">{error || 'Blog not found'}</h2>
                <p className="text-gray-500 mb-8">It seems this story has been moved or doesn't exist.</p>
                <Link to="/blogs" className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                    Return to Journal
                </Link>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Immersive Header (Layered Gradient) */}
            <div className="relative w-full min-h-[70vh] bg-neutral-900 overflow-hidden flex items-center">

                {/* Background Image - Positioned Right (approx 55-60%) */}
                <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] h-full transition-all duration-700 ease-in-out">
                    {blog.featuredImage ? (
                        <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <span className="text-6xl grayscale opacity-20">📰</span>
                        </div>
                    )}
                    {/* Mobile Tint */}
                    <div className="absolute inset-0 bg-neutral-900/60 lg:hidden"></div>
                </div>

                {/* Gradient Overlay - Continuous Fade from Left (Solid/Deep Black) to Right (Transparent) */}
                <div className="absolute inset-0 w-full bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent/10 z-10 pointer-events-none"></div>

                {/* Content - Positioned Left */}
                <div className="relative z-20 w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-[inherit]">
                    <div className="animate-fade-in-up">
                        <Link to="/blogs" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-medium tracking-wide">
                            <ArrowLeft className="w-4 h-4" /> BACK TO JOURNAL
                        </Link>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-white/10 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                {blog.category}
                            </span>
                            {blog.readTime && (
                                <span className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-widest">
                                    {blog.readTime} min read
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight shadow-black/50 drop-shadow-lg">
                            {blog.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 text-white/80 border-t border-white/10 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Written By</p>
                                    <p className="font-semibold text-white tracking-wide">{blog.author?.name || 'Editorial Team'}</p>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Published On</p>
                                    <p className="font-semibold text-white tracking-wide">
                                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[95%] xl:max-w-[1800px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 md:py-24">
                {/* Social Sidebar */}
                <div className="lg:col-span-2 hidden lg:flex flex-col items-center gap-6 sticky top-40 h-fit">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest rotate-180 py-4" style={{ writingMode: 'vertical-rl' }}>Follow Us</p>
                    <button
                        onClick={() => window.open('https://www.instagram.com/botamapparels/', '_blank')}
                        className="p-3 rounded-full bg-gray-50 hover:bg-pink-600 hover:text-white transition-colors group"
                        title="Follow on Instagram"
                    >
                        <Instagram className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => window.open('https://twitter.com/login', '_blank')}
                        className="p-3 rounded-full bg-gray-50 hover:bg-sky-500 hover:text-white transition-colors group"
                        title="Follow on Twitter"
                    >
                        <Twitter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => window.open('https://www.linkedin.com/in/botam-apparels/', '_blank')}
                        className="p-3 rounded-full bg-gray-50 hover:bg-blue-700 hover:text-white transition-colors group"
                        title="Follow on LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </button>
                    <div className="w-px h-12 bg-gray-200 my-2"></div>
                    <div className="w-px h-12 bg-gray-200 my-2"></div>
                    <button
                        onClick={handleCopyLink}
                        className="p-3 rounded-full bg-gray-50 hover:bg-black hover:text-white transition-colors group"
                        title="Copy Link"
                    >
                        <LinkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8">
                    <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-black prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4 prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
                    </div>

                    {/* Tags & Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-100">
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3 mb-10">
                                <span className="text-sm font-bold text-gray-900 uppercase tracking-widest mr-2">Topics:</span>
                                {blog.tags.map((tag: string) => (
                                    <Link key={tag} to={`/blogs?tag=${tag}`} className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-black hover:text-white rounded-full text-sm font-medium transition-colors">
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {blog.author?.avatar ? (
                                    <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-bold">
                                        {(blog.author?.name || 'A').charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About the Author</p>
                                <h3 className="text-xl font-bold mb-2">{blog.author?.name || 'Editorial Team'}</h3>
                                <p className="text-gray-600">
                                    {blog.author?.bio || 'Creating tailored content to inspire your lifestyle choices. Passionate about fashion, design, and modern living.'}
                                </p>
                            </div>
                            {blog.authorId && (
                                <Link to={`/author/${blog.authorId._id || blog.authorId}`} className="px-6 py-2 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors">
                                    View Profile
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* More Stories */}
                <div className="lg:col-span-2 hidden lg:block border-l border-gray-100 pl-12 sticky top-40 h-fit">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-black pb-4">Latest Stories</h3>
                    <div className="space-y-8">
                        {latestBlogs.slice(0, 3).map((latestBlog) => (
                            <Link
                                key={latestBlog._id}
                                to={`/blogs/${latestBlog.slug}`}
                                className="group cursor-pointer block"
                            >
                                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                    {latestBlog.featuredImage ? (
                                        <img
                                            src={latestBlog.featuredImage}
                                            alt={latestBlog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 group-hover:scale-105 transition-transform duration-500"></div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-1 uppercase">{latestBlog.category} • {latestBlog.readTime} MIN READ</p>
                                <h4 className="font-bold text-sm leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
                                    {latestBlog.title}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Actions Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between lg:hidden z-40 pb-safe">
                <button
                    onClick={handleCopyLink}
                    className="p-2"
                >
                    <LinkIcon className="w-6 h-6 text-gray-600" />
                </button>
                <button
                    onClick={() => {
                        const shareMenu = document.getElementById('mobile-share-menu');
                        shareMenu?.classList.toggle('hidden');
                    }}
                    className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold w-full mx-4"
                >
                    Share This Story
                </button>
                <button className="p-2">
                    <Share2 className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Mobile Share Menu */}
            <div id="mobile-share-menu" className="hidden fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden');
                }
            }}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-safe">
                    <h3 className="text-lg font-bold mb-4">Share Article</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Facebook className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Facebook</span>
                        </button>
                        <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center">
                                <Twitter className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Twitter</span>
                        </button>
                        <button onClick={() => handleShare('linkedin')} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center">
                                <Linkedin className="w-6 h-6" />
                            </div>
                            <span className="text-xs">LinkedIn</span>
                        </button>
                        <button onClick={() => handleShare('instagram')} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white flex items-center justify-center">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Instagram</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Latest Stories Section */}
            {latestBlogs.length > 0 && (
                <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-100">
                    <h2 className="text-3xl font-bold mb-8">Latest Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {latestBlogs.map((latestBlog) => (
                            <Link
                                key={latestBlog._id}
                                to={`/blogs/${latestBlog.slug}`}
                                className="group"
                            >
                                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                                    {latestBlog.featuredImage ? (
                                        <img
                                            src={latestBlog.featuredImage}
                                            alt={latestBlog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{latestBlog.category}</span>
                                        <span>•</span>
                                        <span>{new Date(latestBlog.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {latestBlog.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {latestBlog.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
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
        </article>
    );
};

export default BlogPostPage;

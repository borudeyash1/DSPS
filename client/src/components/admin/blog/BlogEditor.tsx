import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github.css'; // Code syntax highlighting theme
import 'katex/dist/katex.min.css'; // Math rendering
import {
    X, Image as ImageIcon, Settings, Eye, Save, ArrowLeft, ChevronDown, AlertCircle, Link as LinkIcon,
    Bold, Italic, Strikethrough, Underline, List, ListOrdered, Code
} from 'lucide-react';
import { ImageCropperModal } from '../../modals/ImageCropperModal';


interface BlogEditorProps {
    blog?: any;
    onSave: (blogData: any) => Promise<void>;
    onCancel: () => void;
}

export const BlogEditor = ({ blog, onSave, onCancel }: BlogEditorProps) => {
    const [title, setTitle] = useState(blog?.title || '');
    const [content, setContent] = useState(blog?.content || '');
    const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
    const [featuredImage, setFeaturedImage] = useState(blog?.featuredImage || '');
    const [category, setCategory] = useState(blog?.category || 'fashion');
    const [tags, setTags] = useState(blog?.tags ? blog.tags.join(', ') : '');
    const [status, setStatus] = useState(blog?.isPublished ? 'published' : 'draft');
    const [isFeatured, setIsFeatured] = useState(blog?.isFeatured || false);
    const [showPreview, setShowPreview] = useState(false);
    const [showSettings, setShowSettings] = useState(true);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Cropping State
    const [croppingFile, setCroppingFile] = useState<File | null>(null);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    // Track unsaved changes for potential data loss warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Check if form is dirty (content exists) or an image is uploaded but not saved
            const isDirty = content.length > 0 || title.length > 0 || (featuredImage && !blog?.featuredImage);

            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Standard for modern browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [content, title, featuredImage, blog]);

    // Markdown formatting helper
    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formatBold = () => insertMarkdown('**', '**');
    const formatItalic = () => insertMarkdown('*', '*');
    const formatStrikethrough = () => insertMarkdown('~~', '~~');
    const formatUnderline = () => insertMarkdown('<u>', '</u>');
    const formatCode = () => insertMarkdown('`', '`');
    const formatBulletList = () => insertMarkdown('\n- ', '');
    const formatNumberedList = () => insertMarkdown('\n1. ', '');
    const formatLink = () => {
        const url = prompt('Enter URL:');
        if (url) insertMarkdown('[', `](${url})`);
    };
    const formatImage = () => {
        const url = prompt('Enter image URL:');
        if (url) insertMarkdown(`![Image](${url})`, '');
    };

    const handleImageUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        if (!url) return;

        console.log('🔍 Image URL entered:', url);

        let directUrl = url;

        // Check if it's a LinkedIn, Instagram, or other social media URL that needs re-hosting
        const needsRehosting =
            url.includes('linkedin.com') ||
            url.includes('licdn.com') ||  // LinkedIn media subdomain
            url.includes('instagram.com') ||
            url.includes('facebook.com') ||
            url.includes('twitter.com') ||
            url.includes('x.com');

        console.log('🔍 Needs re-hosting:', needsRehosting);

        if (needsRehosting) {
            uploadUrlImage(url);
            return;
        }

        // Handle Google Drive links to convert to direct viewable links
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
            const fileId = driveMatch[1];
            directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            console.log('🔍 Google Drive URL converted:', directUrl);
        }

        setFeaturedImage(directUrl);
        console.log('✅ Featured image set:', directUrl);
    };

    const uploadUrlImage = async (url: string) => {
        // Use backend to download and re-host the image
        try {
            setLoading(true);
            console.log('📤 Uploading image from URL to backend...');

            const axios = (await import('axios')).default;
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            console.log('🌐 API URL:', `${API_URL}/blogs/upload-image-url`);

            const response = await axios.post(`${API_URL}/blogs/upload-image-url`,
                { imageUrl: url },
                { withCredentials: true }
            );

            console.log('✅ Backend response:', response.data);

            if (response.data.success) {
                setFeaturedImage(response.data.data.url);
                console.log('✅ Image uploaded successfully:', response.data.data.url);
            } else {
                console.error('❌ Upload failed:', response.data);
                setError('Failed to load image from URL');
                setTimeout(() => setError(null), 3000);
            }
        } catch (error: any) {
            console.error('❌ Image URL upload error:', error);
            console.error('❌ Error response:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to load image from URL. Please try again.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result?.toString() || null);
                setCroppingFile(file);
            });
            reader.readAsDataURL(file);
            // Reset input
            e.target.value = '';
        }
    };

    const handleCropComplete = async (blob: Blob) => {
        if (!croppingFile) return;

        try {
            setLoading(true);
            const file = new File([blob], croppingFile.name, { type: croppingFile.type });
            const formData = new FormData();
            formData.append('image', file);

            const axios = (await import('axios')).default;
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await axios.post(`${API_URL}/blogs/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (response.data.success) {
                setFeaturedImage(response.data.data.url);
                setFeaturedImage(response.data.data.url);
                // showSettings && setShowSettings(false); // keep settings open
            }

            setCroppingFile(null);
            setCropImageSrc(null);
        } catch (error: any) {
            console.error('Upload error:', error);
            setError('Failed to upload image');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !content) {
            setError('Title and Content are required');
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (!featuredImage) {
            setError('Featured Image is required');
            setTimeout(() => setError(null), 3000);
            return;
        }
        setLoading(true);
        try {
            await onSave({
                title,
                content,
                excerpt,
                featuredImage,
                category,
                tags: tags.split(',').map((t: string) => t.trim()),
                isPublished: status === 'published',
                publishedAt: status === 'published' ? (blog?.publishedAt || new Date()) : null,
                isFeatured
            });
        } catch (error: any) {
            console.error(error);
            let msg = error.response?.data?.message || 'Failed to save blog';
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                msg = `${msg}: ${error.response.data.errors.join(', ')}`;
            }
            setError(msg);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-hidden flex flex-col">
            {/* Error Toast */}
            {error && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-2 animate-pulse font-medium">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Minimalist Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{status === 'published' ? 'Published' : 'Draft'} mode</span>
                        <h2 className="text-lg font-bold text-gray-900 leading-none">{blog ? 'Editing Story' : 'New Story'}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showSettings ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <div className="w-px h-8 bg-gray-200 mx-1"></div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-gray-100">
                {/* Main Writing Area */}
                <div className="flex-1 overflow-y-auto relative">
                    <div className="max-w-4xl mx-auto py-12 px-8 min-h-screen">
                        {/* Content Card with Border */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                            {/* Split / Preview Mode */}
                            {showPreview ? (
                                <div className="prose prose-lg max-w-none 
                                    prose-headings:font-bold 
                                    prose-a:text-blue-600 
                                    prose-code:before:content-none prose-code:after:content-none
                                    prose-pre:bg-gray-900 prose-pre:text-white
                                    prose-img:rounded-lg
                                    prose-table:border-collapse
                                    prose-blockquote:border-l-blue-500
                                ">
                                    {featuredImage && (
                                        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                                            <img src={featuredImage} alt="Cover" className="w-full h-auto object-cover max-h-[500px]" />
                                        </div>
                                    )}
                                    <h1 className="text-5xl font-bold mb-4">{title || 'Untitled Story'}</h1>
                                    <ReactMarkdown
                                        remarkPlugins={[
                                            remarkGfm, // GFM includes footnote support
                                            remarkMath,
                                            remarkEmoji
                                        ]}
                                        rehypePlugins={[
                                            rehypeRaw,
                                            rehypeSanitize,
                                            rehypeHighlight,
                                            rehypeKatex
                                        ]}
                                        components={{
                                            // Custom code block with language label and proper styling
                                            code: ({ node, inline, className, children, ...props }: any) => {
                                                const match = /language-(\w+)/.exec(className || '');

                                                if (!inline) {
                                                    // Block code
                                                    return (
                                                        <div className="relative my-6">
                                                            {match && (
                                                                <div className="absolute top-3 right-3 px-2 py-1 text-xs font-mono text-gray-400 bg-gray-700 rounded z-10">
                                                                    {match[1]}
                                                                </div>
                                                            )}
                                                            <pre className={`${className || ''} !bg-gray-900 !text-gray-100 p-4 rounded-lg overflow-x-auto`}>
                                                                <code className={className}>{children}</code>
                                                            </pre>
                                                        </div>
                                                    );
                                                }

                                                // Inline code
                                                return <code className={`${className || ''} !bg-gray-100 !text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>{children}</code>;
                                            },
                                            // Make links open in new tab
                                            a: ({ node, ...props }) => (
                                                <a target="_blank" rel="noopener noreferrer" {...props} />
                                            ),
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    {/* Writing Mode */}
                                    <div className="mb-8 group relative">
                                        {featuredImage ? (
                                            <div className="relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all border border-gray-100">
                                                <img src={featuredImage} alt="Cover" className="w-full h-[300px] object-cover" />
                                                <button
                                                    onClick={() => setFeaturedImage('')}
                                                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
                                                    {/* Upload Button */}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="mb-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700"
                                                    >
                                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                                        Choose Image File
                                                    </button>

                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">- OR -</span>

                                                    <div className="w-full relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Paste image URL..."
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                            onChange={handleImageUrlChange}
                                                        />
                                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                                        Upload local file or paste external URL.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full text-5xl font-bold placeholder-gray-200 border-none focus:ring-0 p-0 mb-8 leading-tight text-gray-900 bg-transparent"
                                    />

                                    {/* Formatting Toolbar */}
                                    <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg p-2 mb-4 flex items-center gap-1 shadow-sm">
                                        <button
                                            onClick={formatBold}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Bold (Ctrl+B)"
                                            type="button"
                                        >
                                            <Bold className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatItalic}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Italic (Ctrl+I)"
                                            type="button"
                                        >
                                            <Italic className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatStrikethrough}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Strikethrough"
                                            type="button"
                                        >
                                            <Strikethrough className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatUnderline}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Underline"
                                            type="button"
                                        >
                                            <Underline className="w-4 h-4 text-gray-700" />
                                        </button>

                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                        <button
                                            onClick={formatBulletList}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Bullet List"
                                            type="button"
                                        >
                                            <List className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatNumberedList}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Numbered List"
                                            type="button"
                                        >
                                            <ListOrdered className="w-4 h-4 text-gray-700" />
                                        </button>

                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                        <button
                                            onClick={formatCode}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Inline Code"
                                            type="button"
                                        >
                                            <Code className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatLink}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Insert Link"
                                            type="button"
                                        >
                                            <LinkIcon className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={formatImage}
                                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                                            title="Insert Image"
                                            type="button"
                                        >
                                            <ImageIcon className="w-4 h-4 text-gray-700" />
                                        </button>

                                        <div className="ml-auto text-xs text-gray-400">
                                            Markdown supported
                                        </div>
                                    </div>

                                    <textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-[calc(100vh-600px)] resize-none border-none focus:ring-0 text-lg leading-relaxed text-gray-700 placeholder-gray-300 p-0 bg-transparent"
                                        placeholder="Tell your story..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Sidebar */}
                <div className={`w-80 bg-white border-l-2 border-gray-200 transform transition-transform duration-300 overflow-y-auto shadow-lg ${showSettings ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full shadow-2xl'}`}>
                    <div className="p-6 space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Publishing</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Status</label>
                                    <div className="relative">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Post</label>
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        id="featured"
                                        className="rounded border-gray-300 text-black focus:ring-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Organization</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Category</label>
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                                        >
                                            <option value="fashion">Fashion</option>
                                            <option value="lifestyle">Lifestyle</option>
                                            <option value="tips">Tips</option>
                                            <option value="news">News</option>
                                            <option value="trends">Trends</option>
                                            <option value="style">Style</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tags</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="Comma separated..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">SEO</h3>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Excerpt</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
                                    placeholder="Short summary for search engines and previews..."
                                />
                                <p className="text-xs text-right text-gray-400 mt-1">{excerpt.length}/300</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Cropper Modal */}
            {cropImageSrc && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    onClose={() => {
                        setCropImageSrc(null);
                        setCroppingFile(null);
                    }}
                    onCropComplete={handleCropComplete}
                    aspectRatio={16 / 9}
                />
            )}
        </div>
    );
};

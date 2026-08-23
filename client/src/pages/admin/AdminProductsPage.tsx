import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, ChevronLeft, ChevronRight, Eye, Package, CheckCircle, AlertTriangle, Battery, Clock, FolderTree } from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useCategoryStore } from '../../store/categoryStore';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { ImageCropperModal } from '../../components/modals/ImageCropperModal';




// Utility function to convert Google Drive share URLs to direct links and handle social media URLs
const convertImageUrl = async (url: string, isVideo: boolean = false): Promise<string> => {
  if (!url) return url;

  // Check if it's a LinkedIn, Instagram, or other social media URL that needs re-hosting
  const needsRehosting =
    url.includes('linkedin.com') ||
    url.includes('licdn.com') ||  // LinkedIn media subdomain
    url.includes('instagram.com') ||
    url.includes('facebook.com') ||
    url.includes('twitter.com') ||
    url.includes('x.com');

  if (needsRehosting && !isVideo) {
    // Use backend to download and re-host the image
    try {
      const response = await adminApi.post('/products/upload-image-url',
        { imageUrl: url }
      );

      if (response.data.success) {
        return response.data.data.url;
      }
    } catch (error) {
      console.error('Failed to upload image from URL:', error);
      // Fall through to return original URL
    }
  }

  // Check if it's a Google Drive URL
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];

    if (isVideo) {
      // For videos, use the preview format for iframe embedding
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      // For images, use thumbnail API which doesn't have CORS issues
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }

  // Handle existing uc?export=view format conversion if present
  if (url.includes('drive.google.com/uc?export=view')) {
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }

  return url;
};


interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  type?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  variants?: Array<{
    size: string;
    color: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku?: string;
  }>;
  images?: Array<{ url: string; publicId: string; isMain?: boolean }>;
  videos?: Array<{ url: string; publicId: string; thumbnail?: string }>;
  isFeatured: boolean;
  isActive: boolean;
}

const AdminProductsPage = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    comingSoon: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Visual Highlight State
  const [activeHighlight, setActiveHighlight] = useState<string>('all');

  // When highlight changes, reset page
  useEffect(() => {
    setPage(1);
  }, [activeHighlight]);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Sorting State
  const [sortBy, setSortBy] = useState('name'); // Default: A-Z

  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Store
  const { hierarchy, fetchHierarchy } = useCategoryStore();

  // Derived state for dropdowns
  const subcategories = filterCategory && hierarchy[filterCategory]
    ? Object.keys(hierarchy[filterCategory])
    : [];

  console.log('🔍 Deriving subcategories:', {
    filterCategory,
    hierarchyKeys: Object.keys(hierarchy),
    hasMatch: !!hierarchy[filterCategory],
    subcategories
  });

  const types = filterCategory && filterSubcategory && hierarchy[filterCategory] && hierarchy[filterCategory][filterSubcategory]
    ? hierarchy[filterCategory][filterSubcategory]
    : [];

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      params.append('sort', sortBy);

      console.log('🔍 Fetching products with highlight:', activeHighlight);

      // Build filters based on activeHighlight (Dashboard Cards)
      if (activeHighlight === 'all') {
        params.append('status', 'all');
      } else if (activeHighlight === 'active') {
        params.append('status', 'active');
      } else if (activeHighlight === 'inactive') {
        params.append('status', 'inactive');
      } else if (activeHighlight === 'coming-soon') {
        params.append('status', 'coming-soon');
      } else if (activeHighlight === 'lowstock') {
        // For low stock, we don't send a status parameter so the backend uses default logic (showing active/coming-soon)
        // This aligns with the stats calculation for low stock
        params.append('lowStock', 'true');
      }


      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterSubcategory) params.append('subcategory', filterSubcategory);
      if (filterType) params.append('type', filterType);

      console.log('📡 Sending API request with params:', params.toString());

      const response = await adminApi.get(`/products?${params.toString()}`);

      console.log('📦 API Response:', {
        totalProducts: response.data.data.length,
        firstProduct: response.data.data[0],
        firstProductImages: response.data.data[0]?.images,
        firstProductVideos: response.data.data[0]?.videos,
        firstProductColorVariants: response.data.data[0]?.colorVariants
      });

      setProducts(response.data.data);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
      setLoading(false);
    } catch (error: any) {
      const errorMsg = 'Failed to fetch products';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, filterCategory, filterSubcategory, filterType, searchTerm, sortBy, activeHighlight]);




  // Handle filter changes (reset page to 1)
  const handleFilterChange = (setter: any, value: string) => {
    console.log('🔄 Filter change:', { setter: setter.name, value });
    setter(value);
    setPage(1);
    // Reset dependent filters
    if (setter === setFilterCategory) {
      console.log('📁 Category filter changed to:', value);
      setFilterSubcategory('');
      setFilterType('');
    } else if (setter === setFilterSubcategory) {
      console.log('📂 Subcategory filter changed to:', value);
      setFilterType('');
    }
  };

  // --- Form Logic ---
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    type: '',
    price: 0,
    discountPrice: 0,
    stock: 0,
    sizes: [] as string[],
    colors: [] as string[],
    variants: [] as any[],
    imageUrls: [''],
    videoUrls: [''],
    selectedFiles: [] as File[], // Store selected files
    selectedVideos: [] as File[], // Store selected videos (future proofing)
    // Phase 4: Color Variants with View Angles
    colorVariants: [] as Array<{
      color: string;
      colorHex: string;
      images: {
        front: string;
        back: string;
        side: string;
        detail: string;
        worn: string;
      };
      stock: number;
      sku: string;
    }>,
    viewAngles: ['front', 'back', 'side', 'detail', 'worn'] as string[],
    // Phase 4: Size Chart
    sizeChart: {
      image: '',
      measurements: [] as Array<{
        size: string;
        chest: string;
        length: string;
        shoulder: string;
        sleeve: string;
        waist: string;
        hip: string;
      }>
    },
    // Phase 4: Delivery Info
    deliveryInfo: {
      estimatedDays: 7,
      freeShippingThreshold: 0,
      returnPolicy: '7 days return policy'
    },
    status: 'active' as 'active' | 'coming-soon' | 'inactive',
    isFeatured: false,
    isActive: true,
    rating: 0,
    reviewCount: 0,
  });

  // Custom Hierarchy State
  const [customInputMode, setCustomInputMode] = useState<'category' | 'subcategory' | 'type' | null>(null);
  const [customInputValue, setCustomInputValue] = useState('');
  const [showHierarchyConfirm, setShowHierarchyConfirm] = useState<{
    type: 'category' | 'subcategory' | 'type';
    value: string;
    parent: string;
    grandParent?: string;
  } | null>(null);

  // --- Image Cropping State ---
  // Process Cropping (Now triggered manually via button)
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

  // We need to track which index we are cropping to replace it correctly
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentCropFile) {
      console.log('🖼️ Reading file for crop:', currentCropFile.name);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        console.log('✅ File read, setting image src for modal');
        setCroppingImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(currentCropFile);
    }
  }, [currentCropFile]);

  // Track unsaved changes for uploaded files
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.selectedFiles.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData.selectedFiles]);


  const handleCropComplete = (croppedImageBlob: Blob) => {
    if (currentCropFile && croppingIndex !== null) {
      console.log('✅ Crop complete, creating new file...');
      // Create a new File from the blob
      const croppedFile = new File([croppedImageBlob], currentCropFile.name, {
        type: currentCropFile.type,
        lastModified: Date.now(),
      });

      console.log(`📝 Replacing file at index ${croppingIndex} with cropped version`);

      // Update selected files - Replace the original with cropped
      setFormData(prev => {
        const newFiles = [...prev.selectedFiles];
        newFiles[croppingIndex] = croppedFile;
        return {
          ...prev,
          selectedFiles: newFiles
        };
      });

      // Reset Crop State
      setCurrentCropFile(null);
      setCroppingImageSrc(null);
      setCroppingIndex(null);
    }
  };

  const handleCancelCrop = () => {
    console.log('❌ Crop cancelled');
    setCurrentCropFile(null);
    setCroppingImageSrc(null);
    setCurrentCropFile(null);
    setCroppingImageSrc(null);
  };

  const handleAddCustomHierarchy = async () => {
    if (!showHierarchyConfirm) return;

    try {
      const { type, value, parent, grandParent } = showHierarchyConfirm;
      const payload: any = {};

      if (type === 'category') {
        payload.category = value;
      } else if (type === 'subcategory') {
        payload.category = parent;
        payload.subcategory = value;
      } else if (type === 'type') {
        payload.category = grandParent;
        payload.subcategory = parent;
        payload.type = value;
      }

      await adminApi.post('/categories/custom', payload);
      await fetchHierarchy(); // Refresh dropdowns

      // Update form data and reset UI
      setFormData(prev => ({
        ...prev,
        [type === 'category' ? 'category' : type === 'subcategory' ? 'subcategory' : 'type']: value
      }));

      setShowHierarchyConfirm(null);
      setCustomInputMode(null);
      setCustomInputValue('');

    } catch (error) {
      console.error('Failed to add custom hierarchy:', error);
      showToast('Failed to add new option. Please try again', 'error');
    }
  };

  // Derived state for form dropdowns
  const formSubcategoriesOptions = hierarchy[formData.category]
    ? Object.keys(hierarchy[formData.category])
    : [];

  const formTypesOptions = hierarchy[formData.category] && hierarchy[formData.category][formData.subcategory]
    ? hierarchy[formData.category][formData.subcategory]
    : [];

  // Debug hierarchy loading
  useEffect(() => {
    console.log('🏗️ Category Hierarchy Loaded:', hierarchy);
    console.log('📊 Available Categories:', Object.keys(hierarchy));
    if (formData.category) {
      console.log(`📁 Subcategories for ${formData.category}:`, formSubcategoriesOptions);
    }
    if (formData.subcategory) {
      console.log(`📄 Types for ${formData.category}/${formData.subcategory}:`, formTypesOptions);
    }
  }, [hierarchy, formData.category, formData.subcategory, formSubcategoriesOptions, formTypesOptions]);

  // Auto-generate color variants from Variant Pricing Matrix
  useEffect(() => {
    // Extract unique colors from variants array
    const uniqueColors = [...new Set(formData.variants.map(v => v.color).filter(c => c && c.trim()))];

    if (uniqueColors.length === 0) {
      // No colors in matrix, clear color variants
      if (formData.colorVariants.length > 0) {
        setFormData(prev => ({ ...prev, colorVariants: [] }));
      }
      return;
    }

    // Auto-generate colorVariants based on unique colors
    const autoGeneratedVariants = uniqueColors.map(color => {
      // Check if this color already exists in colorVariants
      const existing = formData.colorVariants.find(cv => cv.color === color);

      // If exists, keep the existing images; otherwise create new entry
      return existing || {
        color,
        colorHex: '',
        images: { front: '', back: '', side: '', detail: '', worn: '' },
        stock: 0,
        sku: ''
      };
    });

    // Only update if the colors have changed
    const currentColors = formData.colorVariants.map(cv => cv.color).sort().join(',');
    const newColors = autoGeneratedVariants.map(cv => cv.color).sort().join(',');

    if (currentColors !== newColors) {
      setFormData(prev => ({ ...prev, colorVariants: autoGeneratedVariants }));
    }
  }, [formData.variants]); // Only depend on variants array

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    // Debug logging for media URLs
    console.log('📖 Loading product:', {
      images: product.images,
      videos: product.videos,
      colorVariants: (product as any).colorVariants,
      hasColorVariants: !!(product as any).colorVariants,
      colorVariantsLength: (product as any).colorVariants?.length || 0
    });

    setFormData({
      name: product.name,
      description: product.description,
      // Auto-fix category casing to match hierarchy (e.g. "men" -> "Mens")
      category: Object.keys(hierarchy).find(k => k.toLowerCase() === product.category.toLowerCase()) || product.category,
      subcategory: product.subcategory || '',
      type: product.type || '',
      price: product.price,
      discountPrice: product.discountPrice || 0,
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      variants: product.variants || [],
      imageUrls: product.images?.map(img => img.url) || [''],
      videoUrls: product.videos?.map(vid => vid.url) || [''],
      // Phase 4 fields - Convert colorVariants images from array to object format
      colorVariants: ((product as any).colorVariants || []).map((cv: any) => {
        // Convert images array [{view: 'front', url: '...'}, ...] to object {front: '...', back: '...'}
        const imagesObj: any = {
          front: '',
          back: '',
          side: '',
          detail: '',
          worn: ''
        };

        if (cv.images && Array.isArray(cv.images)) {
          cv.images.forEach((img: any) => {
            if (img.view && img.url) {
              imagesObj[img.view] = img.url;
            }
          });
        }

        return {
          color: cv.color,
          colorHex: cv.colorHex || '',
          images: imagesObj,
          stock: cv.stock || 0,
          sku: cv.sku || ''
        };
      }),
      viewAngles: (product as any).viewAngles || ['front', 'back', 'side', 'detail', 'worn'],
      sizeChart: (product as any).sizeChart || { image: '', measurements: [] },
      deliveryInfo: (product as any).deliveryInfo || { estimatedDays: 7, freeShippingThreshold: 0, returnPolicy: '7 days return policy' },
      status: (product as any).status || 'active',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      rating: (product as any).rating || 0,
      reviewCount: (product as any).reviewCount || 0,
      selectedFiles: [],
      selectedVideos: []
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'men',
      subcategory: '',
      type: '',
      price: 0,
      discountPrice: 0,
      stock: 0,
      sizes: [],
      colors: [],
      variants: [],
      imageUrls: [''],
      videoUrls: [''],
      // Phase 4 fields
      colorVariants: [],
      viewAngles: ['front', 'back', 'side', 'detail', 'worn'],
      sizeChart: { image: '', measurements: [] },
      deliveryInfo: { estimatedDays: 7, freeShippingThreshold: 0, returnPolicy: '7 days return policy' },
      status: 'active' as 'active' | 'coming-soon' | 'inactive',
      isFeatured: false,
      isActive: true,
      rating: 0,
      reviewCount: 0,
      selectedFiles: [],
      selectedVideos: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('discountPrice', formData.discountPrice.toString());
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('isFeatured', String(formData.isFeatured));
      formDataToSend.append('isActive', String(formData.isActive));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('rating', formData.rating.toString());
      formDataToSend.append('reviewCount', formData.reviewCount.toString());

      // Append JSON fields
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('colors', JSON.stringify(formData.colors));
      formDataToSend.append('variants', JSON.stringify(formData.variants));

      // Transform and append Phase 4 fields
      const transformedColorVariants = formData.colorVariants.map(variant => ({
        color: variant.color,
        colorHex: variant.colorHex,
        images: Object.entries(variant.images)
          .filter(([_, url]) => url.trim())
          .map(([view, url]) => ({
            view: view,
            url: url.trim(),
            alt: `${variant.color} - ${view} view`
          })),
        stock: variant.stock,
        sku: variant.sku
      }));
      formDataToSend.append('colorVariants', JSON.stringify(transformedColorVariants));
      formDataToSend.append('viewAngles', JSON.stringify(formData.viewAngles));
      formDataToSend.append('sizeChart', JSON.stringify(formData.sizeChart));
      formDataToSend.append('deliveryInfo', JSON.stringify(formData.deliveryInfo));

      // Append existing images (as JSON string)
      // Filter out empty strings
      const existingImages = formData.imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
      formDataToSend.append('images', JSON.stringify(existingImages.map(url => ({ url, publicId: url, isMain: false }))));

      // Append new files
      if (formData.selectedFiles && formData.selectedFiles.length > 0) {
        formData.selectedFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });
      }

      // Convert video URLs (keep existing logic for remote videos, append as JSON)
      const convertedVideos = await Promise.all(
        formData.videoUrls
          .filter(url => url.trim())
          .map(async (url, index) => ({
            url: await convertImageUrl(url.trim(), true),
            publicId: `product_video_${Date.now()}_${index}`,
            thumbnail: '',
          }))
      );
      formDataToSend.append('videos', JSON.stringify(convertedVideos));

      if (editingProduct) {
        await adminApi.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Product updated successfully');
      } else {
        await adminApi.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Product created successfully');
      }

      fetchProducts();
      handleCloseForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.delete(`/products/${id}`);
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };


  // Image URL helpers
  const addImageUrl = () => setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  const removeImageUrl = (index: number) => setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({ ...formData, imageUrls: newUrls });
  };

  // Video URL helpers
  const addVideoUrl = () => setFormData({ ...formData, videoUrls: [...formData.videoUrls, ''] });
  const removeVideoUrl = (index: number) => setFormData({ ...formData, videoUrls: formData.videoUrls.filter((_, i) => i !== index) });
  const updateVideoUrl = (index: number, value: string) => {
    const newUrls = [...formData.videoUrls];
    newUrls[index] = value;
    setFormData({ ...formData, videoUrls: newUrls });
  };
  const toggleSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.includes(size)
        ? formData.sizes.filter(s => s !== size)
        : [...formData.sizes, size],
    });
  };
  const generateVariants = () => {
    const newVariants = [];
    for (const size of formData.sizes) {
      for (const color of formData.colors) {
        newVariants.push({
          size,
          color,
          price: formData.price,
          discountPrice: formData.discountPrice || undefined,
          stock: Math.floor(formData.stock / (formData.sizes.length * formData.colors.length)) || 0,
          sku: `${formData.name.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`,
        });
      }
    }
    setFormData({ ...formData, variants: newVariants });
  };
  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };
  const removeVariant = (index: number) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: 'M', color: 'Black', price: formData.price, stock: 0 }]
    });
  };

  // Calculate stats for cards (Now using server stats)
  // const activeProducts = products.filter(p => (p as any).status === 'active' || p.isActive).length;
  // ... (Removed client-side calculation)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex gap-3">
            <Link
              to="/my-admin/categories"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-300 rounded hover:bg-gray-50 shadow-sm transition-all"
            >
              <FolderTree className="w-5 h-5" />
              Manage Categories
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 shadow-md transform hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Product
            </button>
          </div>
        </div>

        {/* Stats with Visual Highlighting */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div
            onClick={() => setActiveHighlight('all')}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'all' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-blue-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className={`w-10 h-10 ${activeHighlight === 'all' ? 'text-blue-600' : 'text-blue-500'}`} />
            </div>
          </div>

          <div
            onClick={() => setActiveHighlight('active')}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'active' ? 'border-green-500 ring-1 ring-green-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-green-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className={`w-10 h-10 ${activeHighlight === 'active' ? 'text-green-600' : 'text-green-500'}`} />
            </div>
          </div>

          <div
            onClick={() => setActiveHighlight('lowstock')}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'lowstock' ? 'border-yellow-500 ring-1 ring-yellow-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-yellow-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <Battery className={`w-10 h-10 ${activeHighlight === 'lowstock' ? 'text-yellow-600' : 'text-yellow-500'}`} />
            </div>
          </div>

          <div
            onClick={() => setActiveHighlight('coming-soon')}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'coming-soon' ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-indigo-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Coming Soon</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.comingSoon}</p>
              </div>
              <Clock className={`w-10 h-10 ${activeHighlight === 'coming-soon' ? 'text-indigo-600' : 'text-indigo-500'}`} />
            </div>
          </div>

          <div
            onClick={() => setActiveHighlight('inactive')}
            className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'inactive' ? 'border-red-500 ring-1 ring-red-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-red-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <AlertTriangle className={`w-10 h-10 ${activeHighlight === 'inactive' ? 'text-red-600' : 'text-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[150px] shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            >
              <option value="name">A-Z (Name)</option>
              <option value="-createdAt">Latest Added</option>
              <option value="createdAt">Oldest Added</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="stock">Stock: Low to High</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[150px] shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            >
              <option value="">All Categories</option>
              {Object.keys(hierarchy).map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>

            {/* Subcategory Filter */}
            <select
              value={filterSubcategory}
              onChange={(e) => handleFilterChange(setFilterSubcategory, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[150px] shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
              disabled={!filterCategory}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((sub: string) => (
                <option key={sub} value={sub}>{sub.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg min-w-[150px] shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
              disabled={!filterSubcategory}
            >
              <option value="">All Types</option>
              {types.map((type: string) => (
                <option key={type} value={type}>{type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filterCategory || searchTerm) && (
              <button
                onClick={() => {
                  setFilterCategory('');
                  setFilterSubcategory('');
                  setFilterType('');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Product List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            {/* Table Header Skeleton */}
            <div className="bg-gray-50 h-10 w-full border-b border-gray-200"></div>

            {/* Table Body Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100">
                {/* Image */}
                <div className="w-16 h-16 bg-gray-200 rounded mr-6 shrink-0"></div>

                {/* Name & Subcategory */}
                <div className="w-1/4 mr-6 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                </div>

                {/* Category */}
                <div className="w-1/6 mr-6">
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>

                {/* Price */}
                <div className="w-1/6 mr-6 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>

                {/* Stock */}
                <div className="w-1/6 mr-6">
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </div>

                {/* Status */}
                <div className="w-1/6 mr-6">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? products.map((product) => {
                  const isHighlighted =
                    activeHighlight === 'all' ||
                    (activeHighlight === 'active' && ((product as any).status === 'active' || product.isActive)) ||
                    (activeHighlight === 'coming-soon' && (product as any).status === 'coming-soon') ||
                    (activeHighlight === 'inactive' && ((product as any).status === 'inactive' || (!product.isActive && (product as any).status !== 'coming-soon'))) ||
                    (activeHighlight === 'lowstock' && product.stock < 10);

                  return (
                    <tr
                      key={product._id}
                      className={`
                      transition-all duration-500 ease-in-out
                      ${isHighlighted
                          ? 'hover:bg-gray-50 opacity-100 transform scale-100'
                          : 'opacity-30 blur-[0.5px] scale-[0.98] grayscale'}
                      ${activeHighlight !== 'all' && isHighlighted ? 'bg-blue-50/30' : ''}
                    `}
                      style={{
                        boxShadow: activeHighlight !== 'all' && isHighlighted ? 'inset 3px 0 0 0 #3b82f6' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        {(() => {
                          // Try to get first color variant's front view image
                          const colorVariants = (product as any).colorVariants;
                          if (colorVariants && colorVariants.length > 0) {
                            const firstVariant = colorVariants[0];
                            const frontImage = firstVariant.images?.find((img: any) => img.view === 'front');
                            if (frontImage?.url) {
                              return (
                                <img
                                  src={frontImage.url}
                                  alt={`${product.name} - ${firstVariant.color}`}
                                  className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100"
                                />
                              );
                            }
                          }

                          // Fallback to legacy images
                          if (product.images?.[0]?.url) {
                            return (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100"
                              />
                            );
                          }

                          // No image available
                          return (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.subcategory && <div className="text-sm text-gray-500 capitalize">{product.subcategory}</div>}
                      </td>
                      <td className="px-6 py-4 capitalize">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">₹{product.price}</div>
                        {product.discountPrice && (
                          <div className="text-sm text-green-600">₹{product.discountPrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${(product as any).status === 'active' ? 'bg-green-100 text-green-800' :
                          (product as any).status === 'coming-soon' ? 'bg-yellow-100 text-yellow-800' :
                            (product as any).status === 'inactive' ? 'bg-red-100 text-red-800' :
                              product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {(product as any).status === 'active' ? '✅ Active' :
                            (product as any).status === 'coming-soon' ? '🔜 Coming Soon' :
                              (product as any).status === 'inactive' ? '❌ Inactive' :
                                product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/product/${product._id}`, '_blank')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="View Product Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No products found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    // Only show current, first, last, and neighbors (simplified)
                    (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) ? (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded border text-sm flex items-center justify-center ${page === p ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'
                          }`}
                      >
                        {p}
                      </button>
                    ) : (p === page - 2 || p === page + 2) ? <span key={p} className="px-1">...</span> : null
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
              <div className="flex justify-between items-center p-8 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    {customInputMode === 'category' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={customInputValue}
                          onChange={(e) => setCustomInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customInputValue.trim()) {
                                const val = customInputValue.trim();
                                if (Object.keys(hierarchy).some(k => k.toLowerCase() === val.toLowerCase())) {
                                  showToast('Category already exists!', 'warning');
                                  const existing = Object.keys(hierarchy).find(k => k.toLowerCase() === val.toLowerCase()) || val;
                                  setFormData({ ...formData, category: existing, subcategory: '', type: '' });
                                  setCustomInputMode(null);
                                  return;
                                }
                                setShowHierarchyConfirm({ type: 'category', value: val, parent: '' });
                              }
                            }
                            if (e.key === 'Escape') setCustomInputMode(null);
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                          placeholder="Type new category + Enter"
                        />
                        <button type="button" onClick={() => setCustomInputMode(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomInputMode('category');
                            setCustomInputValue('');
                          } else {
                            setFormData({ ...formData, category: e.target.value, subcategory: '', type: '' });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {Object.keys(hierarchy).map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                        <option value="__custom__" className="font-bold text-blue-600">+ Add New Category...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    {customInputMode === 'subcategory' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={customInputValue}
                          onChange={(e) => setCustomInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customInputValue.trim()) {
                                const val = customInputValue.trim();
                                if (formSubcategoriesOptions.some((s: string) => s.toLowerCase() === val.toLowerCase())) {
                                  showToast('Subcategory already exists!', 'warning');
                                  const existing = formSubcategoriesOptions.find((s: string) => s.toLowerCase() === val.toLowerCase()) || val;
                                  setFormData({ ...formData, subcategory: existing, type: '' });
                                  setCustomInputMode(null);
                                  return;
                                }
                                setShowHierarchyConfirm({ type: 'subcategory', value: val, parent: formData.category });
                              }
                            }
                            if (e.key === 'Escape') setCustomInputMode(null);
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                          placeholder="Type new subcategory + Enter"
                        />
                        <button type="button" onClick={() => setCustomInputMode(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={formData.subcategory}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomInputMode('subcategory');
                            setCustomInputValue('');
                          } else {
                            setFormData({ ...formData, subcategory: e.target.value, type: '' });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg"
                        disabled={!formData.category} // Enable if category selected
                      >
                        <option value="">Select Subcategory</option>
                        {formSubcategoriesOptions.map((sub: string) => (
                          <option key={sub} value={sub}>{sub.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                        ))}
                        {formData.category && <option value="__custom__" className="font-bold text-blue-600">+ Add New Subcategory...</option>}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Item Type</label>
                    {customInputMode === 'type' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={customInputValue}
                          onChange={(e) => setCustomInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customInputValue.trim()) {
                                const val = customInputValue.trim();
                                if (formTypesOptions.some((t: string) => t.toLowerCase() === val.toLowerCase())) {
                                  showToast('Type already exists!', 'warning');
                                  const existing = formTypesOptions.find((t: string) => t.toLowerCase() === val.toLowerCase()) || val;
                                  setFormData({ ...formData, type: existing });
                                  setCustomInputMode(null);
                                  return;
                                }
                                setShowHierarchyConfirm({ type: 'type', value: val, parent: formData.subcategory, grandParent: formData.category });
                              }
                            }
                            if (e.key === 'Escape') setCustomInputMode(null);
                          }}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                          placeholder="Type new item type + Enter"
                        />
                        <button type="button" onClick={() => setCustomInputMode(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomInputMode('type');
                            setCustomInputValue('');
                          } else {
                            setFormData({ ...formData, type: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg"
                        disabled={!formData.subcategory}
                      >
                        <option value="">Select Type</option>
                        {formTypesOptions.map((type: string) => (
                          <option key={type} value={type}>{type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                        ))}
                        {formData.subcategory && <option value="__custom__" className="font-bold text-blue-600">+ Add New Type...</option>}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 border rounded ${formData.sizes.includes(size) ? 'bg-black text-white' : 'bg-white'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors - Enhanced UI */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-3">Colors</label>

                  {/* Common Color Presets */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Quick Add (Common Colors):</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Black', hex: '#000000' },
                        { name: 'White', hex: '#FFFFFF' },
                        { name: 'Red', hex: '#FF0000' },
                        { name: 'Blue', hex: '#0000FF' },
                        { name: 'Navy', hex: '#000080' },
                        { name: 'Green', hex: '#008000' },
                        { name: 'Yellow', hex: '#FFFF00' },
                        { name: 'Pink', hex: '#FFC0CB' },
                        { name: 'Purple', hex: '#800080' },
                        { name: 'Orange', hex: '#FFA500' },
                        { name: 'Brown', hex: '#A52A2A' },
                        { name: 'Grey', hex: '#808080' },
                      ].map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            if (!formData.colors.includes(color.name)) {
                              setFormData({ ...formData, colors: [...formData.colors, color.name] });
                            }
                          }}
                          className="px-3 py-1 text-xs border rounded hover:bg-white transition-colors flex items-center gap-2"
                          disabled={formData.colors.includes(color.name)}
                        >
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Added Colors List */}
                  <div className="space-y-2 mb-3">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white border rounded-lg">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                          style={{
                            backgroundColor:
                              ['Black', 'White', 'Red', 'Blue', 'Navy', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey']
                                .find(c => c.toLowerCase() === color.toLowerCase())
                                ? {
                                  'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000',
                                  'blue': '#0000FF', 'navy': '#000080', 'green': '#008000',
                                  'yellow': '#FFFF00', 'pink': '#FFC0CB', 'purple': '#800080',
                                  'orange': '#FFA500', 'brown': '#A52A2A', 'grey': '#808080'
                                }[color.toLowerCase()] || '#CCCCCC'
                                : '#CCCCCC'
                          }}
                        />
                        <span className="flex-1 font-medium">{color}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = formData.colors.filter((_, i) => i !== index);
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter custom color name (e.g., Maroon, Olive)"
                      className="flex-1 px-4 py-2 border rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const colorName = input.value.trim();
                          if (colorName && !formData.colors.includes(colorName)) {
                            setFormData({ ...formData, colors: [...formData.colors, colorName] });
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const colorName = input.value.trim();
                        if (colorName && !formData.colors.includes(colorName)) {
                          setFormData({ ...formData, colors: [...formData.colors, colorName] });
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* Product Images (Main) */}
                <div className="col-span-2 border-t pt-6">
                  <label className="block text-sm font-medium mb-2">Product Images (Main Gallery)</label>
                  <p className="text-xs text-gray-500 mb-2">Manage the main carousel images. Upload local files (with cropping) or paste Image URLs/Google Drive Links.</p>

                  {/* File Upload Input */}
                  <div className="mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files);
                          console.log(`📂 User selected ${newFiles.length} files:`, newFiles.map(f => f.name));

                          setFormData(prev => ({
                            ...prev,
                            selectedFiles: [...prev.selectedFiles, ...newFiles]
                          }));

                          // Clear the input so same files can be selected again
                          e.target.value = '';
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-black file:text-white
                        hover:file:bg-gray-800
                        cursor-pointer
                      "
                    />
                  </div>

                  {/* Selected Local Files Preview */}
                  {formData.selectedFiles && formData.selectedFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">New Files to Upload:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCroppingIndex(index);
                                  setCurrentCropFile(file);
                                }}
                                className="text-white hover:text-blue-300 p-0.5"
                                title="Crop Image"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = [...formData.selectedFiles];
                                  newFiles.splice(index, 1);
                                  setFormData({ ...formData, selectedFiles: newFiles });
                                }}
                                className="text-white hover:text-red-300 p-0.5"
                                title="Remove Image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Image URL (or Google Drive Link)"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-black focus:border-black"
                          />
                        </div>
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Image URL
                    </button>
                  </div>
                </div>

                {/* Variant Pricing Matrix */}
                <div className="col-span-2 border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Variant Pricing Matrix</h3>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={generateVariants}
                        disabled={formData.sizes.length === 0 || formData.colors.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate Variants
                      </button>
                    </div>
                  </div>

                  {formData.variants.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Color</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Price (₹)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Discount (₹)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Stock</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">SKU</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.variants.map((variant, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <select
                                  value={variant.size}
                                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                  className="w-full px-2 py-1 border rounded"
                                >
                                  {['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.color}
                                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                  className="w-full px-2 py-1 border rounded"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={variant.discountPrice || ''}
                                  onChange={(e) => updateVariant(index, 'discountPrice', e.target.value ? Number(e.target.value) : undefined)}
                                  className="w-20 px-2 py-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.sku || ''}
                                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                  className="w-32 px-2 py-1 border rounded"
                                  placeholder="SKU"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeVariant(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="mt-2 text-blue-600 text-sm hover:underline"
                      >
                        + Add Variant
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Videos will be moved below Color Variants */}
                {/* Product Videos */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Videos (URLs)</label>
                  <p className="text-xs text-gray-500 mb-2">Upload files or paste Google Drive/YouTube URLs</p>

                  {formData.videoUrls.map((url, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex gap-2 mb-2">
                        {/* Video URL Input */}
                        <div className="flex-1">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateVideoUrl(index, e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Paste Video URL (YouTube, MP4, or Google Drive Link)"
                          />
                        </div>

                        {/* Remove Button */}
                        {formData.videoUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVideoUrl(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Video Preview Label */}
                      {url && (
                        <div className="mt-1 text-xs text-gray-500">
                          {url.includes('drive.google.com') ? 'Google Drive Link' :
                            url.includes('youtube') || url.includes('youtu.be') ? 'YouTube Link' :
                              'Direct Video Link'}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVideoUrl}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    + Add Another Video
                  </button>
                </div>

                {/* ========== PHASE 4: COLOR VARIANTS WITH VIEW ANGLES ========== */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">🎨 Color Variants</h3>
                    <p className="text-sm text-gray-600">
                      Upload images for each view angle (Front, Back, Side, Detail, Worn)
                    </p>
                  </div>

                  {/* Helper Text */}
                  {formData.variants.length > 0 ? (
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>ℹ️ Note:</strong> Color variants are automatically generated from your Variant Pricing Matrix above.
                        {formData.colorVariants.length > 0 && `Found ${formData.colorVariants.length} color(s): ${formData.colorVariants.map(cv => cv.color).join(', ')}`}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                      <p className="text-sm text-yellow-900">
                        <strong>⚠️ Note:</strong> Add color variants in the Variant Pricing Matrix above to upload images here.
                      </p>
                    </div>
                  )}

                  {formData.colorVariants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="mb-6 p-6 border-2 border-blue-300 rounded-2xl bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Header - Color Name Only (Read-only from matrix) */}
                      <div className="mb-6">
                        <h4 className="font-bold text-2xl text-gray-800 mb-1">{variant.color}</h4>
                        <p className="text-sm text-gray-600">Upload images for all 5 view angles below</p>
                      </div>

                      {/* View Angle Images */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 mb-3">View Angle Images:</p>
                        {(['front', 'back', 'side', 'detail', 'worn'] as const).map((view) => (
                          <div key={view} className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {view === 'front' && '👕'}
                                  {view === 'back' && '🔄'}
                                  {view === 'side' && '↔️'}
                                  {view === 'detail' && '🔍'}
                                  {view === 'worn' && '👤'}
                                </span>
                                <span className="font-medium capitalize text-gray-700">{view} View</span>
                              </div>
                              {variant.images[view] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVariants = [...formData.colorVariants];
                                    newVariants[variantIndex].images[view] = '';
                                    setFormData({ ...formData, colorVariants: newVariants });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <div className="flex gap-2 items-start">
                              {/* URL Input with Drive Link Support */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={variant.images[view] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Auto-convert Google Drive URLs
                                    let convertedUrl = val;
                                    const driveMatch = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                                    if (driveMatch) {
                                      const fileId = driveMatch[1];
                                      convertedUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                                    }

                                    const newVariants = [...formData.colorVariants];
                                    newVariants[variantIndex].images[view] = convertedUrl;
                                    setFormData({ ...formData, colorVariants: newVariants });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder={`Paste ${view} view Image URL or Google Drive Link`}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Supported: Direct Links, Google Drive Sharing Links
                                </p>
                              </div>
                            </div>

                            {/* Image Preview */}
                            {variant.images[view] && (
                              <div className="mt-3 animate-fadeIn">
                                <img
                                  src={variant.images[view]}
                                  alt={`${view} view`}
                                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/96?text=Error';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}


                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        colorVariants: [
                          ...formData.colorVariants,
                          {
                            color: '',
                            colorHex: '#000000',
                            images: { front: '', back: '', side: '', detail: '', worn: '' },
                            stock: 0,
                            sku: ''
                          }
                        ]
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    + Add Color Variant
                  </button>
                </div>

                {/* ========== PHASE 4: SIZE CHART ========== */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">📏 Size Chart</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Size Chart Image</label>
                    <input
                      type="url"
                      value={formData.sizeChart.image}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizeChart: { ...formData.sizeChart, image: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Paste size chart image URL"
                    />
                    {formData.sizeChart.image && (
                      <img
                        src={formData.sizeChart.image}
                        alt="Size chart"
                        className="mt-2 max-w-md border rounded"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Size Measurements</label>
                    {formData.sizeChart.measurements.map((measurement, index) => (
                      <div key={index} className="grid grid-cols-8 gap-2 mb-2 p-3 bg-gray-50 rounded border">
                        <select
                          value={measurement.size}
                          onChange={(e) => {
                            const newMeasurements = [...formData.sizeChart.measurements];
                            newMeasurements[index].size = e.target.value;
                            setFormData({
                              ...formData,
                              sizeChart: { ...formData.sizeChart, measurements: newMeasurements }
                            });
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="">Size</option>
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        {['chest', 'length', 'shoulder', 'sleeve', 'waist', 'hip'].map((field) => (
                          <input
                            key={field}
                            type="text"
                            value={(measurement as any)[field] || ''}
                            onChange={(e) => {
                              const newMeasurements = [...formData.sizeChart.measurements];
                              (newMeasurements[index] as any)[field] = e.target.value;
                              setFormData({
                                ...formData,
                                sizeChart: { ...formData.sizeChart, measurements: newMeasurements }
                              });
                            }}
                            className="px-2 py-1 border rounded text-sm"
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newMeasurements = formData.sizeChart.measurements.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              sizeChart: { ...formData.sizeChart, measurements: newMeasurements }
                            });
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          sizeChart: {
                            ...formData.sizeChart,
                            measurements: [
                              ...formData.sizeChart.measurements,
                              { size: '', chest: '', length: '', shoulder: '', sleeve: '', waist: '', hip: '' }
                            ]
                          }
                        });
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Measurement Row
                    </button>
                  </div>
                </div>

                {/* Manual Rating Manipulation (Review Override) */}
                <div className="border-t-2 border-red-100 pt-8 bg-red-50/30 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Manual Review Override
                  </h3>

                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                    <p className="text-sm text-yellow-900">
                      <strong>⚠️ Caution:</strong> It is not recommended to manipulate review ratings manually.
                      These values are normally calculated from actual customer reviews. Changing them here will override the automated count until a new review is added.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Manual Rating (0-5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating || 0}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Manual Review Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviewCount || 0}
                        onChange={(e) => setFormData({ ...formData, reviewCount: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ========== PHASE 4: DELIVERY INFORMATION ========== */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">🚚 Delivery Information</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Estimated Delivery (Days)</label>
                      <input
                        type="number"
                        value={formData.deliveryInfo.estimatedDays}
                        onChange={(e) => setFormData({
                          ...formData,
                          deliveryInfo: { ...formData.deliveryInfo, estimatedDays: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Free Shipping Above (₹)</label>
                      <input
                        type="number"
                        value={formData.deliveryInfo.freeShippingThreshold}
                        onChange={(e) => setFormData({
                          ...formData,
                          deliveryInfo: { ...formData.deliveryInfo, freeShippingThreshold: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Return Policy</label>
                    <textarea
                      value={formData.deliveryInfo.returnPolicy}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryInfo: { ...formData.deliveryInfo, returnPolicy: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                      placeholder="e.g., 7 days return policy. Product must be unused and in original packaging."
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Settings</h3>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>

                {/* Product Status */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Product Status</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'coming-soon' | 'inactive' })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="active">Active (Available for Purchase)</option>
                        <option value="coming-soon">Coming Soon (Visible but Not Purchasable)</option>
                        <option value="inactive">Inactive (Hidden from Frontend)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.status === 'active' && '✅ Product is live and purchasable'}
                        {formData.status === 'coming-soon' && '🔜 Product shows "Coming Soon" badge, buy buttons disabled'}
                        {formData.status === 'inactive' && '❌ Product is hidden from all frontend pages'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Active (Legacy)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hierarchy Confirmation Modal */}
        {showHierarchyConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Create New {showHierarchyConfirm.type === 'type' ? 'Item Type' : showHierarchyConfirm.type.charAt(0).toUpperCase() + showHierarchyConfirm.type.slice(1)}?</h3>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Do you want to add <strong>"{showHierarchyConfirm.value}"</strong> as a new {showHierarchyConfirm.type}
                  {showHierarchyConfirm.type !== 'category' && (
                    <>
                      {' '}under <strong>"{showHierarchyConfirm.type === 'type' ? showHierarchyConfirm.parent : showHierarchyConfirm.parent.charAt(0).toUpperCase() + showHierarchyConfirm.parent.slice(1)}"</strong>
                      {showHierarchyConfirm.type === 'type' && showHierarchyConfirm.grandParent && (
                        <span> (in {showHierarchyConfirm.grandParent.charAt(0).toUpperCase() + showHierarchyConfirm.grandParent.slice(1)})</span>
                      )}
                    </>
                  )}?
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowHierarchyConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomHierarchy}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium shadow-lg"
                  >
                    Confirm & Add
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
                This will save the new option to the database for future use.
              </div>
            </div>
          </div>
        )}
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
      {/* Image Cropper Modal */}
      {croppingImageSrc && (
        <ImageCropperModal
          imageSrc={croppingImageSrc}
          onClose={handleCancelCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={3 / 4} // Default aspect ratio for apparel
        />
      )}
    </div>
  );
};

export default AdminProductsPage;

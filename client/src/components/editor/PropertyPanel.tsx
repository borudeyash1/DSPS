import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Search, Upload, Crop, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { ImageCropperModal } from '../modals/ImageCropperModal';
import { BlogManager } from '../admin/blog/BlogManager';
import adminApi from '../../services/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const convertGoogleDriveUrl = (url: string, isVideo: boolean = false): string => {
  if (!url) return url;

  let fileId = '';

  // Pattern 1: /file/d/FILE_ID
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) fileId = match1[1];

  // Pattern 2: id=FILE_ID (query param) - covers uc?id= and open?id=
  if (!fileId) {
    const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) fileId = match2[1];
  }

  if (fileId) {
    if (isVideo) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }

  return url;
};


interface PropertyPanelProps {
  element: {
    type: string;
    sectionId: string;
    elementPath: string;
    currentValue: any;
    currentStyle?: any;
    allProducts?: any[]; // For product carousel
    productIndex?: number; // Current product index in carousel
    background?: any; // For sections with editable background
  } | null;
  onClose: () => void;
  onSave: (sectionId: string, updates: { path: string; value: any }[]) => void;
  onLiveUpdate?: (sectionId: string, path: string, value: any) => void;
}

export const PropertyPanel = ({ element, onClose, onSave, onLiveUpdate }: PropertyPanelProps) => {
  // Text states
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState('700');
  const [color, setColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState('center');
  const { toasts, showToast, hideToast } = useToast();

  // Link state
  const [linkValue, setLinkValue] = useState('');

  // Auto-save for array type (add/delete operations)
  useEffect(() => {
    if (element && element.type === 'array') {
      // Immediately save array changes without showing the panel
      const updates = [{ path: element.elementPath, value: element.currentValue }];
      onSave(element.sectionId, updates);
      onClose(); // Close immediately
    }
  }, [element?.type, element?.sectionId]);

  // Image states
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [objectFit, setObjectFit] = useState('cover');
  const [borderRadius, setBorderRadius] = useState(0);

  // Background states
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientDirection, setGradientDirection] = useState(90);
  const [gradientStops, setGradientStops] = useState([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ]);
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgSize, setBgSize] = useState('cover');
  const [bgPosition, setBgPosition] = useState('center');
  const [bgRepeat, setBgRepeat] = useState('no-repeat');
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(30);

  // Button states
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [buttonBgColor, setButtonBgColor] = useState('#000000');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [buttonBorderRadius, setButtonBorderRadius] = useState(4);
  const [buttonPadding, setButtonPadding] = useState({ top: 12, right: 24, bottom: 12, left: 24 });

  // Video states
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const [videoLoop, setVideoLoop] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoControls, setVideoControls] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState('16/9');
  const [videoHeight, setVideoHeight] = useState('auto');
  const [videoObjectFit, setVideoObjectFit] = useState<any>('cover');
  const [videoPadding, setVideoPadding] = useState('0');
  const [videoWidth, setVideoWidth] = useState('100%');
  const [videoAlign, setVideoAlign] = useState<'left' | 'center' | 'right'>('center');


  // Product states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  
  // Blog states
  const [showBlogManager, setShowBlogManager] = useState(false);
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [productColors, setProductColors] = useState<string[]>([]);
  const [productStock, setProductStock] = useState(0);
  const [productCategory, setProductCategory] = useState('');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [displayColor, setDisplayColor] = useState('');
  const [displayColorCode, setDisplayColorCode] = useState('');

  // Product selection from database
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Image Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [cropAspectRatio, setCropAspectRatio] = useState(16 / 9);
  const [isUploading, setIsUploading] = useState(false);
  const [newHotspotX, setNewHotspotX] = useState('50');
  const [newHotspotY, setNewHotspotY] = useState('50');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [localSlides, setLocalSlides] = useState<any[]>([]);
  // Headline Bar states
  const [localHeadlineContent, setLocalHeadlineContent] = useState<any>({});
  const [localHeadlineBg, setLocalHeadlineBg] = useState<any>({});

  // Hero Carousel Global Content State
  const [globalHeading, setGlobalHeading] = useState('');
  const [globalSubheading, setGlobalSubheading] = useState('');
  const [globalCtaText, setGlobalCtaText] = useState('');
  const [globalCtaLink, setGlobalCtaLink] = useState('');

  // Fetch available products from database
  useEffect(() => {
    fetchAvailableProducts();
  }, []);


  const fetchAvailableProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=200&isActive=all&sort=-createdAt`);
      setAvailableProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Common colors for auto-fill
  const commonColors: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'purple': '#a855f7',
    'pink': '#ec4899',
    'gray': '#6b7280',
    'navy': '#0f172a',
    'charcoal': '#1f2937',
    'indigo': '#6366f1',
    'violet': '#8b5cf6',
    'teal': '#14b8a6',
    'cyan': '#06b6d4',
  };

  useEffect(() => {
    if (displayColor && !displayColorCode) {
      const lowerColor = displayColor.toLowerCase().trim();
      const matchedColor = commonColors[Object.keys(commonColors).find(k => lowerColor.includes(k)) || ''];
      if (matchedColor) {
        setDisplayColorCode(matchedColor);
      }
    }
  }, [displayColor]);

  useEffect(() => {
    if (element) {
      if (element.type === 'text') {
        setTextValue(element.currentValue || '');
        if (element.currentStyle) {
          setFontSize(parseInt(element.currentStyle.fontSize) || 32);
          setFontWeight(element.currentStyle.fontWeight || '700');
          setColor(element.currentStyle.color || '#000000');
          setTextAlign(element.currentStyle.textAlign || 'center');
        }
      } else if (element.type === 'image') {
        setImageUrl(element.currentValue?.url || element.currentValue || '');
        setImageAlt(element.currentValue?.alt || '');
        if (element.currentStyle) {
          setObjectFit(element.currentStyle.objectFit || 'cover');
          setBorderRadius(parseInt(element.currentStyle.borderRadius) || 0);
        }
      } else if (element.type === 'background') {
        const bgValue = element.currentValue || {};
        setBgType(bgValue.type || 'solid');
        setBgColor(bgValue.color || '#ffffff');

        if (bgValue.type === 'gradient') {
          setGradientType(bgValue.gradientType || 'linear');
          setGradientDirection(bgValue.direction || 90);
          setGradientStops(bgValue.stops || [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 },
          ]);
        } else if (bgValue.type === 'image') {
          setBgImageUrl(bgValue.imageUrl || '');
          setBgSize(bgValue.size || 'cover');
          setBgPosition(bgValue.position || 'center');
          setBgRepeat(bgValue.repeat || 'no-repeat');
          setOverlayColor(bgValue.overlayColor || '#000000');
          setOverlayOpacity(bgValue.overlayOpacity || 30);
        }
      } else if (element.type === 'button') {
        const btnValue = element.currentValue || {};
        setButtonText(btnValue.text || '');
        setButtonLink(btnValue.link || '');
        setButtonBgColor(btnValue.bgColor || '#000000');
        setButtonTextColor(btnValue.textColor || '#ffffff');
        setButtonBorderRadius(btnValue.borderRadius || 4);
        setButtonPadding(btnValue.padding || { top: 12, right: 24, bottom: 12, left: 24 });
      } else if (element.type === 'video') {
        const vidValue = element.currentValue || {};
        setVideoUrl(vidValue.url || '');
        setVideoThumbnail(vidValue.thumbnail || '');
        setVideoAutoplay(vidValue.autoplay || false);
        setVideoLoop(vidValue.loop || false);
        setVideoMuted(vidValue.muted || false);
        setVideoControls(vidValue.controls !== false);
        setVideoAspectRatio(vidValue.aspectRatio || '16/9');
        setVideoHeight(vidValue.height || 'auto');
        setVideoObjectFit(vidValue.objectFit || 'cover');
        setVideoPadding(vidValue.padding || '0');
        setVideoWidth(vidValue.width || '100%');
        setVideoAlign(vidValue.align || 'center');
      } else if (element.type === 'product') {
        const products = element.allProducts || [];
        const index = element.productIndex || 0;

        setAllProducts(products);
        setTotalProducts(products.length);
        setCurrentProductIndex(index);

        const currentProduct = products[index] || {};
        setProductName(currentProduct.name || '');
        setProductDescription(currentProduct.description || '');
        setProductPrice(currentProduct.price || '');
        setProductOriginalPrice(currentProduct.originalPrice || '');
        setProductImage(currentProduct.image || '');
        setProductSizes(currentProduct.sizes || []);
        setProductColors(currentProduct.colors || []);
        setProductStock(currentProduct.stock || 0);
        setProductCategory(currentProduct.category || '');
        setProductStock(currentProduct.stock || 0);
        setProductCategory(currentProduct.category || '');
        setSelectedProductId(currentProduct.dbId || ''); // Track database ID
        setDisplayColor(currentProduct.color || '');
        setDisplayColorCode(currentProduct.colorCode || '');
      } else if (element.type === 'link') {
        setLinkValue(element.currentValue || '');
      } else if (element.type === 'hero-slides') {
        setLocalSlides(element.currentValue || []);
      } else if (element.type === 'headline-bar') {
        setLocalHeadlineContent(element.currentValue || {});
        setLocalHeadlineBg(element.background || {});
      } else if (element.type === 'hero-slides') {
        // Initialize global content from section data passed through element
        const sectionContent = (element as any).sectionContent;
        setGlobalHeading(sectionContent?.heading || '');
        setGlobalSubheading(sectionContent?.subheading || '');
        setGlobalCtaText(sectionContent?.cta?.text || '');
        setGlobalCtaLink(sectionContent?.cta?.link || '');
      }
    }
  }, [element]);

  if (!element) return null;

  const handleSave = () => {
    const updates: { path: string; value: any }[] = [];

    if (element.type === 'text') {
      updates.push({ path: element.elementPath, value: textValue });
      
      // Check if this is an array item (e.g., content.products.0.name)
      const hasArrayIndex = /\.\d+\./.test(element.elementPath);
      
      // Only add style updates if this is NOT an array item
      // Array items typically don't have separate style objects
      if (!hasArrayIndex && element.currentStyle !== undefined) {
        const basePath = element.elementPath.split('.').slice(0, -1).join('.');
        const propertyName = element.elementPath.split('.').pop();
        const stylePath = `${basePath}.${propertyName}Style`;

        updates.push({ path: `${stylePath}.fontSize`, value: `${fontSize}px` });
        updates.push({ path: `${stylePath}.fontWeight`, value: fontWeight });
        updates.push({ path: `${stylePath}.color`, value: color });
        updates.push({ path: `${stylePath}.textAlign`, value: textAlign });
      }
    } else if (element.type === 'image') {
      const convertedUrl = convertGoogleDriveUrl(imageUrl);
      console.log('💾 Saving image:', {
        originalUrl: imageUrl,
        convertedUrl,
        imageAlt,
        elementPath: element.elementPath,
        objectFit,
        borderRadius
      });

      const isUrlPath = element.elementPath.endsWith('.url');
      if (isUrlPath) {
        console.log('📌 Saving as .url path:', element.elementPath, '=', convertedUrl);
        updates.push({ path: element.elementPath, value: convertedUrl });
        updates.push({ path: element.elementPath.replace('.url', '.alt'), value: imageAlt });
      } else {
        // Check if this is a simple string path (like content.backgroundImage)
        // vs an object path (like content.images[0])
        const pathSegments = element.elementPath.split('.');
        const lastSegment = pathSegments[pathSegments.length - 1];

        // Check if path contains array index (e.g., content.products.0.image)
        const hasArrayIndex = /\.\d+\./.test(element.elementPath);
        
        if (hasArrayIndex) {
          // For array items, just save the URL directly using dot notation
          // MongoDB will handle the nested update correctly
          console.log('📌 Saving as array item:', element.elementPath, '=', convertedUrl);
          updates.push({ path: element.elementPath, value: convertedUrl });
        } else if (lastSegment === 'backgroundImage' || lastSegment === 'image' || lastSegment === 'thumbnail') {
          // If the path contains 'backgroundImage' or similar simple image fields, save as string
          console.log('📌 Saving as simple string:', element.elementPath, '=', convertedUrl);
          updates.push({ path: element.elementPath, value: convertedUrl });
        } else {
          // Otherwise save as object with url and alt
          console.log('📌 Saving as object:', element.elementPath, '=', { url: convertedUrl, alt: imageAlt });
          updates.push({ path: element.elementPath, value: { url: convertedUrl, alt: imageAlt } });
        }
      }

      // Always save style if it's a URL path or if currentStyle is present
      if (isUrlPath || element.currentStyle !== undefined) {
        const basePath = element.elementPath.split('.').slice(0, -1).join('.');
        const propertyName = element.elementPath.split('.').pop();
        const stylePath = `${basePath}.${propertyName}Style`;
        updates.push({ path: `${stylePath}.objectFit`, value: objectFit });
        updates.push({ path: `${stylePath}.borderRadius`, value: `${borderRadius}px` });
      }
    } else if (element.type === 'background') {
      const backgroundValue: any = { type: bgType };

      if (bgType === 'solid') {
        backgroundValue.color = bgColor;
      } else if (bgType === 'gradient') {
        backgroundValue.gradientType = gradientType;
        backgroundValue.direction = gradientDirection;
        backgroundValue.stops = gradientStops;
      } else if (bgType === 'image') {
        backgroundValue.imageUrl = bgImageUrl;
        backgroundValue.size = bgSize;
        backgroundValue.position = bgPosition;
        backgroundValue.repeat = bgRepeat;
        backgroundValue.overlayColor = overlayColor;
        backgroundValue.overlayOpacity = overlayOpacity;
      }

      updates.push({ path: element.elementPath, value: backgroundValue });
    } else if (element.type === 'button') {
      const buttonValue = {
        text: buttonText,
        link: buttonLink,
        bgColor: buttonBgColor,
        textColor: buttonTextColor,
        borderRadius: buttonBorderRadius,
        padding: buttonPadding,
      };
      updates.push({ path: element.elementPath, value: buttonValue });
    } else if (element.type === 'video') {
      const videoValue = {
        url: convertGoogleDriveUrl(videoUrl, true),
        thumbnail: videoThumbnail,
        autoplay: videoAutoplay,
        loop: videoLoop,
        muted: videoMuted,
        controls: videoControls,
        aspectRatio: videoAspectRatio,
        height: videoHeight,
        objectFit: videoObjectFit,
        padding: videoPadding,
        width: videoWidth,
        align: videoAlign
      };
      updates.push({ path: element.elementPath, value: videoValue });
    } else if (element.type === 'product') {
      const productValue = {
        id: allProducts[currentProductIndex]?.id || Date.now(),
        dbId: selectedProductId, // Store database ID for reference
        name: productName,
        description: productDescription,
        price: productPrice,
        originalPrice: productOriginalPrice,
        image: productImage,
        sizes: productSizes,
        colors: productColors,
        stock: productStock,
        category: productCategory,
        // Specific for Slide Into Colors component
        color: displayColor,
        colorCode: displayColorCode,
      };

      // Update the entire products array with the modified product
      const updatedProducts = [...allProducts];
      updatedProducts[currentProductIndex] = productValue;
      updates.push({ path: element.elementPath, value: updatedProducts });
    } else if (element.type === 'array') {
      // Direct array update (for add/delete operations)
      updates.push({ path: element.elementPath, value: element.currentValue });
    } else if (element.type === 'link') {
      updates.push({ path: element.elementPath, value: linkValue });
    } else if (element.type === 'hero-slides') {
      updates.push({ path: element.elementPath, value: localSlides });
    } else if (element.type === 'headline-bar') {
      updates.push({ path: 'content', value: localHeadlineContent });
      updates.push({ path: 'background', value: localHeadlineBg });
    } else if (element.type === 'blog-grid') {
      updates.push({ path: element.elementPath, value: element.currentValue });
    }

    onSave(element.sectionId, updates);
    onClose();
  };

  // Helper function to update nested properties
  const handleChange = (path: string, value: any) => {
    const updates = [{ path, value }];
    onSave(element.sectionId, updates);
    // Don't close immediately - let user add multiple hotspots
  };

  const addGradientStop = () => {
    setGradientStops([...gradientStops, { color: '#000000', position: 50 }]);
  };

  const removeGradientStop = (index: number) => {
    if (gradientStops.length > 2) {
      setGradientStops(gradientStops.filter((_, i) => i !== index));
    }
  };

  const updateGradientStop = (index: number, field: 'color' | 'position', value: any) => {
    const newStops = [...gradientStops];
    newStops[index] = { ...newStops[index], [field]: value };
    setGradientStops(newStops);
  };

  // Handle product selection from database
  const handleProductSelect = (productId: string) => {
    const selected = availableProducts.find(p => p._id === productId);
    if (!selected) return;

    setSelectedProductId(productId);
    setProductName(selected.name);
    setProductDescription(selected.description);
    setProductPrice(`₹${selected.price}`);
    setProductOriginalPrice(selected.discountPrice ? `₹${selected.discountPrice}` : '');
    setProductImage(selected.images?.[0]?.url || '');
    setProductSizes(selected.sizes || []);
    setProductColors(selected.colors || []);
    setProductStock(selected.stock);
    setProductCategory(selected.category);
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result?.toString() || '');
        // Determine aspect ratio based on element type/path if possible, default to 16/9
        // For hero images, 16/9 is good. For banners, maybe different.
        setCropAspectRatio(16 / 9);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      // Reset input value so same file can be selected again
      event.target.value = '';
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setShowCropper(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', blob, 'cropped-image.jpg');

      // Upload to specific images folder
      const response = await adminApi.post(`/sections/upload-image?folder=images/sections`, formData);

      if (response.data.success) {
        const fullUrl = response.data.data.url;

        if (element?.type === 'image') {
          onLiveUpdate?.(element.sectionId, element.elementPath, fullUrl);
          setImageUrl(fullUrl);
        } else if (element?.type === 'background') {
          setBgImageUrl(fullUrl);
          if (onLiveUpdate && element?.sectionId) {
            // Reconstruct background object for live preview
            const backgroundValue = {
              type: 'image',
              imageUrl: fullUrl,
              size: bgSize,
              position: bgPosition,
              repeat: bgRepeat,
              overlayColor: overlayColor,
              overlayOpacity: overlayOpacity
            };
            onLiveUpdate(element.sectionId, element.elementPath, backgroundValue);
          }
        } else if (element?.type === 'hero-slides') {
          if (activeSlideIndex !== null) {
            const newSlides = [...localSlides];
            if (newSlides[activeSlideIndex]) {
              newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], url: fullUrl };
              setLocalSlides(newSlides);
              if (onLiveUpdate) {
                onLiveUpdate(element.sectionId, element.elementPath, newSlides);
              }
            }
          }
        } else if (element?.type === 'video') {
            setVideoThumbnail(fullUrl);
            if (onLiveUpdate && element?.sectionId) {
                const newVideoData = {
                  url: videoUrl,
                  thumbnail: fullUrl,
                  autoplay: videoAutoplay,
                  loop: videoLoop,
                  muted: videoMuted,
                  controls: videoControls
                };
                onLiveUpdate(element.sectionId, element.elementPath, newVideoData);
            }
        } else if (element?.type === 'headline-bar') {
            const newBg = { ...localHeadlineBg, imageUrl: fullUrl };
            setLocalHeadlineBg(newBg);
            if (onLiveUpdate && element?.sectionId) {
                onLiveUpdate(element.sectionId, 'background', newBg);
            }
        }
        
        showToast('Image uploaded successfully! Click Save to apply changes.', 'success');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showToast('Failed to upload image', 'error');
      setIsUploading(false);
    }
  };

  const handleVideoFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        showToast('File size exceeds 100MB limit', 'error');
        return;
      }

      setIsUploading(true);
      try {


        const formData = new FormData();
        formData.append('video', file);

        // Upload to specific video folder
        // Upload to specific video folder
        const response = await adminApi.post(`/sections/upload-video?folder=videos/sections`, formData);

        if (response.data.success) {
          const fullUrl = response.data.data.url;
          setVideoUrl(fullUrl);

          if (onLiveUpdate && element?.sectionId) {
            // Update the specific video object fields
            const newVideoData = {
              url: fullUrl,
              thumbnail: videoThumbnail,
              autoplay: videoAutoplay,
              loop: videoLoop,
              muted: videoMuted,
              controls: videoControls,
              aspectRatio: videoAspectRatio
            };
            onLiveUpdate(element.sectionId, element.elementPath, newVideoData);
          }
        }
      } catch (error) {
        console.error('Video upload error:', error);
        showToast('Failed to upload video', 'error');
      } finally {
        setIsUploading(false);
        // Reset input
        event.target.value = '';
      }
    }
  };




  const renderEditor = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Content</label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-secondary">{fontSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Align</label>
              <div className="grid grid-cols-4 gap-2">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => setTextAlign(align)}
                    className={`px-3 py-2 border rounded capitalize text-sm ${textAlign === align ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
                      }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            {imageUrl && (
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="border border-border rounded p-2 bg-gray-50 relative group">
                  <img
                    src={imageUrl}
                    alt={imageAlt || 'Preview'}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: objectFit as any,
                      borderRadius: `${borderRadius}px`,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Invalid+URL';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => {
                        setImageToCrop(imageUrl);
                        setShowCropper(true);
                      }}
                      className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-gray-100"
                    >
                      <Crop className="w-4 h-4" /> RE-CROP
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div>
                <label className="block text-sm font-medium mb-2">Image Source (URL, Drive Link, or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Auto-convert Google Drive URLs
                      const converted = convertGoogleDriveUrl(val);
                      setImageUrl(converted);
                      if (onLiveUpdate && element?.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, converted);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg or Drive Link"
                  />
                  <label className="cursor-pointer bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 flex items-center justify-center min-w-[40px]" title="Upload File">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                    />
                  </label>
                </div>
              </div>
              {isUploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the image"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Object Fit</label>
              <select
                value={objectFit}
                onChange={(e) => setObjectFit(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="cover">Cover (fill container)</option>
                <option value="contain">Contain (fit inside)</option>
                <option value="fill">Fill (stretch)</option>
                <option value="none">None (original size)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Border Radius</label>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-secondary">{borderRadius}px</span>
            </div>
          </div>
        );


      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Redirect URL</label>
              <input
                type="text"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/category/example or https://example.com"
              />
              <p className="text-xs text-secondary mt-1">
                Enter an internal path (e.g., /products) or full URL.
              </p>
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background Type</label>
              <select
                value={bgType}
                onChange={(e) => setBgType(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>

            {bgType === 'solid' && (
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {bgType === 'gradient' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Gradient Type</label>
                  <select
                    value={gradientType}
                    onChange={(e) => setGradientType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded"
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>

                {gradientType === 'linear' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Direction</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradientDirection}
                      onChange={(e) => setGradientDirection(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-secondary">{gradientDirection}°</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Color Stops</label>
                    <button
                      type="button"
                      onClick={addGradientStop}
                      className="text-xs px-2 py-1 bg-primary text-white rounded flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  {gradientStops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                        className="h-8 w-16 rounded cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateGradientStop(index, 'position', Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs w-10">{stop.position}%</span>
                      {gradientStops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeGradientStop(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
            }

            {
              bgType === 'image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Source</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bgImageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          const converted = convertGoogleDriveUrl(val);
                          setBgImageUrl(converted);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com/background.jpg"
                      />
                      <label className="cursor-pointer bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 flex items-center justify-center min-w-[40px]" title="Upload File">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <select
                      value={bgSize}
                      onChange={(e) => setBgSize(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <select
                      value={bgPosition}
                      onChange={(e) => setBgPosition(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Overlay Color</label>
                    <input
                      type="color"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="h-10 w-full rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Overlay Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-secondary">{overlayOpacity}%</span>
                  </div>
                </>
              )
            }
          </div >
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
                placeholder="Click me"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link URL</label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
                placeholder="/products"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonBgColor}
                  onChange={(e) => setButtonBgColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={buttonBgColor}
                  onChange={(e) => setButtonBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => setButtonTextColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={buttonTextColor}
                  onChange={(e) => setButtonTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Border Radius</label>
              <input
                type="range"
                min="0"
                max="50"
                value={buttonBorderRadius}
                onChange={(e) => setButtonBorderRadius(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-secondary">{buttonBorderRadius}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Padding</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-secondary">Top</label>
                  <input
                    type="number"
                    value={buttonPadding.top}
                    onChange={(e) => setButtonPadding({ ...buttonPadding, top: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary">Right</label>
                  <input
                    type="number"
                    value={buttonPadding.right}
                    onChange={(e) => setButtonPadding({ ...buttonPadding, right: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary">Bottom</label>
                  <input
                    type="number"
                    value={buttonPadding.bottom}
                    onChange={(e) => setButtonPadding({ ...buttonPadding, bottom: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary">Left</label>
                  <input
                    type="number"
                    value={buttonPadding.left}
                    onChange={(e) => setButtonPadding({ ...buttonPadding, left: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setVideoUrl(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: newVal,
                            thumbnail: videoThumbnail,
                            autoplay: videoAutoplay,
                            loop: videoLoop,
                            muted: videoMuted,
                            controls: videoControls,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <label className={`cursor-pointer bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 flex items-center justify-center min-w-[40px] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} title="Upload Video">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoFileSelect}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-secondary mt-1">YouTube, Vimeo, or direct video URL</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoThumbnail}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setVideoThumbnail(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: newVal,
                            autoplay: videoAutoplay,
                            loop: videoLoop,
                            muted: videoMuted,
                            controls: videoControls,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <label className="cursor-pointer bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 flex items-center justify-center min-w-[40px]" title="Upload & Crop Thumbnail">
                  <Crop className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoAutoplay}
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    setVideoAutoplay(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: videoThumbnail,
                            autoplay: newVal,
                            loop: videoLoop,
                            muted: videoMuted,
                            controls: videoControls,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Autoplay</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoLoop}
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    setVideoLoop(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: videoThumbnail,
                            autoplay: videoAutoplay,
                            loop: newVal,
                            muted: videoMuted,
                            controls: videoControls,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Loop</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoMuted}
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    setVideoMuted(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: videoThumbnail,
                            autoplay: videoAutoplay,
                            loop: videoLoop,
                            muted: newVal,
                            controls: videoControls,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Muted</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={videoControls}
                  onChange={(e) => {
                    const newVal = e.target.checked;
                    setVideoControls(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: videoThumbnail,
                            autoplay: videoAutoplay,
                            loop: videoLoop,
                            muted: videoMuted,
                            controls: newVal,
                            aspectRatio: videoAspectRatio,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show Controls</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio (Screen Size)</label>
              <select
                value={videoAspectRatio}
                onChange={(e) => {
                    const newVal = e.target.value;
                    setVideoAspectRatio(newVal);
                    if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, element.elementPath, {
                            url: videoUrl,
                            thumbnail: videoThumbnail,
                            autoplay: videoAutoplay,
                            loop: videoLoop,
                            muted: videoMuted,
                            controls: videoControls,
                            aspectRatio: newVal,
                            height: videoHeight,
                            objectFit: videoObjectFit
                        });
                    }
                }}
                className="w-full px-3 py-2 border border-border rounded"
              >
                <option value="16/9">16:9 (Widescreen)</option>
                <option value="4/3">4:3 (Standard)</option>
                <option value="1/1">1:1 (Square)</option>
                <option value="21/9">21:9 (Ultrawide)</option>
                <option value="9/16">9:16 (Vertical)</option>
                <option value="auto">Auto / Custom Height</option>
              </select>
            </div>

            {/* Custom Height (only if Aspect Ratio is Auto) */}
            {videoAspectRatio === 'auto' && (
               <div>
                  <label className="block text-sm font-medium mb-2">Video Height (Section)</label>
                  <div className="space-y-2">
                    <select
                        value={videoHeight.includes('px') ? 'custom' : videoHeight} // simplified logic
                        onChange={(e) => {
                            const newVal = e.target.value;
                            if (newVal === 'custom') return; // handle custom logic if needed
                            setVideoHeight(newVal);
                            if (onLiveUpdate && element.sectionId) {
                                onLiveUpdate(element.sectionId, element.elementPath, {
                                    url: videoUrl,
                                    thumbnail: videoThumbnail,
                                    autoplay: videoAutoplay,
                                    loop: videoLoop,
                                    muted: videoMuted,
                                    controls: videoControls,
                                    aspectRatio: videoAspectRatio,
                                    height: newVal,
                                    objectFit: videoObjectFit,
                                    padding: videoPadding,
                                    width: videoWidth,
                                    align: videoAlign
                                });
                            }
                        }}
                        className="w-full px-3 py-2 border border-border rounded"
                    >
                        <option value="">Default (Min 50vh / 100vh)</option>
                        <option value="100vh">Full Screen (100vh)</option>
                        <option value="75vh">3/4 Screen (75vh)</option>
                        <option value="50vh">Half Screen (50vh)</option>
                        <option value="25vh">Quarter Screen (25vh)</option>
                        {/* Keep pixel options as fallback */}
                        <option value="600px">Fixed 600px</option>
                        <option value="400px">Fixed 400px</option>
                    </select>
                    
                    {/* Height Slider */}
                    <div className="flex items-center gap-2">
                        <input
                        type="range"
                        min="20"
                        max="120"
                        value={parseInt(videoHeight) || 50} // Default 50 for slider if empty
                        onChange={(e) => {
                            const newVal = `${e.target.value}vh`;
                            setVideoHeight(newVal);
                            if (onLiveUpdate && element.sectionId) {
                                onLiveUpdate(element.sectionId, element.elementPath, {
                                    url: videoUrl,
                                    thumbnail: videoThumbnail,
                                    autoplay: videoAutoplay,
                                    loop: videoLoop,
                                    muted: videoMuted,
                                    controls: videoControls,
                                    aspectRatio: videoAspectRatio,
                                    height: newVal,
                                    objectFit: videoObjectFit,
                                    padding: videoPadding,
                                    width: videoWidth,
                                    align: videoAlign
                                });
                            }
                        }}
                        className="flex-1"
                        />
                        <span className="text-xs text-secondary w-12 text-right">{videoHeight || 'Auto'}</span>
                    </div>
                  </div>
               </div>
            )}

            <div>
               <label className="block text-sm font-medium mb-2">Video Fit (Crop)</label>
               <div className="flex bg-muted p-1 rounded">
                  <button
                    onClick={() => {
                        const newVal = 'cover';
                        setVideoObjectFit(newVal);
                        if (onLiveUpdate && element.sectionId) {
                            onLiveUpdate(element.sectionId, element.elementPath, {
                                url: videoUrl,
                                thumbnail: videoThumbnail,
                                autoplay: videoAutoplay,
                                loop: videoLoop,
                                muted: videoMuted,
                                controls: videoControls,
                                aspectRatio: videoAspectRatio,
                                height: videoHeight,
                                objectFit: newVal
                            });
                        }
                    }}
                    className={`flex-1 py-1 text-xs rounded ${videoObjectFit === 'cover' ? 'bg-white shadow' : ''}`}
                  >
                    Cover (Crop)
                  </button>
                  <button
                    onClick={() => {
                        const newVal = 'contain';
                        setVideoObjectFit(newVal);
                        if (onLiveUpdate && element.sectionId) {
                            onLiveUpdate(element.sectionId, element.elementPath, {
                                url: videoUrl,
                                thumbnail: videoThumbnail,
                                autoplay: videoAutoplay,
                                loop: videoLoop,
                                muted: videoMuted,
                                controls: videoControls,
                                aspectRatio: videoAspectRatio,
                                height: videoHeight,
                                objectFit: newVal
                            });
                        }
                    }}
                    className={`flex-1 py-1 text-xs rounded ${videoObjectFit === 'contain' ? 'bg-white shadow' : ''}`}
                  >
                    Contain (Fit)
                  </button>
               </div>
               <p className="text-xs text-secondary mt-1">Controls how the video fits within the selected size.</p>
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">Frame Width (Resize)</label>
               <div className="flex items-center gap-3">
                 <input
                   type="range"
                   min="20"
                   max="100"
                   step="5"
                   value={parseInt(videoWidth) || 100}
                   onChange={(e) => {
                     const newVal = `${e.target.value}%`;
                     setVideoWidth(newVal);
                     if (onLiveUpdate && element.sectionId) {
                       onLiveUpdate(element.sectionId, element.elementPath, {
                         url: videoUrl,
                         thumbnail: videoThumbnail,
                         autoplay: videoAutoplay,
                         loop: videoLoop,
                         muted: videoMuted,
                         controls: videoControls,
                         aspectRatio: videoAspectRatio,
                         height: videoHeight,
                         objectFit: videoObjectFit,
                         width: newVal,
                         align: videoAlign,
                         padding: videoPadding
                       });
                     }
                   }}
                   className="flex-1"
                 />
                 <span className="text-sm w-12 text-right">{videoWidth}</span>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">Alignment</label>
               <div className="flex bg-muted p-1 rounded">
                 {['left', 'center', 'right'].map((align) => (
                   <button
                     key={align}
                     onClick={() => {
                       const newVal = align as any;
                       setVideoAlign(newVal);
                       if (onLiveUpdate && element.sectionId) {
                         onLiveUpdate(element.sectionId, element.elementPath, {
                           url: videoUrl,
                           thumbnail: videoThumbnail,
                           autoplay: videoAutoplay,
                           loop: videoLoop,
                           muted: videoMuted,
                           controls: videoControls,
                           aspectRatio: videoAspectRatio,
                           height: videoHeight,
                           objectFit: videoObjectFit,
                           width: videoWidth,
                           align: newVal,
                           padding: videoPadding
                         });
                       }
                     }}
                     className={`flex-1 py-1 text-xs rounded capitalize ${videoAlign === align ? 'bg-white shadow' : ''}`}
                   >
                     {align}
                   </button>
                 ))}
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">Frame Padding</label>
               <select
                 value={videoPadding}
                 onChange={(e) => {
                     const newVal = e.target.value;
                     setVideoPadding(newVal);
                     if (onLiveUpdate && element.sectionId) {
                         onLiveUpdate(element.sectionId, element.elementPath, {
                             url: videoUrl,
                             thumbnail: videoThumbnail,
                             autoplay: videoAutoplay,
                             loop: videoLoop,
                             muted: videoMuted,
                             controls: videoControls,
                             aspectRatio: videoAspectRatio,
                             height: videoHeight,
                             objectFit: videoObjectFit,
                             width: videoWidth,
                             align: videoAlign,
                             padding: newVal
                         });

                     }
                 }}
                 className="w-full px-3 py-2 border border-border rounded"
               >
                 <option value="0px">None (Full Bleed)</option>
                 <option value="16px">Small (16px)</option>
                 <option value="32px">Medium (32px)</option>
                 <option value="64px">Large (64px)</option>
                 <option value="128px">Extra Large (128px)</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">Container Width</label>
               <div className="flex items-center gap-2">
                 <input
                   type="range"
                   min="20"
                   max="100"
                   value={parseInt(videoWidth) || 100}
                   onChange={(e) => {
                       const newVal = `${e.target.value}%`;
                       setVideoWidth(newVal);
                       if (onLiveUpdate && element.sectionId) {
                           onLiveUpdate(element.sectionId, element.elementPath, {
                               url: videoUrl,
                               thumbnail: videoThumbnail,
                               autoplay: videoAutoplay,
                               loop: videoLoop,
                               muted: videoMuted,
                               controls: videoControls,
                               aspectRatio: videoAspectRatio,
                               height: videoHeight,
                               objectFit: videoObjectFit,
                               padding: videoPadding,
                               width: newVal,
                               align: videoAlign
                           });
                       }
                   }}
                   className="flex-1"
                 />
                 <span className="text-xs text-secondary w-12 text-right">{videoWidth}</span>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-2">Alignment</label>
               <div className="flex bg-muted p-1 rounded">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => {
                          const newVal = align as any;
                          setVideoAlign(newVal);
                          if (onLiveUpdate && element.sectionId) {
                              onLiveUpdate(element.sectionId, element.elementPath, {
                                  url: videoUrl,
                                  thumbnail: videoThumbnail,
                                  autoplay: videoAutoplay,
                                  loop: videoLoop,
                                  muted: videoMuted,
                                  controls: videoControls,
                                  aspectRatio: videoAspectRatio,
                                  height: videoHeight,
                                  objectFit: videoObjectFit,
                                  padding: videoPadding,
                                  width: videoWidth,
                                  align: newVal
                              });
                          }
                      }}
                      className={`flex-1 py-1 text-xs rounded capitalize ${videoAlign === align ? 'bg-white shadow' : ''}`}
                    >
                      {align}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'hero-slides':
        return (
          <div className="space-y-4">
            {/* Global Content Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
                Global Content (Default for All Slides)
              </h3>
              <p className="text-xs text-blue-700 mb-4">
                This content appears on all slides unless overridden in individual slide settings below.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Global Heading</label>
                  <input
                    type="text"
                    value={globalHeading}
                    onChange={(e) => {
                      setGlobalHeading(e.target.value);
                      if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, 'content.heading', e.target.value);
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="e.g., Top Premium Shirt Collection"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Global Subheading</label>
                  <textarea
                    value={globalSubheading}
                    onChange={(e) => {
                      setGlobalSubheading(e.target.value);
                      if (onLiveUpdate && element.sectionId) {
                        onLiveUpdate(element.sectionId, 'content.subheading', e.target.value);
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    rows={2}
                    placeholder="e.g., New Winter Fits For Him & Her"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Global CTA Text</label>
                    <input
                      type="text"
                      value={globalCtaText}
                      onChange={(e) => {
                        setGlobalCtaText(e.target.value);
                        if (onLiveUpdate && element.sectionId) {
                          const updatedCta = { text: e.target.value, link: globalCtaLink };
                          onLiveUpdate(element.sectionId, 'content.cta', updatedCta);
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="e.g., EXPLORE NOW"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Global CTA Link</label>
                    <input
                      type="text"
                      value={globalCtaLink}
                      onChange={(e) => {
                        setGlobalCtaLink(e.target.value);
                        if (onLiveUpdate && element.sectionId) {
                          const updatedCta = { text: globalCtaText, link: e.target.value };
                          onLiveUpdate(element.sectionId, 'content.cta', updatedCta);
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="/products"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slides Management */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Slides ({localSlides.length})</label>
              <button
                onClick={() => {
                  const newSlide = {
                    url: 'https://via.placeholder.com/1920x1080',
                    alt: 'New Slide',
                  };
                  const newImages = [...localSlides, newSlide];
                  setLocalSlides(newImages);
                  if (onLiveUpdate && element.sectionId) {
                    onLiveUpdate(element.sectionId, element.elementPath, newImages);
                  }
                }}
                className="text-xs px-2 py-1 bg-primary text-white rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Slide
              </button>
            </div>

            <div className="space-y-4">
              {localSlides.map((slide: any, index: number) => {
                const isExpanded = activeSlideIndex === index;
                
                return (
                <div key={index} className="border rounded bg-gray-50 overflow-hidden">
                  {/* Header / Summary */}
                  <div 
                    className="flex items-center gap-3 p-3 bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveSlideIndex(isExpanded ? null : index)}
                  >
                     <button className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                     </button>
                    
                    <div className="w-12 h-8 rounded overflow-hidden bg-gray-200 flex-shrink-0 relative group">
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{slide.heading || `Slide ${index + 1}`}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newImages = [...localSlides];
                        newImages.splice(index, 1);
                        setLocalSlides(newImages);
                        if (onLiveUpdate && element.sectionId) {
                          onLiveUpdate(element.sectionId, element.elementPath, newImages);
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                      title="Remove Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-3 space-y-4">
                        {/* Image & Alt */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Image URL</label>
                                <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={slide.url}
                                    onChange={(e) => {
                                    const newUrl = convertGoogleDriveUrl(e.target.value);
                                    const newSlides = [...localSlides];
                                    newSlides[index] = { ...newSlides[index], url: newUrl };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                        onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-border rounded"
                                    placeholder="https://..."
                                />
                                <label className="cursor-pointer bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 flex items-center justify-center min-w-[32px]" title="Upload Image">
                                    <Upload className="w-3 h-3" />
                                    <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        // setActiveSlideIndex(index); // Already active
                                        handleImageFileSelect(e);
                                    }}
                                    />
                                </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Alt Text</label>
                                <input
                                type="text"
                                value={slide.alt || ''}
                                onChange={(e) => {
                                    const newSlides = [...localSlides];
                                    newSlides[index] = { ...newSlides[index], alt: e.target.value };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                    onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                }}
                                className="w-full px-2 py-1 text-sm border border-border rounded"
                                placeholder="Slide description"
                                />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="pt-3 border-t border-gray-200 space-y-3">
                             <h4 className="text-xs font-bold text-gray-500 uppercase">Content (Override)</h4>
                             
                             <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Heading</label>
                                <input
                                type="text"
                                value={slide.heading || ''}
                                onChange={(e) => {
                                    const newSlides = [...localSlides];
                                    newSlides[index] = { ...newSlides[index], heading: e.target.value };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                        onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                }}
                                className="w-full px-2 py-1 text-sm border border-border rounded"
                                placeholder="Leave empty to use global heading"
                                />
                             </div>

                             <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">Subheading</label>
                                <textarea
                                value={slide.subheading || ''}
                                onChange={(e) => {
                                    const newSlides = [...localSlides];
                                    newSlides[index] = { ...newSlides[index], subheading: e.target.value };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                        onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                }}
                                className="w-full px-2 py-1 text-sm border border-border rounded"
                                rows={2}
                                placeholder="Leave empty to use global subheading"
                                />
                             </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">CTA Button Text</label>
                                <input
                                type="text"
                                value={slide.cta?.text || ''}
                                onChange={(e) => {
                                    const newSlides = [...localSlides];
                                    // Ensure CTA object exists
                                    const currentCta = newSlides[index].cta || {};
                                    newSlides[index] = { 
                                        ...newSlides[index], 
                                        cta: { ...currentCta, text: e.target.value } 
                                    };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                        onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                }}
                                className="w-full px-2 py-1 text-sm border border-border rounded"
                                placeholder="Button Label"
                                />
                             </div>

                             <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">CTA Link</label>
                                <input
                                type="text"
                                value={slide.cta?.link || ''}
                                onChange={(e) => {
                                    const newSlides = [...localSlides];
                                    const currentCta = newSlides[index].cta || {};
                                    newSlides[index] = { 
                                        ...newSlides[index], 
                                        cta: { ...currentCta, link: e.target.value } 
                                    };
                                    setLocalSlides(newSlides);
                                    if (onLiveUpdate && element.sectionId) {
                                        onLiveUpdate(element.sectionId, element.elementPath, newSlides);
                                    }
                                }}
                                className="w-full px-2 py-1 text-sm border border-border rounded"
                                placeholder="/products/..."
                                />
                             </div>
                        </div>
                    </div>
                  )}
                </div>
              )})}
            </div>

            <p className="text-xs text-secondary mt-2">
              Add URLs or upload images for each slide. Reorder functionality coming soon.
            </p>
          </div>
        );

      case 'product':
        const handleNavigateProduct = (newIndex: number) => {
          // Save current product before navigating
          const updatedProducts = [...allProducts];
          updatedProducts[currentProductIndex] = {
            id: allProducts[currentProductIndex]?.id || Date.now(),
            dbId: selectedProductId, // Include database ID
            name: productName,
            description: productDescription,
            price: productPrice,
            originalPrice: productOriginalPrice,
            image: productImage,
            sizes: productSizes,
            colors: productColors,
            stock: productStock,
            category: productCategory,
          };
          setAllProducts(updatedProducts);

          // Load new product
          setCurrentProductIndex(newIndex);
          const newProduct = updatedProducts[newIndex] || {};
          setProductName(newProduct.name || '');
          setProductDescription(newProduct.description || '');
          setProductPrice(newProduct.price || '');
          setProductOriginalPrice(newProduct.originalPrice || '');
          setProductImage(newProduct.image || '');
          setProductSizes(newProduct.sizes || []);
          setProductColors(newProduct.colors || []);
          setProductStock(newProduct.stock || 0);
          setProductCategory(newProduct.category || '');
          setSelectedProductId(newProduct.dbId || ''); // Load database ID
        };

        const handleAddNewProduct = () => {
          // Create a new empty slot for product selection
          const newProduct = {
            id: Date.now(),
            dbId: '', // Empty - user will select from dropdown
            name: 'New Product', // Give it a name so it's visible in preview
            description: '',
            price: '',
            originalPrice: '',
            image: '', // Placeholder image?
            sizes: [],
            colors: [],
            stock: 0,
            category: '',
          };
          const updatedProducts = [...allProducts, newProduct];
          setAllProducts(updatedProducts);
          setTotalProducts(updatedProducts.length);
          setCurrentProductIndex(updatedProducts.length - 1);

          // Reset form states for the new product
          setProductName('New Product');
          setProductDescription('');
          setProductPrice('');
          setProductOriginalPrice('');
          setProductImage('');
          setProductSizes([]);
          setProductColors([]);
          setProductStock(0);
          setProductCategory('');
          setSelectedProductId('');
          setDisplayColor('');
          setDisplayColorCode('');

          // Trigger live update so the new card appears in the carousel immediately
          if (element && onLiveUpdate) {
            onLiveUpdate(element.sectionId, element.elementPath, updatedProducts);
          }
        };

        return (
          <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <button
                onClick={() => handleNavigateProduct(Math.max(0, currentProductIndex - 1))}
                disabled={currentProductIndex === 0}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Previous
              </button>
              <span className="font-medium">
                Product {currentProductIndex + 1} of {totalProducts}
              </span>
              <button
                onClick={() => handleNavigateProduct(Math.min(totalProducts - 1, currentProductIndex + 1))}
                disabled={currentProductIndex >= totalProducts - 1}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next →
              </button>
            </div>

            {/* Product Database Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Product from Database
              </label>

              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="">-- Select a Product --</option>
                {availableProducts
                  .filter(p => !productSearchTerm ||
                    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    (p.subcategory && p.subcategory.toLowerCase().includes(productSearchTerm.toLowerCase()))
                  )
                  .map((product: any) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ₹{product.price} ({product.category})
                    </option>
                  ))}
              </select>
            </div>

            {/* Slide Color Settings (Editable) */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Slide Display Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Display Color Name</label>
                  <input
                    type="text"
                    value={displayColor}
                    onChange={(e) => setDisplayColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="E.g. Black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Color Hex</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={displayColorCode || '#000000'}
                      onChange={(e) => setDisplayColorCode(e.target.value)}
                      className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={displayColorCode}
                      onChange={(e) => setDisplayColorCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                * These settings determine how the product is categorized in the "Slide Into Colors" slider.
              </p>
            </div >

            {/* Selected Product Display (Read-Only) */}
            {
              selectedProductId && productName && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Selected Product
                  </div>

                  {/* Product Preview */}
                  {productImage && (
                    <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Name:</span>
                      <p className="text-gray-900">{productName}</p>
                    </div>

                    {productDescription && (
                      <div>
                        <span className="font-semibold text-gray-700">Description:</span>
                        <p className="text-gray-600 text-xs line-clamp-2">{productDescription}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold text-gray-700">Price:</span>
                        <p className="text-gray-900">{productPrice}</p>
                      </div>
                      {productOriginalPrice && (
                        <div>
                          <span className="font-semibold text-gray-700">Original:</span>
                          <p className="text-gray-500 line-through">{productOriginalPrice}</p>
                        </div>
                      )}
                    </div>

                    {productSizes.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Sizes:</span>
                        <p className="text-gray-900">{productSizes.join(', ')}</p>
                      </div>
                    )}

                    {productColors.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Colors:</span>
                        <p className="text-gray-900">{productColors.join(', ')}</p>
                      </div>
                    )}

                  </div>

                  <div className="border-t border-border pt-2 mt-2">
                    <h4 className="text-xs font-semibold mb-1 text-gray-500 uppercase">Slide Color Settings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold text-gray-700 text-xs">Color Name:</span>
                        <p className="text-gray-900 text-sm">{displayColor || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-xs">Color Code:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: displayColorCode || 'transparent' }}></div>
                          <p className="text-gray-900 text-sm">{displayColorCode || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-2">
                      ✓ This product will replace the current slot when you click "Save" below.
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      💡 Product details are from the database. To edit product info, use the Products page.
                    </p>
                  </div>
                </div>
              )
            }

            {/* No Product Selected */}
            {
              !selectedProductId && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No product selected for this carousel slot. Please select a product from the dropdown above.
                  </p>
                </div>
              )
            }

            {/* Add New Product Slot Button */}
            <button
              type="button"
              onClick={handleAddNewProduct}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Product Slot to Carousel
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">
                📌 How to Update Carousel Slots:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                <li><strong>Update existing slot</strong>: Use Previous/Next buttons, select new product, click "Save"</li>
                <li><strong>Add new slot</strong>: Click "Add New Product Slot", select product, click "Save"</li>
                <li><strong>Navigate slots</strong>: Use Previous/Next buttons to move between carousel positions</li>
              </ul>
            </div>
          </div>
        );

      case 'prime-selections-add-hotspot':
        // Quick add hotspot with click position
        const clickPos = (element as any).clickPosition || { x: 50, y: 50 };
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Hotspot</h3>
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Position:</strong> X: {clickPos.x}%, Y: {clickPos.y}%
              </p>
              <p className="text-xs text-gray-600">
                Click position captured from image. Select a product below.
              </p>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                id="quick-hotspot-product"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                defaultValue=""
              >
                <option value="" disabled>Choose a product...</option>
                {availableProducts.map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const productSelect = document.getElementById('quick-hotspot-product') as HTMLSelectElement;

                if (!productSelect.value) {
                  showToast('Please select a product', 'warning');
                  return;
                }

                const newHotspot = {
                  productId: productSelect.value,
                  position: {
                    x: clickPos.x,
                    y: clickPos.y,
                  },
                };

                const currentHotspots = element.currentValue?.hotspots || [];
                handleChange('content.hotspots', [...currentHotspots, newHotspot]);
                onClose();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Hotspot at Position
            </button>
          </div>
        );

      case 'prime-selections-hotspots':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Manage Hotspots</h3>
              <button
                onClick={() => onClose()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {/* Current Hotspots */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Hotspots ({(element.currentValue?.hotspots || []).length}/5)
              </label>

              {(element.currentValue?.hotspots || []).map((hotspot: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hotspot #{index + 1}</p>
                      <p className="text-xs text-gray-500 truncate">Product ID: {hotspot.productId}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newHotspots = element.currentValue.hotspots.filter((_: any, i: number) => i !== index);
                        handleChange('content.hotspots', newHotspots);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-gray-600">X Position (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={hotspot.position.x}
                        onChange={(e) => {
                          const newHotspots = [...element.currentValue.hotspots];
                          newHotspots[index].position.x = Number(e.target.value);
                          handleChange('content.hotspots', newHotspots);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600">Y Position (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={hotspot.position.y}
                        onChange={(e) => {
                          const newHotspots = [...element.currentValue.hotspots];
                          newHotspots[index].position.y = Number(e.target.value);
                          handleChange('content.hotspots', newHotspots);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Hotspot */}
            {(element.currentValue?.hotspots || []).length < 5 && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm">Add New Hotspot</h4>

                {/* Product Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product
                  </label>
                  <select
                    id="new-hotspot-product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a product...</option>
                    {availableProducts.map((product: any) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position (%)
                    </label>
                    <input
                      type="number"
                      id="new-hotspot-x"
                      min="0"
                      max="100"
                      value={newHotspotX}
                      onChange={(e) => setNewHotspotX(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position (%)
                    </label>
                    <input
                      type="number"
                      id="new-hotspot-y"
                      min="0"
                      max="100"
                      value={newHotspotY}
                      onChange={(e) => setNewHotspotY(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const productSelect = document.getElementById('new-hotspot-product') as HTMLSelectElement;
                    const xInput = document.getElementById('new-hotspot-x') as HTMLInputElement;
                    const yInput = document.getElementById('new-hotspot-y') as HTMLInputElement;

                    if (!productSelect.value) {
                      showToast('Please select a product', 'warning');
                      return;
                    }

                    const newHotspot = {
                      productId: productSelect.value,
                      position: {
                        x: Number(xInput.value),
                        y: Number(yInput.value),
                      },
                    };

                    const currentHotspots = element.currentValue?.hotspots || [];
                    handleChange('content.hotspots', [...currentHotspots, newHotspot]);

                    // Reset form
                    productSelect.value = '';
                    setNewHotspotX('50');
                    setNewHotspotY('50');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Hotspot
                </button>
              </div>
            )}

            {(element.currentValue?.hotspots || []).length >= 5 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Maximum of 5 hotspots reached. Remove a hotspot to add a new one.
                </p>
              </div>
            )}
          </div>
        );

      case 'split-hero-products':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Managing Men's Products
              </p>
            </div>

            {/* Current Products */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Products ({Array.isArray(element.currentValue) ? element.currentValue.length : 0})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(element.currentValue) && element.currentValue.map((product: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <img
                      src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-secondary">₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = Array.isArray(element.currentValue) ? element.currentValue.filter((_: any, i: number) => i !== index) : [];
                        // Use live update for immediate feedback
                        if (onLiveUpdate && element.sectionId) {
                          onLiveUpdate(element.sectionId, element.elementPath, updated);
                        }
                        handleChange(element.elementPath, updated);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Product</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={fetchAvailableProducts}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Available Products */}
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded p-2">
                {availableProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        const current = Array.isArray(element.currentValue) ? element.currentValue : [];
                        if (!current.find((p: any) => p._id === product._id)) {
                          const updated = [...current, product];
                          // Use live update for immediate feedback
                          if (onLiveUpdate && element.sectionId) {
                            onLiveUpdate(element.sectionId, element.elementPath, updated);
                          }
                          // Also update via handleChange for persistence
                          handleChange(element.elementPath, updated);
                        }
                      }}
                    >
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/50'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-secondary">₹{product.price} • {product.category}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'new-arrivals-products':
        // Reuse the same logic as split-hero-products
        return (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Managing Men's Products for New Arrivals
              </p>
            </div>

            {/* Current Products */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Products ({Array.isArray(element.currentValue) ? element.currentValue.length : 0})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(element.currentValue) && element.currentValue.map((product: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <img
                      src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-secondary">₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = Array.isArray(element.currentValue) ? element.currentValue.filter((_: any, i: number) => i !== index) : [];
                        if (onLiveUpdate && element.sectionId) {
                          onLiveUpdate(element.sectionId, element.elementPath, updated);
                        }
                        handleChange(element.elementPath, updated);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Product</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={fetchAvailableProducts}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Available Products */}
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded p-2">
                {availableProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        const current = Array.isArray(element.currentValue) ? element.currentValue : [];
                        if (!current.find((p: any) => p._id === product._id)) {
                          const updated = [...current, product];
                          if (onLiveUpdate && element.sectionId) {
                            onLiveUpdate(element.sectionId, element.elementPath, updated);
                          }
                          handleChange(element.elementPath, updated);
                        }
                      }}
                    >
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/50'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-secondary">₹{product.price} • {product.category}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'jockey-arrivals-products':
        // Reuse the same logic as new-arrivals-products
        return (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">
                Managing Men's Products for Jockey New Arrivals
              </p>
            </div>

            {/* Current Products */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Products ({Array.isArray(element.currentValue) ? element.currentValue.length : 0})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(element.currentValue) && element.currentValue.map((product: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <img
                      src={product.images?.[0]?.url || product.image || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-secondary">₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = Array.isArray(element.currentValue) ? element.currentValue.filter((_: any, i: number) => i !== index) : [];
                        if (onLiveUpdate && element.sectionId) {
                          onLiveUpdate(element.sectionId, element.elementPath, updated);
                        }
                        handleChange(element.elementPath, updated);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Product</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={fetchAvailableProducts}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Available Products */}
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded p-2">
                {availableProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        const current = Array.isArray(element.currentValue) ? element.currentValue : [];
                        if (!current.find((p: any) => p._id === product._id)) {
                          const updated = [...current, product];
                          if (onLiveUpdate && element.sectionId) {
                            onLiveUpdate(element.sectionId, element.elementPath, updated);
                          }
                          handleChange(element.elementPath, updated);
                        }
                      }}
                    >
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/50'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-secondary">₹{product.price} • {product.category}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'headline-bar':
        // Use local state objects
        return (
          <div className="space-y-6">
             {/* Text Content */}
             <div>
               <label className="block text-sm font-medium mb-1">Scrolling Text</label>
               <textarea
                 value={localHeadlineContent.text || ''}
                 onChange={(e) => {
                   const newVal = { ...localHeadlineContent, text: e.target.value };
                   setLocalHeadlineContent(newVal);
                   if (onLiveUpdate && element.sectionId) {
                       onLiveUpdate(element.sectionId, 'content', newVal);
                   }
                 }}
                 rows={3}
                 className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                 placeholder="Enter text to scroll..."
               />
             </div>

             <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={localHeadlineContent.textColor || '#000000'}
                    onChange={(e) => {
                       const newVal = { ...localHeadlineContent, textColor: e.target.value };
                       setLocalHeadlineContent(newVal);
                       if (onLiveUpdate && element.sectionId) {
                           onLiveUpdate(element.sectionId, 'content', newVal);
                       }
                    }}
                    className="h-8 w-12 p-0 border rounded cursor-pointer"
                  />
                  <span className="text-xs text-secondary">{localHeadlineContent.textColor || '#000000'}</span>
                </div>
             </div>

             {/* Animation Settings */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Speed (sec)</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={localHeadlineContent.speed || 20}
                    onChange={(e) => {
                       const newVal = { ...localHeadlineContent, speed: Number(e.target.value) };
                       setLocalHeadlineContent(newVal);
                       if (onLiveUpdate && element.sectionId) {
                           onLiveUpdate(element.sectionId, 'content', newVal);
                       }
                    }}
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  />
                  <p className="text-xs text-secondary mt-1">Lower is faster</p>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Direction</label>
                  <select
                    value={localHeadlineContent.direction || 'left'}
                    onChange={(e) => {
                       const newVal = { ...localHeadlineContent, direction: e.target.value };
                       setLocalHeadlineContent(newVal);
                       if (onLiveUpdate && element.sectionId) {
                           onLiveUpdate(element.sectionId, 'content', newVal);
                       }
                    }}
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
               </div>
             </div>

             {/* Background Settings */}
             <div className="pt-4 border-t border-border">
               <h4 className="font-medium mb-3">Background</h4>
               
               <div className="space-y-4">
                 {/* Background Type */}
                 <div>
                    <label className="block text-xs font-medium mb-1 text-secondary">Type</label>
                    <div className="flex bg-muted p-1 rounded">
                      <button
                        onClick={() => {
                           const newBg = { ...localHeadlineBg, type: 'solid' };
                           setLocalHeadlineBg(newBg);
                           if (onLiveUpdate && element.sectionId) onLiveUpdate(element.sectionId, 'background', newBg);
                        }}
                        className={`flex-1 py-1 text-xs rounded ${localHeadlineBg.type !== 'image' ? 'bg-white shadow' : ''}`}
                      >
                        Solid Color
                      </button>
                      <button
                        onClick={() => {
                           const newBg = { ...localHeadlineBg, type: 'image' };
                           setLocalHeadlineBg(newBg);
                           if (onLiveUpdate && element.sectionId) onLiveUpdate(element.sectionId, 'background', newBg);
                        }}
                         className={`flex-1 py-1 text-xs rounded ${localHeadlineBg.type === 'image' ? 'bg-white shadow' : ''}`}
                      >
                        Image
                      </button>
                    </div>
                 </div>

                 {localHeadlineBg.type === 'image' ? (
                   <div>
                     <label className="block text-xs font-medium mb-1 text-secondary">Image URL</label>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         value={localHeadlineBg.imageUrl || ''}
                         onChange={(e) => {
                            const newBg = { ...localHeadlineBg, imageUrl: e.target.value };
                            setLocalHeadlineBg(newBg);
                            if (onLiveUpdate && element.sectionId) onLiveUpdate(element.sectionId, 'background', newBg);
                         }}
                         className="flex-1 px-2 py-1 text-sm border border-border rounded"
                         placeholder="https://..."
                       />
                       <label className="cursor-pointer bg-primary text-white p-2 rounded hover:bg-primary/90">
                         <Upload className="w-4 h-4" />
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageFileSelect} />
                       </label>
                     </div>
                     {localHeadlineBg.imageUrl && (
                        <div className="mt-2 h-20 w-full rounded bg-gray-100 overflow-hidden relative">
                           <img src={localHeadlineBg.imageUrl} alt="Background" className="w-full h-full object-cover" />
                        </div>
                     )}
                   </div>
                 ) : (
                   <div>
                     <label className="block text-xs font-medium mb-1 text-secondary">Color</label>
                     <div className="flex gap-2 items-center">
                       <input
                         type="color"
                         value={localHeadlineBg.color || '#ffffff'}
                         onChange={(e) => {
                            const newBg = { ...localHeadlineBg, color: e.target.value };
                            setLocalHeadlineBg(newBg);
                            if (onLiveUpdate && element.sectionId) onLiveUpdate(element.sectionId, 'background', newBg);
                         }}
                         className="h-8 w-12 p-0 border rounded cursor-pointer"
                       />
                       <span className="text-xs text-secondary">{localHeadlineBg.color || '#ffffff'}</span>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        );

      case 'blog-grid':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selected Blogs</label>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium">{Array.isArray(element.currentValue) ? element.currentValue.length : 0} blogs selected</p>
                  <p className="text-xs text-secondary mt-1">
                    These blogs will be displayed in the grid.
                  </p>
              </div>
            </div>
            
            <button
                onClick={() => setShowBlogManager(true)}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
                Choose Blogs
            </button>

            {showBlogManager && (
                <BlogManager
                    isModal={true}
                    mode="select"
                    sectionId={element.sectionId}
                    selectedIds={Array.isArray(element.currentValue) ? element.currentValue : []}
                    onSelectionChange={(newIds) => {
                         if (onLiveUpdate && element.sectionId) {
                             onLiveUpdate(element.sectionId, element.elementPath, newIds);
                         }
                    }}
                    onClose={() => setShowBlogManager(false)}
                />
            )}
          </div>
        );

      default:
        return <p className="text-secondary">Editor for {element.type} coming soon</p>;
    }
  };

  // Safety check - if element is null, don't render
  if (!element) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-border shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold capitalize">Edit {element.type}</h3>
          <p className="text-xs text-secondary">{element.elementPath}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
      {showCropper && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
        />
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


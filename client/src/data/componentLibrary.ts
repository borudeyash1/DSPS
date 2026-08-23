// Component Templates with detailed configurations
export const COMPONENT_LIBRARY = [
    // ===== HERO BANNERS (5 variants) =====
    {
        id: 'hero-carousel',
        category: 'Hero Banners',
        name: 'Full-Width Carousel Hero',
        description: 'Auto-playing carousel with large images',
        icon: '🎯',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Carousel+Hero',
        defaultConfig: {
            type: 'hero',
            layout: {
                width: 'full',
                height: 'viewport',
                customHeight: '600px',
                padding: '0',
                backgroundColor: '#f5f5f5',
            },
            content: {
                heading: 'TAKE IT OUTSIDE',
                headingStyle: {
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'left',
                },
                subheading: 'New Winter Fits For Him & Her',
                images: [
                    { url: 'https://via.placeholder.com/1920x600/667eea/ffffff?text=Slide+1', alt: 'Slide 1' },
                    { url: 'https://via.placeholder.com/1920x600/764ba2/ffffff?text=Slide+2', alt: 'Slide 2' },
                    { url: 'https://via.placeholder.com/1920x600/f093fb/ffffff?text=Slide+3', alt: 'Slide 3' },
                ],
                cta: { text: 'EXPLORE NOW', link: '/products', style: 'primary' },
            },
            carouselSettings: {
                autoPlay: true,
                interval: 5000,
                showArrows: true,
                showDots: true,
                infinite: true,
                transition: 'slide',
            },
        },
    },
    {
        id: 'hero-split',
        category: 'Hero Banners',
        name: 'Split Hero',
        description: 'Image on left, content on right',
        icon: '🎯',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Split+Hero',
        defaultConfig: {
            type: 'hero',
            layout: {
                width: 'container',
                height: 'auto',
                customHeight: '500px',
                padding: '4rem 0',
            },
            sectionLayout: {
                direction: 'horizontal',
                display: 'grid',
                gridColumns: 2,
                gap: '3rem',
                alignItems: 'center',
            },
            components: [
                {
                    id: 'img-1',
                    type: 'image-banner',
                    layout: { width: '50%', height: '100%', order: 1 },
                    content: {
                        images: [{ url: 'https://via.placeholder.com/600x500/667eea/ffffff?text=Hero+Image', alt: 'Hero' }],
                    },
                },
                {
                    id: 'text-1',
                    type: 'text-block',
                    layout: { width: '50%', height: 'auto', order: 2 },
                    content: {
                        heading: 'Premium Quality',
                        subheading: 'Discover Our Collection',
                        description: 'Experience the finest materials and craftsmanship.',
                        cta: { text: 'Shop Now', link: '/products' },
                    },
                },
            ],
        },
    },
    {
        id: 'hero-video',
        category: 'Hero Banners',
        name: 'Video Hero',
        description: 'Background video with overlay',
        icon: '🎥',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Video+Hero',
        defaultConfig: {
            type: 'video',
            layout: {
                width: 'full',
                height: 'viewport',
                customHeight: '700px',
            },
            content: {
                videos: [{ url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: '' }],
                heading: 'Experience Excellence',
                headingStyle: { fontSize: '5rem', color: '#ffffff', textAlign: 'center' },
                cta: { text: 'Watch Story', link: '#' },
            },
        },
    },
    {
        id: 'hero-parallax',
        category: 'Hero Banners',
        name: 'Parallax Hero',
        description: 'Scroll effect background',
        icon: '🌊',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Parallax+Hero',
        defaultConfig: {
            type: 'hero',
            layout: {
                width: 'full',
                height: 'viewport',
                customHeight: '600px',
            },
            behavior: {
                animateOnScroll: true,
                animation: 'slide',
            },
            content: {
                heading: 'Scroll to Discover',
                images: [{ url: 'https://via.placeholder.com/1920x600/4facfe/ffffff?text=Parallax+BG', alt: 'BG' }],
            },
        },
    },
    {
        id: 'hero-minimal',
        category: 'Hero Banners',
        name: 'Minimal Hero',
        description: 'Clean text-focused design',
        icon: '✨',
        preview: 'https://via.placeholder.com/400x200/ffffff/333333?text=Minimal+Hero',
        defaultConfig: {
            type: 'text-block',
            layout: {
                width: 'container',
                height: 'auto',
                customHeight: '400px',
                padding: '6rem 0',
                backgroundColor: '#ffffff',
            },
            content: {
                heading: 'Simple. Elegant. Timeless.',
                headingStyle: { fontSize: '3.5rem', color: '#000000', textAlign: 'center' },
                subheading: 'Discover minimalist fashion',
                cta: { text: 'Explore Collection', link: '/products' },
            },
        },
    },
    {
        id: 'split-hero-carousel',
        category: 'Hero Banners',
        name: 'Split Hero with Product Carousel',
        description: 'Animated split screen with category toggle',
        icon: '🎨',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Split+Hero+Carousel',
        defaultConfig: {
            type: 'split-hero-carousel',
            layout: {
                width: 'full',
                height: 'viewport',
                customHeight: '100vh',
            },
            content: {
                heading: 'COOL CODED\nCASUALS',
                headingStyle: {
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    fontWeight: 900,
                    color: '#FFD700',
                },
                backgroundImage: 'https://via.placeholder.com/1920x1080/333333/ffffff?text=Background',
                products: {
                    men: [],
                    women: [],
                },
            },
            carouselSettings: {
                autoPlay: false,
                showArrows: true,
                showDots: true,
                itemsPerView: 3,
                parallaxSpeed: 0.5,
            },
        },
    },
    {
        id: 'image-text-split',
        category: 'Hero Banners',
        name: 'Image & Text Split',
        description: 'Image on one side, editable text content on the other',
        icon: '🖼️',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Image+Text+Split',
        defaultConfig: {
            type: 'image-text-split',
            layout: {
                width: 'full',
                height: 'auto',
                padding: '4rem 0',
                imagePosition: 'right',
                contentAlignment: 'left',
            },
            content: {
                heading: 'Discover Our Story',
                headingStyle: {
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800',
                    color: '#000000',
                },
                subheading: 'Quality Meets Style',
                subheadingStyle: {
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    fontWeight: '600',
                    color: '#333333',
                },
                description: 'Experience premium quality and timeless design. Our collection brings together the finest materials and expert craftsmanship to create pieces that last.',
                descriptionStyle: {
                    fontSize: '1.125rem',
                    fontWeight: '400',
                    color: '#666666',
                },
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
                imagePosition: 'right',
                button: {
                    text: 'Learn More',
                    link: '/about',
                    style: {
                        bgColor: '#000000',
                        textColor: '#ffffff',
                        borderRadius: 8,
                    },
                },
            },
            background: {
                type: 'solid',
                color: '#ffffff',
            },
        },
    },
    {
        id: 'new-arrivals-showcase',
        category: 'Product Carousels',
        name: 'New Arrivals Showcase',
        description: 'Large product showcase with thumbnails',
        icon: '✨',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=New+Arrivals',
        defaultConfig: {
            type: 'new-arrivals-showcase',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'NEW ARRIVALS',
                headingStyle: {
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#000000',
                },
                products: {
                    men: [],
                    women: [],
                },
            },
        },
    },
    {
        id: 'colossal-carousel',
        category: 'Product Carousels',
        name: 'Colossal Carousel (On-Trend Picks)',
        description: 'Large centered carousel with overlay text',
        icon: '🎠',
        preview: 'https://via.placeholder.com/400x200/E6C66B/ffffff?text=Colossal+Carousel',
        defaultConfig: {
            type: 'colossal-carousel',
            layout: {
                width: 'full',
                padding: '4rem 0',
            },
            content: {
                heading: 'ON-TREND PICKS',
                subheading: 'Explore Our Promising Line-up',
                products: [],
            },
            carouselSettings: {
                autoPlay: true,
                interval: 5000,
                showArrows: true,
                showDots: true,
            },
            background: {
                type: 'solid',
                color: '#ffffff',
            },
        },
    },
    {
        id: 'colossal-static-grid',
        category: 'Category Cards',
        name: 'Colossal Static Grid (Accessories)',
        description: 'Large static cards grid',
        icon: '🍱',
        preview: 'https://via.placeholder.com/400x200/4A4A4A/ffffff?text=Static+Grid',
        defaultConfig: {
            type: 'colossal-static-grid',
            layout: {
                width: 'full',
                padding: '4rem 0',
            },
            content: {
                heading: 'ACCESSORIES',
                subheading: 'THAT GRAB YOU THE STYLE',
                products: [],
            },
            gridSettings: {
                gap: '40px',
                columns: 5,
            },
            background: {
                type: 'solid',
                color: '#ffffff',
            },
        },
    },
    {
        id: 'jockey-new-arrivals',
        category: 'Product Carousels',
        name: 'Jockey New Arrivals (Exact Replica)',
        description: '3-column layout with thumbnail grid, main image, and carousel',
        icon: '🎨',
        preview: 'https://via.placeholder.com/400x200/2d2d2d/ffffff?text=Jockey+New+Arrivals',
        defaultConfig: {
            type: 'jockey-new-arrivals',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'NEW ARRIVALS',
                products: {
                    men: [],
                    women: [],
                },
            },
            background: {
                type: 'solid',
                color: '#f5f5f5',
            },
        },
    },
    {
        id: 'essentials-category-grid',
        category: 'Product Carousels',
        name: 'Essentials Category Grid',
        description: 'Category grid with banners - Jockey style',
        icon: '🎯',
        preview: 'https://via.placeholder.com/400x200/E8D5F2/000?text=Essentials+Grid',
        defaultConfig: {
            type: 'essentials-category-grid',
            layout: {
                width: 'container',
                padding: '3rem 0',
            },
            content: {
                heading: 'ESSENTIALS MADE AMAZING',
                categories: [],
                banners: [],
            },
            background: {
                type: 'solid',
                color: '#ffffff',
            },
        },
    },
    {
        id: 'prime-selections',
        category: 'Product Carousels',
        name: 'Prime Selections (Interactive)',
        description: 'Clickable hotspots on image with product modal',
        icon: '🎪',
        preview: 'https://via.placeholder.com/400x200/8B7355/fff?text=Prime+Selections',
        defaultConfig: {
            type: 'prime-selections',
            layout: {
                width: 'container',
                padding: '3rem 0',
            },
            content: {
                heading: 'PRIME SELECTIONS',
                mainImage: '',
                products: [],
            },
            background: {
                type: 'solid',
                color: '#ffffff',
            },
        },
    },

    // ===== PRODUCT CAROUSELS (8 variants) =====
    {
        id: 'carousel-3-items',
        category: 'Product Carousels',
        name: 'Product Carousel (3 Items)',
        description: 'Horizontal scroll with 3 visible items',
        icon: '📱',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=3+Item+Carousel',
        defaultConfig: {
            type: 'product-carousel',
            layout: {
                width: 'container',
                height: 'auto',
                padding: '4rem 0',
            },
            content: {
                heading: 'ON-TREND PICKS',
                headingStyle: { fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center' },
                subheading: 'Explore Our Promising Line-up',
            },
            carouselSettings: {
                autoPlay: false,
                showArrows: true,
                showDots: true,
                infinite: false,
                transition: 'slide',
            },
            gridSettings: {
                itemsPerRow: { mobile: 1, tablet: 2, desktop: 3 },
                gap: '1.5rem',
            },
            productFilter: { featured: true, limit: 9 },
        },
    },
    {
        id: 'carousel-4-items',
        category: 'Product Carousels',
        name: 'Category Carousel (4 Items)',
        description: 'Wide carousel with 4 categories',
        icon: '🏷️',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=4+Item+Carousel',
        defaultConfig: {
            type: 'category-cards',
            carouselSettings: {
                autoPlay: true,
                interval: 4000,
                showArrows: true,
                showDots: false,
            },
            gridSettings: {
                itemsPerRow: { mobile: 1, tablet: 2, desktop: 4 },
                gap: '2rem',
            },
        },
    },
    {
        id: 'carousel-fade',
        category: 'Product Carousels',
        name: 'Fade Transition Carousel',
        description: 'Smooth fade between slides',
        icon: '🌅',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Fade+Carousel',
        defaultConfig: {
            type: 'product-carousel',
            carouselSettings: {
                autoPlay: true,
                interval: 3000,
                showArrows: false,
                showDots: true,
                transition: 'fade',
            },
            gridSettings: {
                itemsPerRow: { mobile: 1, tablet: 1, desktop: 1 },
            },
        },
    },
    {
        id: 'carousel-vertical',
        category: 'Product Carousels',
        name: 'Vertical Carousel',
        description: 'Scroll vertically',
        icon: '⬇️',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Vertical+Carousel',
        defaultConfig: {
            type: 'product-carousel',
            sectionLayout: { direction: 'vertical' },
            carouselSettings: {
                autoPlay: false,
                showArrows: true,
                showDots: false,
            },
        },
    },
    {
        id: 'carousel-center-mode',
        category: 'Product Carousels',
        name: 'Center Mode Carousel',
        description: 'Centered active slide',
        icon: '🎯',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Center+Mode',
        defaultConfig: {
            type: 'product-carousel',
            carouselSettings: {
                centerMode: true,
                showArrows: true,
                showDots: true,
            },
            gridSettings: {
                itemsPerRow: { mobile: 1, tablet: 3, desktop: 5 },
            },
        },
    },
    {
        id: 'carousel-testimonials',
        category: 'Product Carousels',
        name: 'Testimonial Carousel',
        description: 'Customer reviews slider',
        icon: '💬',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Testimonials',
        defaultConfig: {
            type: 'text-block',
            carouselSettings: {
                autoPlay: true,
                interval: 6000,
                showDots: true,
                showArrows: false,
            },
        },
    },
    {
        id: 'carousel-thumbnails',
        category: 'Product Carousels',
        name: 'Thumbnail Carousel',
        description: 'Main + thumbnail navigation',
        icon: '🖼️',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Thumbnails',
        defaultConfig: {
            type: 'image-banner',
            carouselSettings: {
                showThumbnails: true,
                showArrows: true,
            },
        },
    },
    {
        id: 'carousel-3d',
        category: 'Product Carousels',
        name: '3D Carousel',
        description: 'Rotating 3D effect',
        icon: '🎡',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=3D+Carousel',
        defaultConfig: {
            type: 'product-carousel',
            carouselSettings: {
                effect: '3d',
                autoPlay: true,
                showDots: false,
            },
        },
    },
    {
        id: 'slide-into-colors',
        category: 'Product Carousels',
        name: 'Slide Into Colors (Jockey)',
        description: 'Dark mode carousel with gender toggle and color slider',
        icon: '🎨',
        preview: 'https://via.placeholder.com/400x200/1f2125/ffffff?text=Slide+Into+Colors',
        defaultConfig: {
            type: 'slide-into-colors',
            layout: {
                width: 'full',
                padding: '0',
            },
            content: {
                heading: 'SLIDE INTO THE COLORS OF JOCKEY',
                products: {
                    men: [],
                    women: [],
                },
            },
            background: {
                type: 'solid',
                color: '#1f2125',
            },
        },
    },

    // ===== PRODUCT GRIDS (6 variants) =====
    {
        id: 'grid-4-col',
        category: 'Product Grids',
        name: 'Classic Grid (4 Columns)',
        description: 'Standard product grid layout',
        icon: '📦',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=4+Column+Grid',
        defaultConfig: {
            type: 'product-grid',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'BEST SELLERS',
                subheading: 'Most Loved Styles',
            },
            gridSettings: {
                columns: 4,
                gap: '1.5rem',
                itemsPerRow: { mobile: 2, tablet: 3, desktop: 4 },
            },
            productFilter: { bestSellers: true, limit: 8 },
        },
    },
    {
        id: 'grid-masonry',
        category: 'Product Grids',
        name: 'Masonry Grid',
        description: 'Pinterest-style layout',
        icon: '🧱',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Masonry+Grid',
        defaultConfig: {
            type: 'product-grid',
            gridSettings: {
                layout: 'masonry',
                columns: 3,
                gap: '1rem',
            },
        },
    },
    {
        id: 'grid-list',
        category: 'Product Grids',
        name: 'List View',
        description: 'Horizontal product cards',
        icon: '📋',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=List+View',
        defaultConfig: {
            type: 'product-grid',
            gridSettings: {
                layout: 'list',
                columns: 1,
            },
        },
    },
    {
        id: 'grid-filters',
        category: 'Product Grids',
        name: 'Grid with Filters',
        description: 'Sidebar filters + grid',
        icon: '🔍',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Grid+Filters',
        defaultConfig: {
            type: 'product-grid',
            sectionLayout: {
                direction: 'horizontal',
                display: 'grid',
                gridColumns: 4,
            },
            components: [
                { id: 'filters', type: 'custom', layout: { width: '25%' } },
                { id: 'grid', type: 'product-grid', layout: { width: '75%' } },
            ],
        },
    },
    {
        id: 'grid-featured',
        category: 'Product Grids',
        name: 'Featured + Grid',
        description: 'Large featured item + grid',
        icon: '⭐',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Featured+Grid',
        defaultConfig: {
            type: 'product-grid',
            gridSettings: {
                layout: 'featured',
                columns: 3,
            },
        },
    },
    {
        id: 'grid-infinite',
        category: 'Product Grids',
        name: 'Infinite Scroll Grid',
        description: 'Load more on scroll',
        icon: '♾️',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Infinite+Scroll',
        defaultConfig: {
            type: 'product-grid',
            behavior: {
                infiniteScroll: true,
            },
        },
    },

    // ===== CATEGORY CARDS (4 variants) =====
    {
        id: 'category-horizontal',
        category: 'Category Cards',
        name: 'Horizontal Cards',
        description: '3 cards side by side',
        icon: '➡️',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Horizontal+Cards',
        defaultConfig: {
            type: 'category-cards',
            gridSettings: {
                columns: 3,
                gap: '2rem',
                itemsPerRow: { mobile: 1, tablet: 2, desktop: 3 },
            },
        },
    },
    {
        id: 'category-vertical',
        category: 'Category Cards',
        name: 'Vertical Cards',
        description: 'Stacked cards',
        icon: '⬇️',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Vertical+Cards',
        defaultConfig: {
            type: 'category-cards',
            sectionLayout: { direction: 'vertical' },
            gridSettings: { columns: 1 },
        },
    },
    {
        id: 'category-icon',
        category: 'Category Cards',
        name: 'Icon Cards',
        description: 'Icon + text cards',
        icon: '🎨',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Icon+Cards',
        defaultConfig: {
            type: 'category-cards',
            styling: { cardStyle: 'icon' },
        },
    },
    {
        id: 'category-overlay',
        category: 'Category Cards',
        name: 'Image Overlay Cards',
        description: 'Text over images',
        icon: '🖼️',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Overlay+Cards',
        defaultConfig: {
            type: 'category-cards',
            styling: { cardStyle: 'overlay' },
        },
    },

    // ===== BANNERS (5 variants) =====
    {
        id: 'banner-full',
        category: 'Banners',
        name: 'Full-Width Banner',
        description: 'Promotional banner',
        icon: '📢',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Full+Banner',
        defaultConfig: {
            type: 'image-banner',
            layout: {
                width: 'full',
                height: 'fixed',
                customHeight: '400px',
            },
        },
    },
    {
        id: 'banner-split',
        category: 'Banners',
        name: 'Split Banner (50/50)',
        description: 'Two banners side by side',
        icon: '⚡',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Split+Banner',
        defaultConfig: {
            type: 'image-banner',
            sectionLayout: {
                direction: 'horizontal',
                display: 'grid',
                gridColumns: 2,
            },
        },
    },
    {
        id: 'headline-bar',
        category: 'Banners',
        name: 'Headline Bar',
        description: 'Scrolling text bar with background update',
        icon: '📢',
        preview: 'https://via.placeholder.com/400x50/ff0000/ffffff?text=Headline+Bar',
        defaultConfig: {
            type: 'headline-bar',
            layout: {
                width: 'full',
                height: 'fixed',
                customHeight: '60px',
            },
            content: {
                text: '🔥 FLATO 50% OFF | FREE SHIPPING OVER ₹999 | NEW ARRIVALS DAILY 🔥',
                speed: 20,
                direction: 'left',
            },
            background: {
                type: 'solid',
                color: '#ffffff',
                imageUrl: '',
                opacity: 1
            }
        }
    },
    {
        id: 'banner-countdown',
        category: 'Banners',
        name: 'Countdown Banner',
        description: 'Sale countdown timer',
        icon: '⏰',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Countdown',
        defaultConfig: {
            type: 'custom',
            content: { countdown: { endDate: '2024-12-31' } },
        },
    },
    {
        id: 'banner-announcement',
        category: 'Banners',
        name: 'Announcement Bar',
        description: 'Top notification bar',
        icon: '📣',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Announcement',
        defaultConfig: {
            type: 'text-block',
            layout: {
                width: 'full',
                height: 'auto',
                customHeight: '50px',
            },
        },
    },
    {
        id: 'banner-sticky',
        category: 'Banners',
        name: 'Sticky Banner',
        description: 'Stays on scroll',
        icon: '📌',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Sticky+Banner',
        defaultConfig: {
            type: 'image-banner',
            behavior: { sticky: true },
        },
    },

    // ===== CONTENT BLOCKS (4 variants) =====
    {
        id: 'content-text',
        category: 'Content Blocks',
        name: 'Text Block',
        description: 'Rich text content',
        icon: '📝',
        preview: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Text+Block',
        defaultConfig: {
            type: 'text-block',
            layout: {
                width: 'container',
                padding: '6rem 0',
                backgroundColor: '#ffffff',
            },
            content: {
                heading: 'Welcome to Our Store',
                headingStyle: {
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    color: '#000000',
                    textAlign: 'center',
                },
                subheading: 'Discover Amazing Products',
                subheadingStyle: {
                    fontSize: '1.25rem',
                    color: '#666666',
                },
                description: 'Browse our curated collection of premium quality products designed for your lifestyle.',
                cta: {
                    text: 'Shop Now',
                    link: '/products',
                },
            },
        },
    },
    {
        id: 'content-image-text',
        category: 'Content Blocks',
        name: 'Image + Text',
        description: 'Image with text',
        icon: '🖼️',
        preview: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=Image+Text',
        defaultConfig: {
            type: 'text-block',
            sectionLayout: {
                direction: 'horizontal',
                display: 'grid',
                gridColumns: 2,
            },
        },
    },
    {
        id: 'content-video',
        category: 'Content Blocks',
        name: 'Video Embed',
        description: 'YouTube/Vimeo embed',
        icon: '🎥',
        preview: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Video+Embed',
        defaultConfig: {
            type: 'video',
        },
    },
    {
        id: 'content-features',
        category: 'Content Blocks',
        name: 'Icon Features Grid',
        description: 'Feature highlights',
        icon: '✨',
        preview: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Features',
        defaultConfig: {
            type: 'custom',
            gridSettings: { columns: 3 },
        },
    },
    // ===== ADVERTISEMENTS (1 variant) =====
    {
        id: 'ad-single',
        category: 'Advertisements',
        name: 'Single Ad Banner',
        description: 'Promotional advertisement banner',
        icon: '📢',
        preview: 'https://via.placeholder.com/400x200/ff0000/ffffff?text=Ad',
        defaultConfig: {
            type: 'image-banner',
            layout: { customHeight: '300px' },
            content: {
                heading: 'SPECIAL OFFER',
                subheading: 'Get 50% Off Today',
                images: [{ url: 'https://via.placeholder.com/1200x400', alt: 'Ad' }],
                cta: {
                    text: 'SHOP NOW',
                    link: '/products',
                    bgColor: '#000000',
                    textColor: '#ffffff',
                    borderRadius: 4,
                    padding: { top: 12, right: 32, bottom: 12, left: 32 }
                }
            },
        },
    },
    // ===== BLOGS (1 variant) =====
    {
        id: 'blog-grid',
        category: 'Blogs',
        name: 'Blog Grid',
        description: 'Display latest blog posts',
        icon: '📰',
        preview: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Blog+Grid',
        defaultConfig: {
            type: 'blog-grid',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'LATEST STORIES',
                subheading: 'Read our latest articles',
                count: 3,
                blogIds: [], // Start empty for manual selection logic
            },
            gridSettings: {
                columns: 3,
                gap: '2rem',
                layout: 'grid',
            },
        },
    },
    {
        id: 'blog-uneven-2',
        category: 'Blogs',
        name: 'Uneven Grid (2 Items)',
        description: 'One featured post + one side post',
        icon: '📰',
        preview: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Uneven+2',
        defaultConfig: {
            type: 'blog-grid',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'FEATURED STORIES',
                subheading: 'Curated for you',
                count: 2,
                blogIds: [], // Start empty for manual selection logic
            },
            gridSettings: {
                layout: 'uneven-2',
            },
        },
    },
    {
        id: 'blog-uneven-3',
        category: 'Blogs',
        name: 'Uneven Grid (3 Items)',
        description: 'Dynamic layout with 3 items',
        icon: '📰',
        preview: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Uneven+3',
        defaultConfig: {
            type: 'blog-grid',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'TRENDING NOW',
                subheading: 'What everyone is reading',
                count: 3,
                blogIds: [], // Start empty for manual selection logic
            },
            gridSettings: {
                layout: 'uneven-3',
            },
        },
    },
    {
        id: 'blog-single-row',
        category: 'Blogs',
        name: 'Single Row Feature',
        description: 'Full width single post',
        icon: '📰',
        preview: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Single+Row',
        defaultConfig: {
            type: 'blog-grid',
            layout: {
                width: 'container',
                padding: '4rem 0',
            },
            content: {
                heading: 'SPOTLIGHT',
                subheading: 'Editor',
                count: 1,
                blogIds: [], // Start empty for manual selection logic
            },
            gridSettings: {
                layout: 'single-row',
            },
        },
    },
];

// Group by category
export const COMPONENT_CATEGORIES = [
    'Hero Banners',
    'Product Carousels',
    'Product Grids',
    'Category Cards',
    'Banners',
    'Content Blocks',
    'Advertisements',
    'Blogs',
];

export const getComponentsByCategory = (category: string) => {
    return COMPONENT_LIBRARY.filter((c) => c.category === category);
};

export const getComponentById = (id: string) => {
    return COMPONENT_LIBRARY.find((c) => c.id === id);
};

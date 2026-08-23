import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { ChevronRight } from 'lucide-react';
import { JockeyProductCard } from '../components/ui/JockeyProductCard';
import SortDropdown from '../components/ui/SortDropdown';
import FilterButton from '../components/ui/FilterButton';


const ProductListingPage = () => {
  const { category, subcategory, itemType } = useParams<{
    category?: string;
    subcategory?: string;
    itemType?: string;
  }>();
  const [searchParams] = useSearchParams();
  const { products, isLoading, setFilters, fetchProducts, pagination } = useProductStore();

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<{
    sizes: string[];
    colors: string[];
    priceRange: string | null;
    sort: string;
  }>({
    sizes: [],
    colors: [],
    priceRange: null,
    sort: '-createdAt'
  });

  // Extract unique sizes and colors from products
  const availableFilters = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();

    products.forEach(product => {
      product.sizes?.forEach(size => sizes.add(size));
      product.colors?.forEach(color => colors.add(color));
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
    };
  }, [products]);

  // Format display name
  const formatName = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Build filter object from URL params
    const filterParams: any = {};
    if (category) filterParams.category = category;
    if (subcategory) filterParams.subcategory = subcategory;
    if (itemType) filterParams.type = itemType;

    // Check URL search params for additional filters
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const typeParam = searchParams.get('type');

    if (categoryParam) filterParams.category = categoryParam;
    if (subcategoryParam) filterParams.subcategory = subcategoryParam;
    if (typeParam) filterParams.type = typeParam;

    // Add search param if exists
    const searchQuery = searchParams.get('search');
    if (searchQuery) filterParams.search = searchQuery;

    setFilters(filterParams);
    fetchProducts(filterParams);
  }, [category, subcategory, itemType, searchParams]);

  const handleSortChange = (sort: string) => {
    setFilters({ sort });
  };

  const handleFilterClick = (type: 'size' | 'color' | 'price', value: string) => {
    const newFilters = { ...activeFilters };

    if (type === 'size') {
      if (newFilters.sizes.includes(value)) {
        newFilters.sizes = newFilters.sizes.filter(s => s !== value);
      } else {
        newFilters.sizes = [...newFilters.sizes, value];
      }
    } else if (type === 'color') {
      if (newFilters.colors.includes(value)) {
        newFilters.colors = newFilters.colors.filter(c => c !== value);
      } else {
        newFilters.colors = [...newFilters.colors, value];
      }
    } else if (type === 'price') {
      newFilters.priceRange = newFilters.priceRange === value ? null : value;
    }

    setActiveFilters(newFilters);

    // Apply filters to store
    const filterParams: any = {};
    if (category) filterParams.category = category;
    if (subcategory) filterParams.subcategory = subcategory;
    if (itemType) filterParams.type = itemType;

    // Preserve search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) filterParams.search = searchQuery;

    if (newFilters.sizes.length > 0) {
      filterParams.sizes = newFilters.sizes.join(',');
    }
    if (newFilters.colors.length > 0) {
      filterParams.colors = newFilters.colors.join(',');
    }
    if (newFilters.priceRange) {
      const [min, max] = newFilters.priceRange.split('-');
      if (min) filterParams.minPrice = min;
      if (max) filterParams.maxPrice = max;
    }

    setFilters(filterParams);
    fetchProducts(filterParams);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({ sizes: [], colors: [], priceRange: null, sort: '-createdAt' });

    const filterParams: any = {};
    if (category) filterParams.category = category;
    if (subcategory) filterParams.subcategory = subcategory;
    if (itemType) filterParams.type = itemType;

    // Preserve search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) filterParams.search = searchQuery;

    setFilters(filterParams);
    fetchProducts(filterParams);
  };

  const activeFilterCount = activeFilters.sizes.length + activeFilters.colors.length + (activeFilters.priceRange ? 1 : 0);

  // Build page title
  const getPageTitle = () => {
    if (itemType) return formatName(itemType);
    if (subcategory) return formatName(subcategory);
    if (category) return formatName(category);
    return 'All Products';
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 py-8 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm mb-8 text-gray-500">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-black transition-colors">Products</Link>

        {category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/products/${category}`} className="hover:text-black transition-colors font-medium text-black">
              {formatName(category)}
            </Link>
          </>
        )}

        {subcategory && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/products/${category}/${subcategory}`} className="hover:text-black transition-colors">
              {formatName(subcategory)}
            </Link>
          </>
        )}

        {itemType && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="font-bold text-black">{formatName(itemType)}</span>
          </>
        )}
      </nav>

      {/* Modern Header Section */}
      <div className="flex flex-col mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Showing {products.length} of {pagination.total} items
              {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)`}
            </p>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto">
            <FilterButton
              availableFilters={availableFilters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterClick}
              onClearAll={handleClearAllFilters}
              activeFilterCount={activeFilterCount}
            />

            <div className="h-4 w-px bg-gray-300 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden md:block">Sort By:</span>
              <SortDropdown
                onSortChange={handleSortChange}
                currentSort={activeFilters.sort as string || '-createdAt'}
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Pills - Hidden as per request */}
        {/* <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2">Quick Filters</span>

          {availableFilters.sizes.slice(0, 4).map((size) => (
            <button
              key={`size-${size}`}
              onClick={() => handleFilterClick('size', size)}
              className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeFilters.sizes.includes(size)
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white hover:border-black hover:bg-black hover:text-white'
                }`}
            >
              Size: {size}
            </button>
          ))}

          {availableFilters.colors.slice(0, 3).map((color) => (
            <button
              key={`color-${color}`}
              onClick={() => handleFilterClick('color', color)}
              className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeFilters.colors.includes(color)
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white hover:border-black hover:bg-black hover:text-white'
                }`}
            >
              {color}
            </button>
          ))}

          <button
            onClick={() => handleFilterClick('price', '0-999')}
            className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeFilters.priceRange === '0-999'
              ? 'border-black bg-black text-white'
              : 'border-gray-200 bg-white hover:border-black hover:bg-black hover:text-white'
              }`}
          >
            Price: &lt; ₹999
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="px-5 py-2 rounded-full border border-red-300 bg-red-50 text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div> */}
      </div>

      {/* Product Grid - Full Width */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Loading Products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Top Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mb-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      fetchProducts({ page });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${page === pagination.page
                      ? 'bg-black text-white shadow-lg scale-110'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => (
                <JockeyProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Bottom Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-16">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      fetchProducts({ page });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${page === pagination.page
                      ? 'bg-black text-white shadow-lg scale-110'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 rounded-xl">
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-gray-500 mb-6 max-w-md">We couldn't find any products matching your selection. Try clearing filters or browsing other categories.</p>

          </div>
        )}
      </div>

      {/* Toast Notifications */}

    </div>
  );
};

export default ProductListingPage;

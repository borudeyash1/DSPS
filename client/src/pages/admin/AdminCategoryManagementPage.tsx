import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, ChevronRight, X, AlertTriangle } from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useCategoryStore } from '../../store/categoryStore';

interface Category {
    _id: string;
    name: string;
    slug: string;
    subcategories: Subcategory[];
}

interface Subcategory {
    _id: string;
    name: string;
    slug: string;
    types: string[];
}

const AdminCategoryManagementPage = () => {
    const { fetchHierarchy } = useCategoryStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [categoryName, setCategoryName] = useState('');
    const [subcategoryName, setSubcategoryName] = useState('');
    const [itemTypeName, setItemTypeName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'category' | 'subcategory' | 'itemType';
        id?: string;
        name: string;
        impact?: { subcategories?: number; types?: number; products?: number };
    } | null>(null);

    useEffect(() => {
        fetchCategories();
        fetchHierarchy();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching categories from /categories...');
            const response = await adminApi.get('/categories');
            console.log('✅ Categories response:', response.data);
            console.log('📊 Categories data:', response.data.data);
            console.log('📁 First category:', response.data.data[0]);
            console.log('📂 First category subcategories:', response.data.data[0]?.subcategories);
            setCategories(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('❌ Failed to fetch categories:', err);
            setError('Failed to fetch categories');
            setLoading(false);
        }
    };

    // Add Category
    const handleAddCategory = async () => {
        try {
            await adminApi.post('/categories/custom', { category: categoryName });
            setSuccess('Category added successfully');
            setCategoryName('');
            setShowCategoryModal(false);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add category');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Update Category
    const handleUpdateCategory = async () => {
        if (!editingCategory) return;
        try {
            await adminApi.patch(`/categories/${editingCategory._id}`, { newName: categoryName });
            setSuccess('Category updated successfully');
            setCategoryName('');
            setEditingCategory(null);
            setShowCategoryModal(false);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update category');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Add Subcategory
    const handleAddSubcategory = async () => {
        if (!selectedCategory) return;
        try {
            await adminApi.post('/categories/custom', {
                category: selectedCategory.name,
                subcategory: subcategoryName
            });
            setSuccess('Subcategory added successfully');
            setSubcategoryName('');
            setShowSubcategoryModal(false);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add subcategory');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Update Subcategory
    const handleUpdateSubcategory = async () => {
        if (!selectedCategory || !editingSubcategory) return;
        try {
            await adminApi.patch(
                `/categories/${selectedCategory._id}/subcategories/${editingSubcategory._id}`,
                { newName: subcategoryName }
            );
            setSuccess('Subcategory updated successfully');
            setSubcategoryName('');
            setEditingSubcategory(null);
            setShowSubcategoryModal(false);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update subcategory');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Add Item Type
    const handleAddItemType = async () => {
        if (!selectedCategory || !selectedSubcategory) return;
        try {
            await adminApi.post('/categories/custom', {
                category: selectedCategory.name,
                subcategory: selectedSubcategory.name,
                type: itemTypeName
            });
            setSuccess('Item type added successfully');
            setItemTypeName('');
            setShowItemTypeModal(false);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add item type');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Delete handlers
    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            if (deleteTarget.type === 'category' && deleteTarget.id) {
                await adminApi.delete(`/categories/${deleteTarget.id}`);
                setSelectedCategory(null);
                setSelectedSubcategory(null);
            } else if (deleteTarget.type === 'subcategory' && selectedCategory && deleteTarget.id) {
                await adminApi.delete(`/categories/${selectedCategory._id}/subcategories/${deleteTarget.id}`);
                setSelectedSubcategory(null);
            } else if (deleteTarget.type === 'itemType' && selectedCategory && selectedSubcategory) {
                await adminApi.delete(
                    `/categories/${selectedCategory._id}/subcategories/${selectedSubcategory._id}/types/${deleteTarget.name}`
                );
            }

            setSuccess(`${deleteTarget.type} deleted successfully`);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchCategories();
            fetchHierarchy();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete');
            setTimeout(() => setError(''), 3000);
        }
    };

    const openDeleteModal = (type: 'category' | 'subcategory' | 'itemType', item: any) => {
        let impact = {};

        if (type === 'category') {
            impact = {
                subcategories: item.subcategories?.length || 0,
                types: item.subcategories?.reduce((sum: number, sub: Subcategory) => sum + sub.types.length, 0) || 0
            };
        } else if (type === 'subcategory') {
            impact = {
                types: item.types?.length || 0
            };
        }

        setDeleteTarget({
            type,
            id: item._id,
            name: item.name || item,
            impact
        });
        setShowDeleteModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FolderTree className="w-8 h-8 text-black" />
                        <h1 className="text-3xl font-bold">Category Management</h1>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
                {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

                {/* Breadcrumb */}
                {(selectedCategory || selectedSubcategory) && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                        <button onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }} className="hover:text-black">
                            All Categories
                        </button>
                        {selectedCategory && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <button onClick={() => setSelectedSubcategory(null)} className="hover:text-black">
                                    {selectedCategory.name}
                                </button>
                            </>
                        )}
                        {selectedSubcategory && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-medium text-black">{selectedSubcategory.name}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Categories Column */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Categories</h2>
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setCategoryName('');
                                    setShowCategoryModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {loading ? (
                                <p className="text-gray-500 text-sm">Loading...</p>
                            ) : categories.length === 0 ? (
                                <p className="text-gray-500 text-sm">No categories yet</p>
                            ) : (
                                categories.map((cat) => (
                                    <div
                                        key={cat._id}
                                        className={`p-3 rounded border cursor-pointer transition-all ${selectedCategory?._id === cat._id
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setSelectedSubcategory(null);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{cat.name}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingCategory(cat);
                                                        setCategoryName(cat.name);
                                                        setShowCategoryModal(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal('category', cat);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{cat.subcategories?.length || 0} subcategories</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Subcategories Column */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Subcategories</h2>
                            <button
                                onClick={() => {
                                    setEditingSubcategory(null);
                                    setSubcategoryName('');
                                    setShowSubcategoryModal(true);
                                }}
                                disabled={!selectedCategory}
                                className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {!selectedCategory ? (
                                <p className="text-gray-500 text-sm">Select a category first</p>
                            ) : (selectedCategory.subcategories?.length || 0) === 0 ? (
                                <p className="text-gray-500 text-sm">No subcategories yet</p>
                            ) : (
                                selectedCategory.subcategories.map((sub) => (
                                    <div
                                        key={sub._id}
                                        className={`p-3 rounded border cursor-pointer transition-all ${selectedSubcategory?._id === sub._id
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        onClick={() => setSelectedSubcategory(sub)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{sub.name}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingSubcategory(sub);
                                                        setSubcategoryName(sub.name);
                                                        setShowSubcategoryModal(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal('subcategory', sub);
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{sub.types?.length || 0} item types</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Item Types Column */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Item Types</h2>
                            <button
                                onClick={() => {
                                    setItemTypeName('');
                                    setShowItemTypeModal(true);
                                }}
                                disabled={!selectedSubcategory}
                                className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {!selectedSubcategory ? (
                                <p className="text-gray-500 text-sm">Select a subcategory first</p>
                            ) : (selectedSubcategory.types?.length || 0) === 0 ? (
                                <p className="text-gray-500 text-sm">No item types yet</p>
                            ) : (
                                selectedSubcategory.types.map((type) => (
                                    <div
                                        key={type}
                                        className="p-3 rounded border border-gray-200 hover:border-gray-400 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{type}</span>
                                            <button
                                                onClick={() => openDeleteModal('itemType', type)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Modal */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                                <button onClick={() => setShowCategoryModal(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Category name"
                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                                    disabled={!categoryName.trim()}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {editingCategory ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subcategory Modal */}
                {showSubcategoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
                                <button onClick={() => setShowSubcategoryModal(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Category: <strong>{selectedCategory?.name}</strong></p>
                            <input
                                type="text"
                                value={subcategoryName}
                                onChange={(e) => setSubcategoryName(e.target.value)}
                                placeholder="Subcategory name"
                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowSubcategoryModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory}
                                    disabled={!subcategoryName.trim()}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {editingSubcategory ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Item Type Modal */}
                {showItemTypeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Add Item Type</h3>
                                <button onClick={() => setShowItemTypeModal(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Category: <strong>{selectedCategory?.name}</strong></p>
                            <p className="text-sm text-gray-600 mb-2">Subcategory: <strong>{selectedSubcategory?.name}</strong></p>
                            <input
                                type="text"
                                value={itemTypeName}
                                onChange={(e) => setItemTypeName(e.target.value)}
                                placeholder="Item type name"
                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowItemTypeModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddItemType}
                                    disabled={!itemTypeName.trim()}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deleteTarget && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                                <h3 className="text-xl font-bold">Confirm Deletion</h3>
                            </div>
                            <p className="mb-4">
                                Are you sure you want to delete the {deleteTarget.type} <strong>"{deleteTarget.name}"</strong>?
                            </p>
                            {deleteTarget.impact && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <p className="font-semibold text-yellow-800 mb-2">Impact Warning:</p>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        {deleteTarget.impact.subcategories !== undefined && (
                                            <li>• {deleteTarget.impact.subcategories} subcategories will be deleted</li>
                                        )}
                                        {deleteTarget.impact.types !== undefined && (
                                            <li>• {deleteTarget.impact.types} item types will be deleted</li>
                                        )}
                                        <li className="font-semibold mt-2">• All related products will become <span className="text-red-600">INACTIVE</span></li>
                                    </ul>
                                </div>
                            )}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteTarget(null);
                                    }}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCategoryManagementPage;

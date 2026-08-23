import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideColumn {
    header: string;
    key: string;
}

interface SizeGuideData {
    [key: string]: string;
}

interface SizeGuide {
    _id: string;
    name: string;
    category: string;
    productType: string[];
    description?: string;
    units: string[];
    columns: SizeGuideColumn[];
    data: SizeGuideData[];
}

interface SizeChartModalProps {
    sizeGuide: SizeGuide;
    onClose: () => void;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ sizeGuide, onClose }) => {
    // Determine if chart has multiple units (in/cm)
    const hasMultipleUnits = sizeGuide.units.length > 1;
    const [selectedUnit, setSelectedUnit] = useState<string>(sizeGuide.units[0] || 'in');

    // Filter columns based on selected unit if multiple units exist
    const getVisibleColumns = () => {
        if (!hasMultipleUnits) {
            return sizeGuide.columns;
        }

        // Show columns that either don't have unit suffix or match selected unit
        return sizeGuide.columns.filter(col => {
            const hasUnitSuffix = sizeGuide.units.some(unit => col.key.endsWith(`_${unit}`));
            if (!hasUnitSuffix) return true; // Always show non-unit columns (like "size", "age")
            return col.key.endsWith(`_${selectedUnit}`);
        });
    };

    const visibleColumns = getVisibleColumns();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Ruler className="w-6 h-6" />
                        <div>
                            <h2 className="text-2xl font-bold">{sizeGuide.name}</h2>
                            {sizeGuide.description && (
                                <p className="text-sm text-blue-100 mt-1">{sizeGuide.description}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Unit Toggle (if multiple units) */}
                {hasMultipleUnits && (
                    <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Measurement Unit:</span>
                        <div className="flex gap-2">
                            {sizeGuide.units.map(unit => (
                                <button
                                    key={unit}
                                    onClick={() => setSelectedUnit(unit)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUnit === unit
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    {unit.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Chart Table */}
                <div className="p-6 overflow-auto max-h-[60vh]">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    {visibleColumns.map((column, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300"
                                        >
                                            {column.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sizeGuide.data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            } hover:bg-blue-50 transition-colors`}
                                    >
                                        {visibleColumns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-4 py-3 text-sm border-b border-gray-200 ${colIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'
                                                    }`}
                                            >
                                                {row[column.key] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="font-semibold">💡 Tip:</span>
                        <p>
                            Measurements are approximate. For the best fit, compare with a similar garment you already own.
                            {hasMultipleUnits && ' Use the unit toggle above to switch between inches and centimeters.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeChartModal;

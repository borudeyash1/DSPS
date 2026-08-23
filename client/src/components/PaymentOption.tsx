import { LucideIcon } from 'lucide-react';

interface PaymentOptionProps {
    id: string;
    name: string;
    icon: LucideIcon;
    description?: string;
    selected: boolean;
    disabled?: boolean;
    disabledReason?: string;
    onSelect: (id: string) => void;
    brands?: string[]; // e.g., for Card icons
}

const PaymentOption = ({
    id,
    name,
    icon: Icon,
    description,
    selected,
    disabled = false,
    disabledReason,
    onSelect,
    brands
}: PaymentOptionProps) => {
    return (
        <div
            onClick={() => !disabled && onSelect(id)}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${disabled
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    : selected
                        ? 'bg-white border-black ring-1 ring-black shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Radio Indicator */}
                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-black' : 'border-gray-300'
                    }`}>
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-gray-700" />
                        <span className="font-medium text-gray-900">{name}</span>
                    </div>

                    {description && (
                        <p className="text-sm text-gray-500 mb-2">{description}</p>
                    )}

                    {brands && brands.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {brands.map((brand, index) => (
                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                                    {brand}
                                </span>
                            ))}
                        </div>
                    )}

                    {disabled && disabledReason && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                            {disabledReason}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentOption;

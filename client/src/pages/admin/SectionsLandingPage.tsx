import { Link } from 'react-router-dom';
import { Home, BookOpen, Users, Baby, Sofa } from 'lucide-react';

const SectionsLandingPage = () => {
    const pageBuilders = [
        {
            name: 'Homepage',
            description: 'Build and customize your homepage sections',
            icon: Home,
            path: '/my-admin/sections/homepage',
            color: 'from-blue-500 to-blue-600',
        },
        {
            name: 'Blog Page',
            description: 'Create sections for your blog page',
            icon: BookOpen,
            path: '/my-admin/sections/blog',
            color: 'from-purple-500 to-purple-600',
        },
        {
            name: "Men's Page",
            description: "Build custom sections for men's landing page",
            icon: Users,
            path: '/my-admin/sections/men',
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            name: "Women's Page",
            description: "Build custom sections for women's landing page",
            icon: Users,
            path: '/my-admin/sections/women',
            color: 'from-pink-500 to-pink-600',
        },
        {
            name: "Kids' Page",
            description: "Build custom sections for kids' landing page",
            icon: Baby,
            path: '/my-admin/sections/kids',
            color: 'from-green-500 to-green-600',
        },
        {
            name: 'Living Page',
            description: 'Build custom sections for living landing page',
            icon: Sofa,
            path: '/my-admin/sections/living',
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Page Builders</h1>
                <p className="text-gray-600">
                    Choose a page to build and customize its sections
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageBuilders.map((builder) => {
                    const Icon = builder.icon;
                    return (
                        <Link
                            key={builder.path}
                            to={builder.path}
                            className="group block"
                        >
                            <div className="border rounded-lg p-6 hover:shadow-xl transition-all duration-300 h-full">
                                {/* Icon with gradient background */}
                                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${builder.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                    {builder.name}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm">
                                    {builder.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Builder
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Each page builder uses the same powerful section editor</li>
                    <li>• Add, edit, and reorder sections with drag-and-drop</li>
                    <li>• Preview your changes in real-time</li>
                    <li>• Sections are saved separately for each page</li>
                </ul>
            </div>
        </div>
    );
};

export default SectionsLandingPage;

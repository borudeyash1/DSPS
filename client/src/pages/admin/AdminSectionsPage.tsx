import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Users } from 'lucide-react';

const AdminSectionsPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for premium feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 h-64 bg-gray-50 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-gray-200 mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

export default AdminSectionsPage;

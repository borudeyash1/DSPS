import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { HeroCarouselRenderer } from '../components/renderers/HeroCarouselRenderer';
import { ProductCarouselRenderer } from '../components/renderers/ProductCarouselRenderer';
import { ProductGridRenderer } from '../components/renderers/ProductGridRenderer';
import { CategoryCardsRenderer } from '../components/renderers/CategoryCardsRenderer';
import { BannerRenderer } from '../components/renderers/BannerRenderer';
import { VideoRenderer } from '../components/renderers/VideoRenderer';
import { TextBlockRenderer } from '../components/renderers/TextBlockRenderer';
import { EssentialsCategoryGridRenderer } from '../components/renderers/EssentialsCategoryGridRenderer';
import { PrimeSelectionsRenderer } from '../components/renderers/PrimeSelectionsRenderer';
import { SplitHeroCarouselRenderer } from '../components/renderers/SplitHeroCarouselRenderer';
import { NewArrivalsShowcaseRenderer } from '../components/renderers/NewArrivalsShowcaseRenderer';
import { JockeyNewArrivalsRenderer } from '../components/renderers/JockeyNewArrivalsRenderer';
import { ColossalCarouselRenderer } from '../components/renderers/ColossalCarouselRenderer';
import { ColossalStaticGridRenderer } from '../components/renderers/ColossalStaticGridRenderer';
import { SlideIntoColorsRenderer } from '../components/renderers/SlideIntoColorsRenderer';
import { ImageTextSplitRenderer } from '../components/renderers/ImageTextSplitRenderer';
import { HeadlineBarRenderer } from '../components/renderers/HeadlineBarRenderer';
import { BlogGridRenderer } from '../components/renderers/BlogGridRenderer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Section {
  _id: string;
  name: string;
  type: string;
  order: number;
  isActive: boolean;
  layout: any;
  content: any;
  background?: any;
  carouselSettings?: any;
  gridSettings?: any;
}

const HomePage = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const { toasts, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sections?page=homepage`);
      if (response.data.success) {
        setSections(response.data.data.sections);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      showToast('Failed to load homepage sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroCarouselRenderer
            content={section.content}
            background={section.background}
            carouselSettings={section.carouselSettings}
          />
        );
      case 'product-carousel':
        return (
          <ProductCarouselRenderer
            content={section.content}
            background={section.background}
            carouselSettings={section.carouselSettings}
            gridSettings={section.gridSettings}
          />
        );
      case 'product-grid':
        return (
          <ProductGridRenderer
            content={section.content}
            background={section.background}
            gridSettings={section.gridSettings}
          />
        );
      case 'category-cards':
        return (
          <CategoryCardsRenderer
            content={section.content}
            background={section.background}
            gridSettings={section.gridSettings}
          />
        );
      case 'image-banner':
        return (
          <BannerRenderer
            content={section.content}
            background={section.background}
            layout={section.layout}
          />
        );
      case 'video':
        return (
          <VideoRenderer
            content={section.content}
            background={section.background}
            layout={section.layout}
          />
        );
      case 'text-block':
        return (
          <TextBlockRenderer
            content={section.content}
            background={section.background}
            layout={section.layout}
          />
        );
      case 'split-hero-carousel':
        return (
          <SplitHeroCarouselRenderer
            key={section._id}
            sectionId={section._id}
            content={section.content}
            background={section.background}
          />
        );
      case 'new-arrivals-showcase':
        return (
          <NewArrivalsShowcaseRenderer
            key={section._id}
            sectionId={section._id}
            content={section.content}
            background={section.background}
            isEditMode={false}
            onEdit={() => { }}
          />
        );
      case 'jockey-new-arrivals':
        return (
          <JockeyNewArrivalsRenderer
            key={section._id}
            sectionId={section._id}
            content={section.content}
            background={section.background}
            isEditMode={false}
            onEdit={() => { }}
          />
        );
      case 'essentials-category-grid':
        return (
          <EssentialsCategoryGridRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
          />
        );
      case 'colossal-carousel':
        return (
          <ColossalCarouselRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
            carouselSettings={section.carouselSettings}
          />
        );
      case 'colossal-static-grid':
        return (
          <ColossalStaticGridRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
            gridSettings={section.gridSettings}
          />
        );
      case 'prime-selections':
        return (
          <PrimeSelectionsRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
          />
        );
      case 'slide-into-colors':
        return (
          <SlideIntoColorsRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
          />
        );
      case 'image-text-split':
        return (
          <ImageTextSplitRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
            layout={section.layout}
            onEdit={() => { }}
          />
        );
      case 'headline-bar':
        return (
          <HeadlineBarRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
            isEditMode={false}
            onEdit={() => { }}
          />
        );
      case 'blog-grid':
        return (
          <BlogGridRenderer
            sectionId={section._id}
            content={section.content}
            background={section.background}
            gridSettings={section.gridSettings}
            isEditMode={false}
            onEdit={() => { }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Botam Apparels</h2>
          <p className="text-secondary">Homepage sections will appear here once configured by admin</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => (
        <div key={section._id}>
          {renderSection(section)}
        </div>
      ))}
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

export default HomePage;

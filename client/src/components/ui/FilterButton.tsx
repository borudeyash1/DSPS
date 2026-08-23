import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

interface FilterButtonProps {
  availableFilters: {
    sizes: string[];
    colors: string[];
  };
  activeFilters: {
    sizes: string[];
    colors: string[];
    priceRange: string | null;
  };
  onFilterChange: (type: 'size' | 'color' | 'price', value: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  availableFilters,
  activeFilters,
  onFilterChange,
  onClearAll,
  activeFilterCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const priceRanges = [
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹999', value: '500-999' },
    { label: '₹1000 - ₹1999', value: '1000-1999' },
    { label: '₹2000 - ₹4999', value: '2000-4999' },
    { label: 'Above ₹5000', value: '5000-999999' },
  ];

  return (
    <StyledWrapper>
      <label className="popup">
        <input 
          type="checkbox" 
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />
        <div className="burger" tabIndex={0}>
          <span />
          <span />
          <span />
          <span className="filter-text">FILTER</span>
        </div>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
        <nav className="popup-window">
          <div className="filter-header">
            <legend>Filters</legend>
            {activeFilterCount > 0 && (
              <button 
                className="clear-all-btn"
                onClick={(e) => {
                  e.preventDefault();
                  onClearAll();
                  setIsOpen(false);
                }}
              >
                <X size={12} />
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            {/* Size Filters */}
            {availableFilters.sizes.length > 0 && (
              <div className="filter-group">
                <h4 className="filter-title">Size</h4>
                <div className="filter-options">
                  {availableFilters.sizes.map((size) => (
                    <button
                      key={`size-${size}`}
                      className={`filter-chip ${activeFilters.sizes.includes(size) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onFilterChange('size', size);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Filters */}
            {availableFilters.colors.length > 0 && (
              <div className="filter-group">
                <h4 className="filter-title">Color</h4>
                <div className="filter-options">
                  {availableFilters.colors.map((color) => (
                    <button
                      key={`color-${color}`}
                      className={`filter-chip ${activeFilters.colors.includes(color) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onFilterChange('color', color);
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filters */}
            <div className="filter-group">
              <h4 className="filter-title">Price Range</h4>
              <ul className="price-list">
                {priceRanges.map((range) => (
                  <li key={range.value}>
                    <button
                      className={activeFilters.priceRange === range.value ? 'active' : ''}
                      onClick={(e) => {
                        e.preventDefault();
                        onFilterChange('price', range.value);
                      }}
                    >
                      <span className="price-label">{range.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Base popup settings */
  .popup {
    --burger-line-width: 1.125em;
    --burger-line-height: 0.125em;
    --burger-offset: 0.625em;
    --burger-bg: rgba(0, 0, 0, .15);
    --burger-color: #333;
    --burger-line-border-radius: 0.1875em;
    --burger-diameter: 2.125em;
    --burger-btn-border-radius: calc(var(--burger-diameter) / 2);
    --burger-line-transition: .3s;
    --burger-transition: all .1s ease-in-out;
    --burger-hover-scale: 1.1;
    --burger-active-scale: .95;
    --burger-enable-outline-color: var(--burger-bg);
    --burger-enable-outline-width: 0.125em;
    --burger-enable-outline-offset: var(--burger-enable-outline-width);
    --nav-padding-x: 1em;
    --nav-padding-y: 1em;
    --nav-border-radius: 0.5em;
    --nav-border-color: #e5e7eb;
    --nav-border-width: 0.0625em;
    --nav-shadow-color: rgba(0, 0, 0, .15);
    --nav-shadow-width: 0 4px 20px;
    --nav-bg: #fff;
    --nav-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --nav-default-scale: .8;
    --nav-active-scale: 1;
    --nav-position-left: 0;
    --nav-position-right: unset;
    --nav-title-size: 0.75em;
    --nav-title-color: #333;
    --nav-title-padding-x: 0;
    --nav-title-padding-y: 0;
    --nav-button-padding-x: 0.75em;
    --nav-button-padding-y: 0.5em;
    --nav-button-border-radius: 0.375em;
    --nav-button-font-size: 12px;
    --nav-button-hover-bg: #000;
    --nav-button-hover-text-color: #fff;
    --nav-button-distance: 0.5em;
    --underline-border-width: 0.0625em;
    --underline-border-color: #e5e7eb;
    --underline-margin-y: 0.5em;

    display: inline-block;
    text-rendering: optimizeLegibility;
    position: relative;
    isolation: isolate;
    z-index: 100;
  }

  .popup input {
    display: none;
  }

  .burger {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 0 16px;
    background: var(--burger-bg);
    height: var(--burger-diameter);
    min-width: 100px;
    border-radius: calc(var(--burger-diameter) / 2);
    border: none;
    cursor: pointer;
    transition: var(--burger-transition);
    outline: var(--burger-enable-outline-width) solid transparent;
    outline-offset: 0;
    overflow: hidden;
  }

  .burger span:not(.filter-text) {
    height: var(--burger-line-height);
    width: var(--burger-line-width);
    background: var(--burger-color);
    border-radius: var(--burger-line-border-radius);
    position: absolute;
    left: 16px;
    transition: var(--burger-line-transition);
  }

  .burger span:nth-child(1) {
    top: var(--burger-offset);
  }

  .burger span:nth-child(2) {
    bottom: var(--burger-offset);
  }

  .burger span:nth-child(3) {
    top: 50%;
    transform: translateY(-50%);
  }

  .filter-text {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #333;
    user-select: none;
    transition: color 0.2s;
    margin-left: 32px;
    white-space: nowrap;
  }

  .burger:hover .filter-text {
    color: #000;
  }

  .filter-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #000;
    color: #fff;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    z-index: 10;
    pointer-events: none;
  }

  .popup-window {
    transform: scale(var(--nav-default-scale));
    visibility: hidden;
    opacity: 0;
    position: absolute;
    padding: var(--nav-padding-y) var(--nav-padding-x);
    background: var(--nav-bg);
    font-family: var(--nav-font-family);
    border-radius: var(--nav-border-radius);
    box-shadow: var(--nav-shadow-width) var(--nav-shadow-color);
    border: var(--nav-border-width) solid var(--nav-border-color);
    top: calc(var(--burger-diameter) + var(--burger-enable-outline-width) + var(--burger-enable-outline-offset) + 8px);
    left: var(--nav-position-left);
    right: var(--nav-position-right);
    transition: var(--burger-transition);
    min-width: 280px;
    max-width: 320px;
    max-height: 500px;
    overflow-y: auto;
    z-index: 101;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
    padding-bottom: 0.75em;
    border-bottom: 1px solid var(--nav-border-color);
  }

  .popup-window legend {
    padding: var(--nav-title-padding-y) var(--nav-title-padding-x);
    margin: 0;
    color: var(--nav-title-color);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #fee;
    color: #e11d48;
    border: 1px solid #fecdd3;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-all-btn:hover {
    background: #e11d48;
    color: #fff;
    border-color: #e11d48;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 1.25em;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
  }

  .filter-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
    margin: 0;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .filter-chip {
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    background: #fff;
    color: #333;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .filter-chip:hover {
    border-color: #000;
    background: #f9fafb;
  }

  .filter-chip.active {
    background: #000;
    color: #fff;
    border-color: #000;
  }

  .price-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .price-list li {
    margin-bottom: 0.25em;
  }

  .price-list button {
    outline: none;
    width: 100%;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    color: var(--burger-color);
    font-size: 13px;
    padding: var(--nav-button-padding-y) var(--nav-button-padding-x);
    white-space: nowrap;
    border-radius: var(--nav-button-border-radius);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .price-list button:hover {
    background: #f3f4f6;
  }

  .price-list button.active {
    background: var(--nav-button-hover-bg);
    color: var(--nav-button-hover-text-color);
    font-weight: 600;
  }

  .price-label {
    flex: 1;
    text-align: left;
  }

  /* Burger animations */
  .burger:hover {
    transform: scale(var(--burger-hover-scale));
  }

  .burger:active {
    transform: scale(var(--burger-active-scale));
  }

  .burger:focus:not(:hover) {
    outline-color: var(--burger-enable-outline-color);
    outline-offset: var(--burger-enable-outline-offset);
  }

  .popup input:checked + .burger span:nth-child(1) {
    top: 50%;
    left: 16px;
    transform: translateY(-50%) rotate(45deg);
  }

  .popup input:checked + .burger span:nth-child(2) {
    bottom: 50%;
    left: 16px;
    transform: translateY(50%) rotate(-45deg);
  }

  .popup input:checked + .burger span:nth-child(3) {
    left: -50px;
    transform: translateY(-50%) translateX(-100%);
  }

  .popup input:checked ~ nav {
    transform: scale(var(--nav-active-scale));
    visibility: visible;
    opacity: 1;
  }

  /* Scrollbar styling */
  .popup-window::-webkit-scrollbar {
    width: 6px;
  }

  .popup-window::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .popup-window::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  .popup-window::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export default FilterButton;

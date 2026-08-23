import React from 'react';
import styled from 'styled-components';

interface SortDropdownProps {
  onSortChange: (sort: string) => void;
  currentSort?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSortChange, currentSort = '-createdAt' }) => {
  const options = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' }
  ];

  const currentOption = options.find(opt => opt.value === currentSort) || options[0];

  return (
    <StyledWrapper>
      <div className="select">
        <div className="selected">
          <span>{currentOption.label}</span>
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="arrow">
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </div>
        <div className="options">
          {options.map((option) => (
            <div key={option.value} title={option.value}>
              <input 
                id={`sort-${option.value}`} 
                name="sort-option" 
                type="radio" 
                checked={currentSort === option.value}
                onChange={() => onSortChange(option.value)}
              />
              <label 
                className="option" 
                htmlFor={`sort-${option.value}`} 
                data-txt={option.label}
              />
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

// Adapted styles for light/dark theme compatibility, maintaining the requested aesthetic
const StyledWrapper = styled.div`
  .select {
    width: fit-content;
    cursor: pointer;
    position: relative;
    transition: 300ms;
    color: black;
    overflow: visible;
    z-index: 20; /* Reduced z-index to sit below navbar/modals but above content */
  }

  .selected {
    background-color: white;
    padding: 8px 16px;
    margin-bottom: 3px;
    border-radius: 5px;
    position: relative;
    z-index: 21; 
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e7eb;
    min-width: 180px;
  }

  .arrow {
    position: relative;
    height: 10px;
    transform: rotate(-90deg);
    width: 12px;
    fill: black;
    z-index: 22;
    transition: 300ms;
  }

  .options {
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 5px;
    background-color: white;
    position: absolute;
    top: 45px;
    left: 0;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    transition: 300ms;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    transform: translateY(-10px);
    z-index: 20; /* Matches parent context */
  }

  .select:hover > .options {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    top: 100%; /* Align properly */
  }

  .select:hover > .selected .arrow {
    transform: rotate(0deg);
  }

  .option {
    border-radius: 5px;
    padding: 8px 12px;
    transition: 300ms;
    background-color: white;
    width: 100%;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    box-sizing: border-box;
  }

  .option:hover {
    background-color: #f3f4f6; /* tailwind gray-100 */
  }

  .options input[type="radio"] {
    display: none;
  }

  .options label {
    display: inline-block;
  }
  
  .options label::before {
    content: attr(data-txt);
  }

  /* Hide selected option from dropdown list */
  .options input[type="radio"]:checked + label {
    display: none;
  }
`;

export default SortDropdown;

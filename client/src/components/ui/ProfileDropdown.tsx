import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Package, Heart, Settings, LogOut, Truck } from 'lucide-react';
import Avatar, { genConfig } from 'react-nice-avatar';

interface ProfileDropdownProps {
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate avatar config from user's name
  const avatarConfig = genConfig(user.fullName || user.email);

  const menuItems = [
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'Track Order', path: '/track-order', icon: Truck },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Account Settings', path: '/profile', icon: Settings },
  ];

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <StyledWrapper>
      <div
        className="select"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="selected">
          <div className="user-info">
            <div className="avatar">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Avatar style={{ width: '32px', height: '32px' }} {...avatarConfig} />
              )}
            </div>
            <span className="user-name">{user.fullName?.split(' ')[0]}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="arrow">
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </div>

        <div className={`options ${isOpen ? 'show' : ''}`}>
          <div className="user-header">
            <p className="user-full-name">{user.fullName}</p>
            <p className="user-email">{user.email}</p>
          </div>

          <div className="menu-items">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="menu-item"
                onClick={handleMenuClick}
              >
                <item.icon className="menu-icon" size={16} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="logout-section">
            <button onClick={handleLogoutClick} className="logout-btn">
              <LogOut className="menu-icon" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .select {
    width: fit-content;
    cursor: pointer;
    position: relative;
    transition: 300ms;
    color: #333;
    z-index: 1000;
  }

  .selected {
    background-color: white;
    padding: 8px 12px;
    margin-bottom: 3px;
    border-radius: 24px;
    border: 1px solid #e5e7eb;
    position: relative;
    z-index: 1001;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 140px;
    transition: all 0.2s;
  }

  .selected:hover {
    border-color: #d1d5db;
    background-color: #f9fafb;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-name {
    font-weight: 700;
    color: #374151;
    font-size: 14px;
  }

  .arrow {
    position: relative;
    height: 10px;
    transform: rotate(-90deg);
    width: 16px;
    fill: #6b7280;
    z-index: 1002;
    transition: 300ms;
  }

  .options {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    background-color: white;
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 240px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    z-index: 1000;
  }

  .options.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .select:hover .arrow {
    transform: rotate(0deg);
  }

  .user-header {
    padding: 12px 16px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .user-full-name {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
    margin: 0;
  }

  .user-email {
    font-size: 12px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .menu-items {
    padding: 8px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    transition: all 0.2s;
    color: #374151;
    text-decoration: none;
    font-size: 14px;
  }

  .menu-item:hover {
    background-color: #f3f4f6;
  }

  .menu-icon {
    color: #6b7280;
  }

  .logout-section {
    border-top: 1px solid #e5e7eb;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    width: 100%;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.2s;
    color: #dc2626;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
  }

  .logout-btn:hover {
    background-color: #fef2f2;
  }

  .logout-btn .menu-icon {
    color: #dc2626;
  }
`;

export default ProfileDropdown;

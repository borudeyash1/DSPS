import { useState } from 'react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import adminApi from '../../services/adminApi';
import { User, Bell, Lock, Globe } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';


const AdminSettingsPage = () => {
  const { admin, isLoading } = useAdminAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  /* State for Password Change */
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  const handlePasswordChangeInit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setSecurityLoading(true);
    try {
      await adminApi.post('/admin/change-password/initiate', {
        currentPassword: passwordData.currentPassword
      });

      setShowOtpInput(true);
      showToast('OTP sent to your email. Please verify to complete password change', 'success');
    } catch (error: any) {
      console.error('Password change init error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to initiate password change';
      showToast(errorMsg, 'error');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handlePasswordChangeVerify = async () => {
    if (!otp) {
      showToast('Please enter OTP', 'warning');
      return;
    }

    setSecurityLoading(true);
    try {
      await adminApi.post('/admin/change-password/verify', {
        otp,
        newPassword: passwordData.newPassword
      });

      showToast('Password changed successfully!', 'success');
      // Reset State
      setShowOtpInput(false);
      setOtp('');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error: any) {
      console.error('Password change verify error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to verify OTP';
      showToast(errorMsg, 'error');
    } finally {
      setSecurityLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">

        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>

        {/* content Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="h-10 w-full border-b border-gray-100 flex gap-6">
            <div className="h-full w-24 bg-gray-100 rounded-t"></div>
            <div className="h-full w-24 bg-white rounded-t"></div>
            <div className="h-full w-24 bg-white rounded-t"></div>
            <div className="h-full w-24 bg-white rounded-t"></div>
          </div>
          <div className="space-y-6 pt-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-10 w-full bg-gray-50 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-10 w-full bg-gray-50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your admin account settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notifications'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              General
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={admin?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  value={admin?.role || 'Admin'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                />
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  To update your profile information, please contact the system administrator.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Notifications</p>
                    <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User Activity</p>
                    <p className="text-sm text-gray-500">Get notified about user registrations</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>

              <div>
                <h3 className="font-medium mb-4">Change Password</h3>

                {!showOtpInput ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChangeInit}
                      disabled={securityLoading}
                      className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {securityLoading ? 'Verifying...' : 'Update Password'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4 border border-blue-200">
                      An OTP has been sent to your email. Please enter it below to confirm your password change.
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg tracking-widest text-center text-xl"
                        placeholder="XXXXXX"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handlePasswordChangeVerify}
                        disabled={securityLoading}
                        className="flex-1 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {securityLoading ? 'Updating...' : 'Verify & Update'}
                      </button>
                      <button
                        onClick={() => setShowOtpInput(false)}
                        disabled={securityLoading}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Store Name</label>
                <input
                  type="text"
                  defaultValue="Botam Apparels"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Zone</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Asia/Kolkata (IST)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>

              <button className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

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

export default AdminSettingsPage;

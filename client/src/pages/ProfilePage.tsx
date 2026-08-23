import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, MapPin, Lock, Package, Heart, Edit2, Save, X, Plus, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordOtpLoading, setPasswordOtpLoading] = useState(false);

  // WhatsApp OTP verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'VERIFY_OLD' | 'VERIFY_NEW'>('VERIFY_NEW');
  const [pendingPhone, setPendingPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Address>({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/addresses`, { withCredentials: true });
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses');
      showToast('Failed to load saved addresses', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          gender: formData.gender
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        // Update formData to reflect the new user data
        setFormData({
          fullName: updatedUser.fullName || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          gender: updatedUser.gender || '',
        });
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);

    try {
      // Determine which number to send to
      const targetPhone = otpStep === 'VERIFY_OLD' ? user?.phone : pendingPhone;

      const response = await axios.post(
        `${API_URL}/auth/send-whatsapp-otp`,
        { phoneNumber: targetPhone },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpSent(true);
        showToast(`OTP sent to ${otpStep === 'VERIFY_OLD' ? 'your registered' : 'the new'} WhatsApp number!`, 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);

    try {
      if (otpStep === 'VERIFY_OLD') {
        // Verify Old Number OTP
        const response = await axios.post(
          `${API_URL}/auth/verify-old-phone-otp`,
          { otp },
          { withCredentials: true }
        );

        if (response.data.success) {
          setVerificationToken(response.data.data.verificationToken);
          showToast('Old number verified! Now verify the new number.', 'success');

          // Transition to Step 2
          setOtpStep('VERIFY_NEW');
          setOtpSent(false);
          setOtp('');
        }
      } else {
        // Verify New Number OTP
        const response = await axios.post(
          `${API_URL}/auth/verify-whatsapp-otp`,
          {
            phoneNumber: pendingPhone,
            otp,
            verificationToken // Pass token if we have one
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          const updatedUser = response.data.data.user;
          console.log('📱 OTP Verified - Updated User Data:', updatedUser);

          setUser(updatedUser);
          // Update formData to reflect the new user data
          setFormData({
            fullName: updatedUser.fullName || '',
            email: updatedUser.email || '',
            phone: updatedUser.phone || '',
            gender: updatedUser.gender || '',
          });
          showToast('WhatsApp number verified and updated successfully!', 'success');
          setShowOtpModal(false);
          setIsEditing(false);
          setOtp('');
          setOtpSent(false);
          setPendingPhone('');
          setVerificationToken(null);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Send OTP for password change
  const handleSendPasswordOTP = async () => {
    console.log('🔐 Sending password change OTP...');
    setPasswordOtpLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/send-password-change-otp`,
        {},
        { withCredentials: true }
      );

      console.log('✅ OTP Response:', response.data);
      if (response.data.success) {
        setPasswordOtpSent(true);
        showToast('OTP sent to your email!', 'success');
      }
    } catch (err: any) {
      console.error('❌ OTP Error:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setPasswordOtpLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (!passwordOtpSent) {
      showToast('Please request OTP first', 'warning');
      return;
    }

    if (!passwordData.otp || passwordData.otp.length !== 6) {
      showToast('Please enter the 6-digit OTP', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/auth/change-password-with-otp`,
        {
          newPassword: passwordData.newPassword,
          otp: passwordData.otp,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
          otp: '',
        });
        setPasswordOtpSent(false);
        setShowPasswordForm(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAddressId) {
        // Update existing address
        const response = await axios.put(
          `${API_URL}/auth/addresses/${editingAddressId}`,
          addressForm,
          { withCredentials: true }
        );
        if (response.data.success) {
          setAddresses(response.data.data.addresses);
          showToast('Address updated successfully!', 'success');
        }
      } else {
        // Add new address
        const response = await axios.post(
          `${API_URL}/auth/addresses`,
          addressForm,
          { withCredentials: true }
        );
        if (response.data.success) {
          setAddresses(response.data.data.addresses);
          showToast('Address added successfully!', 'success');
        }
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/auth/addresses/${addressId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        showToast('Address deleted successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/auth/addresses/${addressId}/default`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        showToast('Default address updated!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to set default address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm(address);
    setEditingAddressId(address._id || null);
    setShowAddressForm(true);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-secondary">Manage your account information and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-muted">{user.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-muted text-secondary">
                    {user.email}
                    {user.isEmailVerified && (
                      <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                    )}
                  </p>
                  <p className="text-xs text-secondary mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Mobile Number
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:outline-none focus:border-primary"
                        placeholder="9876543210"
                      />
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-muted">
                      {user.phone || 'Not provided'}
                      {user.phone && (
                        <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Gender
                  </label>
                  {isEditing ? (
                    <div className="flex gap-4 items-center h-[50px]">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.gender === g}
                            onChange={handleChange}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="text-sm">{g}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-muted">{user.gender || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Saved Addresses
                </h2>
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    setAddressForm({
                      street: '',
                      city: '',
                      state: '',
                      pincode: '',
                      country: 'India',
                      isDefault: false,
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-6 p-6 border border-gray-200 bg-gray-50 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    {editingAddressId ? (
                      <>
                        <Edit2 className="w-4 h-4 text-primary" />
                        Edit Address
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-primary" />
                        New Address
                      </>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={addressForm.pincode}
                        onChange={handleAddressChange}
                        required
                        pattern="[0-9]{6}"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="400001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-5 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Set as default shipping address
                    </label>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </span>
                      ) : (
                        'Save Address'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No saved addresses yet</p>
                  <p className="text-gray-400 text-sm mt-2">Add your first address to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`relative p-5 border-2 rounded-xl transition-all hover:shadow-md ${address.isDefault
                        ? 'border-black bg-black/5 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full mb-3">
                              <Check className="w-3 h-3" />
                              Default
                            </span>
                          )}
                          <p className="font-semibold text-gray-900 mb-1 leading-relaxed">{address.street}</p>
                          <p className="text-sm text-gray-600 mb-0.5">
                            {address.city}, {address.state}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.pincode}, {address.country}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address._id!)}
                              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Set as default"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit address"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id!)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Security</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  {/* OTP Verification - Moved to Top */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-semibold mb-2">🔒 Email Verification Required</p>
                    <p className="text-xs text-blue-700 mb-3">
                      For your security, we'll send a verification code to: <span className="font-semibold">{user?.email}</span>
                    </p>

                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={handleSendPasswordOTP}
                        disabled={passwordOtpLoading || passwordOtpSent}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {passwordOtpLoading ? 'Sending...' : passwordOtpSent ? '✓ OTP Sent' : 'Send OTP to Email'}
                      </button>
                      {passwordOtpSent && (
                        <span className="flex items-center text-sm text-green-600 font-medium">
                          <Check className="w-4 h-4 mr-1" />
                          Check your email
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter OTP from Email</label>
                    <input
                      type="text"
                      name="otp"
                      value={passwordData.otp}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        setPasswordData({ ...passwordData, otp: value });
                      }}
                      required
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-2xl tracking-widest text-center"
                    />
                    <p className="text-xs text-gray-500 mt-1">OTP is valid for 10 minutes</p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          newPassword: '',
                          confirmPassword: '',
                          otp: '',
                        });
                        setPasswordOtpSent(false);
                      }}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Account Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Orders
                  </span>
                  <span className="font-medium">{user.orderHistory?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </span>
                  <span className="font-medium">{user.wishlist?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Addresses
                  </span>
                  <span className="font-medium">{addresses.length}</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700">Email Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-6 relative">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                  setOtpSent(false);
                  setPendingPhone('');
                  setVerificationToken(null);
                }}
                className="absolute top-4 right-4 text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-4">
                {otpStep === 'VERIFY_OLD' ? 'Verify Current Number' : 'Verify New Number'}
              </h2>

              <div className="mb-6">
                <p className="text-secondary mb-2">
                  We'll send a verification code to:
                </p>
                <p className="font-medium text-lg">
                  {otpStep === 'VERIFY_OLD' ? user?.phone : pendingPhone}
                </p>
              </div>

              {!otpSent ? (
                <div>
                  <p className="text-sm text-secondary mb-4">
                    Click below to receive a 6-digit OTP on {otpStep === 'VERIFY_OLD' ? 'your registered' : 'the new'} WhatsApp number.
                  </p>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="w-full px-4 py-3 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    {otpLoading ? 'Sending...' : 'Send OTP via WhatsApp'}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-primary text-center text-2xl tracking-widest mb-4"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full px-4 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 mb-2"
                  >
                    {otpLoading ? 'Verifying...' : (otpStep === 'VERIFY_OLD' ? 'Verify & Proceed' : 'Verify & Update')}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="w-full px-4 py-2 text-sm text-accent hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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

export default ProfilePage;

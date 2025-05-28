import React, { useState, useEffect } from 'react';
import './styles/account.css';
import SellForm from './SellForm';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function Profile() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        memberSince: '',
        activeListings: 0,
        activeBids: 0,
        totalSales: 0,
        role: '',
        isCompany: false
    });
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        displayName: ''
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [notifications, setNotifications] = useState({
        emailBids: true,
        smsAuctions: true,
        marketing: false
    });
    const [bids, setBids] = useState([]);
    const [userId, setUserId] = useState(null);
    const [editingListing, setEditingListing] = useState(null);
    const [editFormData, setEditFormData] = useState({
        price: '',
        description: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Add darkInputStyle for inputs, matching Auction and SellForm
    const darkInputStyle = {
        background: '#181828',
        border: '1.5px solid #23233a',
        borderRadius: 8,
        color: '#fff',
        fontSize: '0.95rem',
        padding: '6px 10px',
        minHeight: '40px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border 0.2s, box-shadow 0.2s',
    };

    useEffect(() => {
        // Load user data when component mounts
        const token = Cookies.get('authToken');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.sub);
        }
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = Cookies.get('authToken');

            if (!token) {
                showNotification('Please log in to view your profile', 'error');
                return;
            }

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.sub;

            // Fetch user's full details
            const userResponse = await fetch(`https://rprauto.onrender.com/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                console.error('Error response:', errorData); // Debug log
                throw new Error(errorData.message || 'Failed to fetch user details');
            }

            const userData = await userResponse.json();

            // Fetch user's listings
            const listingsResponse = await fetch(`https://rprauto.onrender.com/user/${userId}/listings`, {
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!listingsResponse.ok) {
                throw new Error('Failed to fetch listings');
            }

            const listingsData = await listingsResponse.json();

            // Fetch detailed data for each listing
            const detailedListings = await Promise.all(
                listingsData.map(async (listing) => {
                    const detailResponse = await fetch(`https://rprauto.onrender.com/listing/${listing.Id}`, {
                        headers: {
                            'Authorization': `Bearer ${token.trim()}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!detailResponse.ok) {
                        console.error(`Failed to fetch details for listing ${listing.Id}`);
                        return listing; // Return original listing if detail fetch fails
                    }

                    return await detailResponse.json();
                })
            );

            setListings(detailedListings);

            // Fetch user's bids
            const bidsResponse = await fetch(`https://rprauto.onrender.com/user/${userId}/bids`, {
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!bidsResponse.ok) {
                throw new Error('Failed to fetch bids');
            }

            const bidsData = await bidsResponse.json();

            // Fetch detailed data for each bid
            const detailedBids = await Promise.all(
                bidsData.map(async (bid) => {
                    const detailResponse = await fetch(`https://rprauto.onrender.com/bid/${bid.Id}`, {
                        headers: {
                            'Authorization': `Bearer ${token.trim()}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!detailResponse.ok) {
                        console.error(`Failed to fetch details for bid ${bid.Id}`);
                        return bid; // Return original bid if detail fetch fails
                    }

                    return await detailResponse.json();
                })
            );

            setBids(detailedBids);
            
            // Update form data with fetched user data
            setFormData({
                firstName: userData.PrivateData.Personal.FirstName || '',
                lastName: userData.PrivateData.Personal.LastName || '',
                email: userData.PrivateData.Login.Email || '',
                phone: userData.PublicData.PhoneNumber || '',
                address: userData.PrivateData.Personal.Address || '',
                city: userData.PublicData.City || '',
                country: userData.PublicData.Country || '',
                displayName: userData.PublicData.DisplayName || ''
            });

            // Update user data for dashboard
            setUserData(prev => ({
                ...prev,
                name: userData.PublicData.DisplayName,
                email: userData.PrivateData.Login.Email,
                phone: userData.PublicData.PhoneNumber,
                memberSince: new Date(userData.CreatedAt).getFullYear().toString(),
                activeListings: detailedListings.length,
                activeBids: detailedBids.length,
                totalSales: detailedListings.reduce((total, listing) => total + (listing.Price || 0), 0),
                role: userData.Role,
                isCompany: userData.Role === 'Company'
            }));

        } catch (error) {
            console.error('Error loading user data:', error);
            showNotification(error.message || 'Failed to load user data', 'error');
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file)
        }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (id) => {
        setImagePreviews(prev => prev.filter(preview => preview.id !== id));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showNotification('Please log in to update your profile', 'error');
                return;
            }

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.sub;

            const response = await fetch(`https://rprauto.onrender.com/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    displayName: formData.displayName,
                    phoneNumber: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            showNotification('Profile updated successfully!');
            loadUserData(); // Reload user data to ensure everything is in sync
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile', 'error');
        }
    };

    const handleSellSubmit = (e) => {
        e.preventDefault();
        // Handle sell form submission
        showNotification('Your vehicle listing has been submitted for review!');
        setImagePreviews([]);
    };

    const handleDeleteListing = async (listingId) => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showNotification('Please log in to delete listings', 'error');
                return;
            }

            const response = await fetch(`https://rprauto.onrender.com/listing/${listingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete listing');
            }

            // Remove the deleted listing from the state
            setListings(prevListings => prevListings.filter(listing => listing.Id !== listingId));
            
            // Update the dashboard stats
            setUserData(prev => ({
                ...prev,
                activeListings: prev.activeListings - 1
            }));

            showNotification('Listing deleted successfully');
        } catch (error) {
            console.error('Error deleting listing:', error);
            showNotification(error.message || 'Failed to delete listing', 'error');
        }
    };

    const handleEditListing = async (listingId) => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showNotification('Please log in to edit listings', 'error');
                return;
            }

            const response = await fetch(`https://rprauto.onrender.com/listing/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    price: parseFloat(editFormData.price),
                    description: editFormData.description
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update listing');
            }

            // Update the listing in the state
            setListings(prevListings => 
                prevListings.map(listing => 
                    listing.Id === listingId 
                        ? { ...listing, Price: parseFloat(editFormData.price), Description: editFormData.description }
                        : listing
                )
            );

            // Reset edit form and close it
            setEditingListing(null);
            setEditFormData({ price: '', description: '' });

            showNotification('Listing updated successfully');
        } catch (error) {
            console.error('Error updating listing:', error);
            showNotification(error.message || 'Failed to update listing', 'error');
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openEditForm = (listing) => {
        setEditingListing(listing);
        setEditFormData({
            price: listing.Price.toString(),
            description: listing.Description || ''
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingListing(null);
        setEditFormData({ price: '', description: '' });
    };

    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#695FD6';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    const handleDeleteBid = async (bidId) => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showNotification('Please log in to delete bids', 'error');
                return;
            }
            const response = await fetch(`https://rprauto.onrender.com/bid/${bidId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete bid');
            }
            setBids(prevBids => prevBids.filter(bid => bid.Id !== bidId));
            showNotification('Bid deleted successfully');
        } catch (error) {
            console.error('Error deleting bid:', error);
            showNotification(error.message || 'Failed to delete bid', 'error');
        }
    };

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showNotification('Please fill in all password fields', 'error');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        try {
            setPasswordLoading(true);
            const token = Cookies.get('authToken');
            if (!token) {
                showNotification('Please log in to change your password', 'error');
                setPasswordLoading(false);
                return;
            }
            // Use new API endpoint
            const response = await fetch('https://rprauto.onrender.com/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }
            showNotification('Password updated successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showNotification(error.message || 'Failed to change password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="account-container">
            <div className="account-layout">
                {/* Account Navigation */}
                <div className="account-nav">
                    <h3>My Account</h3>
                    <a href="#dashboard" 
                       className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('dashboard'); }}>
                        <i className="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="#profile" 
                       className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('profile'); }}>
                        <i className="fas fa-user"></i> Profile
                    </a>
                    <a href="#listings" 
                       className={`nav-item ${activeSection === 'listings' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('listings'); }}>
                        <i className="fas fa-car"></i> My Listings
                    </a>
                    <a href="#bids" 
                       className={`nav-item ${activeSection === 'bids' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('bids'); }}>
                        <i className="fas fa-gavel"></i> My Bids
                    </a>
                    <a href="#sell" 
                       className={`nav-item ${activeSection === 'sell' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('sell'); }}>
                        <i className="fas fa-plus-circle"></i> Sell Your Car
                    </a>
                    <a href="#settings" 
                       className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                       onClick={(e) => { e.preventDefault(); handleSectionChange('settings'); }}>
                        <i className="fas fa-cog"></i> Settings
                    </a>
                </div>

                {/* Account Content */}
                <div className="account-content">
                    {/* Dashboard Section */}
                    {activeSection === 'dashboard' && (
                        <div className="account-section active">
                            <h2 className="section-title">Dashboard</h2>
                            
                            <div className="profile-info">
                                <div className="profile-avatar">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div className="profile-details">
                                    <h3>{userData.name}</h3>
                                    <p>Member since {userData.memberSince}</p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number">{userData.activeListings}</div>
                                    <div className="stat-label">Active Listings</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{userData.activeBids}</div>
                                    <div className="stat-label">Active Bids</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">${(userData.totalSales / 1000).toFixed(0)}K</div>
                                    <div className="stat-label">Total Sales</div>
                                </div>
                            </div>

                            <h3 style={{ color: 'white', marginBottom: '16px' }}>Recent Activity</h3>
                            <div className="listing-card">
                                <div className="listing-header">
                                    <div className="listing-title">Your bid on 2023 BMW M4 Competition</div>
                                    <div className="listing-status status-active">Outbid</div>
                                </div>
                                <p style={{ color: '#9ca3af' }}>You were outbid on this auction. Current bid: $76,500</p>
                            </div>
                        </div>
                    )}

                    {/* Listings Section */}
                    {activeSection === 'listings' && (
                        <div className="account-section active">
                            <h2 className="section-title">My Listings</h2>
                            
                            {listings.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-car"></i>
                                    <p>You haven't listed any cars yet.</p>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => handleSectionChange('sell')}
                                    >
                                        List Your First Car
                                    </button>
                                </div>
                            ) : (
                                <div className="listings-grid">
                                    {listings.map((listing) => (
                                        <div key={listing.Id} className="listing-card">
                                            {editingListing === listing.Id ? (
                                                <div className="edit-form">
                                                    <h3>Edit Listing</h3>
                                                    <div className="form-group">
                                                        <label>Price ($)</label>
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            value={editFormData.price}
                                                            onChange={handleEditFormChange}
                                                            className="form-input"
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Description</label>
                                                        <textarea
                                                            name="description"
                                                            value={editFormData.description}
                                                            onChange={handleEditFormChange}
                                                            className="form-input"
                                                            rows="4"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-actions">
                                                        <button 
                                                            className="btn btn-primary"
                                                            onClick={() => handleEditListing(listing.Id)}
                                                        >
                                                            Save Changes
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline"
                                                            onClick={() => {
                                                                setEditingListing(null);
                                                                setEditFormData({ price: '', description: '' });
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="listing-header">
                                                        <div className="listing-title">
                                                            {listing.Car.Make} {listing.Car.Model} {listing.Car.Year}
                                                        </div>
                                                        <div className={`listing-status status-${listing.Status?.toLowerCase() || 'pending'}`}>
                                                            {listing.Status || 'Pending'}
                                                        </div>
                                                    </div>
                                                    <div className="listing-details">
                                                        <div className="listing-price">
                                                            ${(listing.Price || 0).toLocaleString()}
                                                        </div>
                                                        <div className="listing-info">
                                                            <span><i className="fas fa-road"></i> {(listing.Car.Mileage || 0).toLocaleString()} miles</span>
                                                            <span><i className="fas fa-gas-pump"></i> {listing.Car.FuelType || 'N/A'}</span>
                                                            <span><i className="fas fa-cog"></i> {listing.Car.GearboxType || 'N/A'}</span>
                                                        </div>
                                                        <div className="listing-description">
                                                            {listing.Description}
                                                        </div>
                                                    </div>
                                                    <div className="listing-actions">
                                                        <button 
                                                            className="btn btn-outline"
                                                            onClick={() => openEditForm(listing)}
                                                        >
                                                            <i className="fas fa-edit"></i> Edit
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline"
                                                            onClick={() => {
                                                                if (window.confirm('Are you sure you want to delete this listing?')) {
                                                                    handleDeleteListing(listing.Id);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="account-section active">
                            <h2 className="section-title">Profile Settings</h2>
                            
                            <form className="profile-form" onSubmit={handleProfileSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleFormChange}
                                            required 
                                            style={darkInputStyle}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleFormChange}
                                            required 
                                            style={darkInputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input 
                                            type="email" 
                                            className="form-input" 
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            style={darkInputStyle}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input 
                                            type="tel" 
                                            className="form-input" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleFormChange}
                                            required 
                                            style={darkInputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="city"
                                            value={formData.city}
                                            onChange={handleFormChange}
                                            style={darkInputStyle}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="country"
                                            value={formData.country}
                                            onChange={handleFormChange}
                                            style={darkInputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="form-row full">
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleFormChange}
                                            style={darkInputStyle}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {/* Settings Section */}
                    {activeSection === 'settings' && (
                        <div className="account-section active">
                            <h2 className="section-title">Account Settings</h2>
                            
                            <div className="form-grid">
                                <div className="sell-form">
                                    <h3><i className="fas fa-bell"></i> Notifications</h3>
                                    
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                name="emailBids"
                                                checked={notifications.emailBids}
                                                onChange={handleNotificationChange}
                                            />
                                            Email notifications for bids
                                        </label>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                name="smsAuctions"
                                                checked={notifications.smsAuctions}
                                                onChange={handleNotificationChange}
                                            />
                                            SMS notifications for auctions ending
                                        </label>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="checkbox" 
                                                name="marketing"
                                                checked={notifications.marketing}
                                                onChange={handleNotificationChange}
                                            />
                                            Marketing emails
                                        </label>
                                    </div>
                                    
                                    <button className="btn btn-primary">Save Preferences</button>
                                </div>

                                <div className="sell-form">
                                    <h3><i className="fas fa-lock"></i> Security</h3>
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordFormChange}
                                                required
                                            />
                                        </div>
                                        <button className="btn btn-primary" type="submit" disabled={passwordLoading}>
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sell Section */}
                    {activeSection === 'sell' && (
                        <div className="account-section active">
                            <SellForm />
                        </div>
                    )}

                    {/* Bids Section */}
                    {activeSection === 'bids' && (
                        <div className="account-section active">
                            <h2 className="section-title">My Bids</h2>
                            
                            {bids.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-gavel"></i>
                                    <p>You haven't created any bids yet.</p>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => window.location.href = '/search'}
                                    >
                                        Browse Auctions
                                    </button>
                                </div>
                            ) : (
                                <div className="listings-grid">
                                    {bids.map((bid) => (
                                        <div key={bid.Id} className="listing-card">
                                            <div className="listing-header">
                                                <div className="listing-title">
                                                    {bid.Car.Make} {bid.Car.Model} {bid.Car.Year}
                                                </div>
                                                <div className={`listing-status status-${bid.Status?.toLowerCase() || 'pending'}`}>
                                                    {bid.Status || 'Pending'}
                                                </div>
                                            </div>
                                            <div className="listing-details">
                                                <div className="listing-price">
                                                    Current Bid: ${(bid.TopBid || 0).toLocaleString()}
                                                </div>
                                                <div className="listing-info">
                                                    <span><i className="fas fa-road"></i> {(bid.Car.Mileage || 0).toLocaleString()} miles</span>
                                                    <span><i className="fas fa-gas-pump"></i> {bid.Car.FuelType || 'N/A'}</span>
                                                    <span><i className="fas fa-cog"></i> {bid.Car.GearboxType || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="listing-actions">
                                                <button className="btn btn-outline" onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this bid?')) {
                                                        handleDeleteBid(bid.Id);
                                                    }
                                                }}>
                                                    <i className="fas fa-trash"></i> Delete Bid
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Listing Modal */}
            {showEditModal && editingListing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Listing</h2>
                            <button 
                                className="modal-close"
                                onClick={closeEditModal}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="listing-preview">
                                <h3>{editingListing.Car.Make} {editingListing.Car.Model} {editingListing.Car.Year}</h3>
                                <div className="car-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Make:</span>
                                        <span className="detail-value">{editingListing.Car.Make}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Model:</span>
                                        <span className="detail-value">{editingListing.Car.Model}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Year:</span>
                                        <span className="detail-value">{editingListing.Car.Year}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Mileage:</span>
                                        <span className="detail-value">{editingListing.Car.Mileage.toLocaleString()} miles</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Fuel Type:</span>
                                        <span className="detail-value">{editingListing.Car.FuelType}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Gearbox:</span>
                                        <span className="detail-value">{editingListing.Car.GearboxType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditFormChange}
                                        className="form-input"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditFormChange}
                                        className="form-input"
                                        rows="6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-outline"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => handleEditListing(editingListing.Id)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile; 
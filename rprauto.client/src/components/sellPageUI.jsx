import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from './sellService';

const SellVehicle = () => {
    const navigate = useNavigate();
    const [listingType, setListingType] = useState('auction');
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        vin: '',
        bodyType: '',
        startingBid: '',
        reservePrice: '',
        askingPrice: '',
        description: '',
        city: '',
        state: '',
        termsAccepted: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleListingTypeChange = (type) => {
        setListingType(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.termsAccepted) {
            alert('Please accept the terms and conditions.');
            return;
        }

        const response = await createListing(formData);
        if (response.success) {
            alert('Listing created successfully! Our team will review it within 24 hours.');
            navigate('/');
        } else {
            alert('Failed to create listing. Please try again.');
        }
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = 1960; year <= currentYear; year++) {
        years.push(year);
    }

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <h1>
                                <a href="/" className="nav-link">
                                    AutoAuction
                                </a>
                            </h1>
                        </div>
                        <div className="nav-links">
                            <a href="/" className="nav-link">
                                Home
                            </a>
                            <a href="/marketplace" className="nav-link">
                                Marketplace
                            </a>
                            <a href="/auctions" className="nav-link">
                                Auctions
                            </a>
                            <a href="/sell" className="nav-link active">
                                Sell Your Car
                            </a>
                        </div>
                        <div className="nav-buttons">
                            <button className="btn btn-outline" onClick={() => navigate('/signin')}>
                                Sign In
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/register')}>
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sell Page Content */}
            <div className="sell-container">
                <div className="container">
                    {/* Header */}
                    <div className="sell-header">
                        <h1>Sell Your Vehicle</h1>
                        <p>
                            Reach thousands of qualified buyers and get the best price for your car through our auction
                            platform or direct sales.
                        </p>
                    </div>

                    {/* Benefits Section */}
                    <div className="benefits-section">
                        <div className="benefit-item">
                            <div className="benefit-icon">
                                <i className="fas fa-dollar-sign"></i>
                            </div>
                            <h3>Maximum Value</h3>
                            <p>Our auction format ensures you get the highest possible price for your vehicle.</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3>Quick Sales</h3>
                            <p>Sell your car in as little as 7 days with our streamlined process.</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure Transactions</h3>
                            <p>All payments are processed securely with buyer verification and fraud protection.</p>
                        </div>
                    </div>

                    {/* Listing Form */}
                    <div className="listing-form-container">
                        <div className="form-card">
                            <div className="form-header">
                                <h2>List Your Vehicle</h2>
                                <p>
                                    Fill out the form below to create your listing. Our team will review and approve it
                                    within 24 hours.
                                </p>
                            </div>

                            <form className="listing-form" onSubmit={handleSubmit}>
                                {/* Listing Type */}
                                <div className="form-section">
                                    <label className="section-label">Listing Type</label>
                                    <div className="listing-type-options">
                                        <div
                                            className={`option-card ${listingType === 'auction' ? 'active' : ''}`}
                                            onClick={() => handleListingTypeChange('auction')}
                                        >
                                            <input
                                                type="radio"
                                                name="listingType"
                                                value="auction"
                                                checked={listingType === 'auction'}
                                                readOnly
                                            />
                                            <div className="option-content">
                                                <h4>Auction Listing</h4>
                                                <p>Let buyers bid on your vehicle</p>
                                            </div>
                                        </div>
                                        <div
                                            className={`option-card ${listingType === 'fixed' ? 'active' : ''}`}
                                            onClick={() => handleListingTypeChange('fixed')}
                                        >
                                            <input
                                                type="radio"
                                                name="listingType"
                                                value="fixed"
                                                checked={listingType === 'fixed'}
                                                readOnly
                                            />
                                            <div className="option-content">
                                                <h4>Fixed Price</h4>
                                                <p>Set a fixed price for immediate sale</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Information */}
                                <div className="form-section">
                                    <label className="section-label">Vehicle Information</label>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Make</label>
                                            <select
                                                name="make"
                                                className="form-select"
                                                value={formData.make}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select make</option>
                                                <option value="bmw">BMW</option>
                                                <option value="porsche">Porsche</option>
                                                <option value="tesla">Tesla</option>
                                                <option value="lamborghini">Lamborghini</option>
                                                <option value="mercedes">Mercedes-Benz</option>
                                                <option value="audi">Audi</option>
                                                <option value="ford">Ford</option>
                                                <option value="chevrolet">Chevrolet</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Model</label>
                                            <input
                                                type="text"
                                                name="model"
                                                className="form-input"
                                                placeholder="Enter model"
                                                value={formData.model}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Year</label>
                                            <select
                                                name="year"
                                                className="form-select"
                                                value={formData.year}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select year</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Mileage</label>
                                            <input
                                                type="number"
                                                name="mileage"
                                                className="form-input"
                                                placeholder="Enter mileage"
                                                value={formData.mileage}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>VIN</label>
                                            <input
                                                type="text"
                                                name="vin"
                                                className="form-input"
                                                placeholder="Enter VIN number"
                                                value={formData.vin}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Body Type</label>
                                            <select
                                                name="bodyType"
                                                className="form-select"
                                                value={formData.bodyType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select body type</option>
                                                <option value="sedan">Sedan</option>
                                                <option value="coupe">Coupe</option>
                                                <option value="suv">SUV</option>
                                                <option value="convertible">Convertible</option>
                                                <option value="hatchback">Hatchback</option>
                                                <option value="truck">Truck</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="form-section">
                                    <label className="section-label">Pricing</label>
                                    <div className="pricing-options">
                                        {listingType === 'auction' && (
                                            <div className="form-grid auction-pricing">
                                                <div className="form-group">
                                                    <label>Starting Bid</label>
                                                    <input
                                                        type="number"
                                                        name="startingBid"
                                                        className="form-input"
                                                        placeholder="$0"
                                                        value={formData.startingBid}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Reserve Price (Optional)</label>
                                                    <input
                                                        type="number"
                                                        name="reservePrice"
                                                        className="form-input"
                                                        placeholder="$0"
                                                        value={formData.reservePrice}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {listingType === 'fixed' && (
                                            <div className="form-grid fixed-pricing">
                                                <div className="form-group">
                                                    <label>Asking Price</label>
                                                    <input
                                                        type="number"
                                                        name="askingPrice"
                                                        className="form-input"
                                                        placeholder="$0"
                                                        value={formData.askingPrice}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-section">
                                    <label className="section-label">Description</label>
                                    <div className="form-group">
                                        <textarea
                                            name="description"
                                            className="form-textarea"
                                            rows="6"
                                            placeholder="Describe your vehicle's condition, features, maintenance history, and any other relevant details..."
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Photos */}
                                <div className="form-section">
                                    <label className="section-label">Photos</label>
                                    <div className="photo-upload">
                                        <div className="upload-area">
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <h4>Upload Photos</h4>
                                            <p>
                                                Add up to 20 high-quality photos of your vehicle. Include exterior,
                                                interior, and engine bay shots.
                                            </p>
                                            <button type="button" className="btn btn-outline">
                                                <i className="fas fa-camera"></i>
                                                Choose Files
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="form-section">
                                    <label className="section-label">Location</label>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                className="form-input"
                                                placeholder="Enter city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <select
                                                name="state"
                                                className="form-select"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select state</option>
                                                <option value="ca">California</option>
                                                <option value="ny">New York</option>
                                                <option value="tx">Texas</option>
                                                <option value="fl">Florida</option>
                                                <option value="il">Illinois</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="form-section">
                                    <div className="terms-checkbox">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            name="termsAccepted"
                                            className="checkbox"
                                            checked={formData.termsAccepted}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="terms">
                                            I agree to the <a href="#terms">Terms of Service</a> and{' '}
                                            <a href="#privacy">Privacy Policy</a>. I confirm that I am the legal owner
                                            of this vehicle and have the right to sell it.
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary btn-large">
                                        Create Listing
                                    </button>
                                    {/* Add routing logic here */}
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-large"
                                        onClick={() => navigate('/drafts')} // Navigate to drafts page
                                    >
                                        Save as Draft
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellVehicle;
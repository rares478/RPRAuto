import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/styles.css';
import './styles/sell.css';

// function handlers
import { submitListing } from '../functionality/sellFun';

const SellVehicle = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1960; year--) {
        years.push(year);
    }

    const [listingType, setListingType] = useState('auction');
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        vin: '',
        bodyType: '',
        startBid: '',
        reservePrice: '',
        askingPrice: '',
        description: '',
        city: '',
        state: '',
        agreeTerms: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleListingTypeChange = (type) => {
        setListingType(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreeTerms) {
            alert('Please accept the terms and conditions.');
            return;
        }

        const success = await submitListing(formData);
        if (success) {
            alert('Listing created successfully!');
            // navigate('/confirmation'); // Uncomment and update to your route
        } else {
            alert('There was a problem creating your listing.');
        }
    };

    return (
        <div className="sell-container">
            <div className="container">
                <div className="sell-header">
                    <h1>Sell Your Vehicle</h1>
                    <p>
                        Reach thousands of qualified buyers and get the best price
                        for your car through our auction platform or direct sales.
                    </p>
                </div>

                <div className="benefits-section">
                    <div className="benefit-item">
                        <div className="benefit-icon"><i className="fas fa-dollar-sign"></i></div>
                        <h3>Maximum Value</h3>
                        <p>Our auction format ensures you get the highest possible price.</p>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon"><i className="fas fa-clock"></i></div>
                        <h3>Quick Sales</h3>
                        <p>Sell your car in as little as 7 days.</p>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon"><i className="fas fa-shield-alt"></i></div>
                        <h3>Secure Transactions</h3>
                        <p>Secure payment processing with fraud protection.</p>
                    </div>
                </div>

                <div className="listing-form-container">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>List Your Vehicle</h2>
                            <p>Our team will review and approve it within 24 hours.</p>
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
                                        <input type="radio" name="listingType" value="auction" checked={listingType === 'auction'} readOnly />
                                        <div className="option-content">
                                            <h4>Auction Listing</h4>
                                            <p>Let buyers bid on your vehicle</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`option-card ${listingType === 'fixed' ? 'active' : ''}`}
                                        onClick={() => handleListingTypeChange('fixed')}
                                    >
                                        <input type="radio" name="listingType" value="fixed" checked={listingType === 'fixed'} readOnly />
                                        <div className="option-content">
                                            <h4>Fixed Price</h4>
                                            <p>Set a fixed price for immediate sale</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="form-section">
                                <label className="section-label">Vehicle Information</label>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Make</label>
                                        <select className="form-select" name="make" onChange={handleInputChange}>
                                            <option value="">Select make</option>
                                            {['BMW', 'Porsche', 'Tesla', 'Lamborghini', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet'].map(make => (
                                                <option key={make} value={make.toLowerCase()}>{make}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Model</label>
                                        <input type="text" name="model" className="form-input" onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Year</label>
                                        <select className="form-select" name="year" onChange={handleInputChange}>
                                            <option value="">Select year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Mileage</label>
                                        <input type="number" name="mileage" className="form-input" onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>VIN</label>
                                        <input type="text" name="vin" className="form-input" onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Body Type</label>
                                        <select className="form-select" name="bodyType" onChange={handleInputChange}>
                                            <option value="">Select body type</option>
                                            {['Sedan', 'Coupe', 'SUV', 'Convertible', 'Hatchback', 'Truck'].map(type => (
                                                <option key={type} value={type.toLowerCase()}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="form-section">
                                <label className="section-label">Pricing</label>
                                {listingType === 'auction' ? (
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Starting Bid</label>
                                            <input type="number" name="startBid" className="form-input" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Reserve Price (Optional)</label>
                                            <input type="number" name="reservePrice" className="form-input" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Asking Price</label>
                                            <input type="number" name="askingPrice" className="form-input" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="form-section">
                                <label className="section-label">Description</label>
                                <div className="form-group">
                                    <textarea
                                        className="form-textarea"
                                        name="description"
                                        rows="6"
                                        placeholder="Describe your vehicle..."
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Photos Upload */}
                            <div className="form-section">
                                <label className="section-label">Photos</label>
                                <div className="photo-upload">
                                    <div className="upload-area" onClick={() => alert('Upload functionality coming soon!')}>
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <h4>Upload Photos</h4>
                                        <p>Add up to 20 high-quality photos.</p>
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
                                        <input type="text" name="city" className="form-input" onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <select className="form-select" name="state" onChange={handleInputChange}>
                                            <option value="">Select state</option>
                                            {['CA', 'NY', 'TX', 'FL', 'IL'].map(state => (
                                                <option key={state} value={state.toLowerCase()}>{state}</option>
                                            ))}
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
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="terms">
                                        I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
                                    </label>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary btn-large">
                                    Create Listing
                                </button>
                                {/* Use navigate('/drafts') here */}
                                <button
                                    type="button"
                                    className="btn btn-outline btn-large"
                                    onClick={() => {
                                        // navigate('/drafts'); // Uncomment and replace with your draft route
                                        alert('Draft saved!');
                                    }}
                                >
                                    Save as Draft
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellVehicle;

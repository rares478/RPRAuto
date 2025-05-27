import React, { useState } from 'react';
import './styles/sell.css';
import Cookies from 'js-cookie';

const SellForm = () => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        price: '',
        listingType: '',
        color: '',
        gearbox: '',
        fuelType: '',
        bodyType: '',
        engine: '',
        description: '',
        contactName: 'John Doe',
        phone: '+1 (555) 123-4567',
        location: '',
        endDate: '',
        minBid: '',
        instantBuy: '',
        imageUrls: ''
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    const addImageUrl = () => {
        if (!formData.imageUrls.trim()) return;
        
        const urls = formData.imageUrls.split(',').map(url => url.trim()).filter(url => url);
        const newPreviews = urls.map(url => ({
            id: Math.random().toString(36).substr(2, 9),
            url: url
        }));
        
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({ ...prev, imageUrls: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('Please log in to create a listing');
                return;
            }

            // Validate required fields
            if (!formData.make || !formData.model || !formData.year || !formData.mileage || !formData.price || !formData.listingType || !formData.description) {
                setError('Please fill in all required fields');
                return;
            }

            // Convert form data to match server model
            const carData = {
                Make: formData.make,
                Model: formData.model,
                Year: parseInt(formData.year),
                Mileage: parseInt(formData.mileage),
                Color: formData.color,
                GearboxType: formData.gearbox,
                FuelType: formData.fuelType.toUpperCase(),
                BodyType: formData.bodyType.toUpperCase(),
                EngineSize: formData.engine ? parseFloat(formData.engine) : 0,
                HorsePower: formData.engine ? parseInt(formData.engine.split('L')[0]) * 100 : 0,
                Pictures: imagePreviews.map(preview => preview.url)
            };

            if (formData.listingType === 'buy-now') {
                // Create regular listing
                const listingData = {
                    request: {
                        Car: carData,
                        Price: parseFloat(formData.price),
                        Description: formData.description
                    }
                };

                console.log('Sending listing data:', listingData); // Debug log

                const listingResponse = await fetch('https://rprauto.onrender.com/listing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.trim()}`
                    },
                    body: JSON.stringify(listingData)
                });

                if (!listingResponse.ok) {
                    const errorData = await listingResponse.json();
                    throw new Error(errorData.message || 'Failed to create listing');
                }
            }

            if (formData.listingType === 'auction') {
                if (!formData.minBid || !formData.instantBuy || !formData.endDate) {
                    setError('Please fill in all auction fields');
                    return;
                }

                // Create bid
                const bidData = {
                    Title: `${formData.make} ${formData.model} ${formData.year}`,
                    TopBid: parseFloat(formData.price),
                    MinBid: parseFloat(formData.minBid),
                    InstantBuy: parseFloat(formData.instantBuy),
                    Car: {
                        Make: carData.Make,
                        Model: carData.Model,
                        Year: carData.Year,
                        Mileage: carData.Mileage,
                        Color: carData.Color,
                        GearboxType: carData.GearboxType,
                        FuelType: carData.FuelType,
                        BodyType: carData.BodyType,
                        EngineSize: carData.EngineSize || 0,
                        HorsePower: carData.HorsePower || 0,
                        Pictures: carData.Pictures
                    },
                    EndAt: new Date(formData.endDate).toISOString(),
                    Description: formData.description
                };

                const bidResponse = await fetch('https://rprauto.onrender.com/bid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.trim()}`
                    },
                    body: JSON.stringify(bidData)
                });

                if (!bidResponse.ok) {
                    const errorData = await bidResponse.json();
                    throw new Error(errorData.message || 'Failed to create auction');
                }
            }

            setSuccess('Your listing has been created successfully!');
            clearForm();
        } catch (error) {
            setError(error.message || 'An error occurred while creating the listing');
        }
    };

    const clearForm = () => {
        setFormData({
            make: '',
            model: '',
            year: '',
            mileage: '',
            price: '',
            listingType: '',
            color: '',
            gearbox: '',
            fuelType: '',
            bodyType: '',
            engine: '',
            description: '',
            contactName: 'John Doe',
            phone: '+1 (555) 123-4567',
            location: '',
            endDate: '',
            minBid: '',
            instantBuy: '',
            imageUrls: ''
        });
        setImagePreviews([]);
        setError('');
        setSuccess('');
    };

    return (
        <form className="sell-form" onSubmit={handleSubmit}>
            <h3><i className="fas fa-car"></i> Vehicle Information</h3>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Make *</label>
                    <select 
                        className="form-input" 
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        required
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
                        <option value="toyota">Toyota</option>
                        <option value="honda">Honda</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Model *</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="e.g., M4 Competition" 
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Year *</label>
                    <select 
                        className="form-input" 
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select year</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                        <option value="2018">2018</option>
                        <option value="2017">2017</option>
                        <option value="2016">2016</option>
                        <option value="2015">2015</option>
                        <option value="older">Older</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Mileage *</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        placeholder="e.g., 25000" 
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Price *</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 75000" 
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Listing Type *</label>
                    <select 
                        className="form-input" 
                        name="listingType"
                        value={formData.listingType}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select type</option>
                        <option value="buy-now">Buy Now</option>
                        <option value="auction">Auction</option>
                    </select>
                </div>
            </div>

            {(formData.listingType === 'auction') && (
                <>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Minimum Bid *</label>
                            <input 
                                type="number" 
                                className="form-input" 
                                name="minBid"
                                value={formData.minBid}
                                onChange={handleInputChange}
                                placeholder="e.g., 50000" 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Instant Buy Price *</label>
                            <input 
                                type="number" 
                                className="form-input" 
                                name="instantBuy"
                                value={formData.instantBuy}
                                onChange={handleInputChange}
                                placeholder="e.g., 80000" 
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Auction End Date *</label>
                            <input 
                                type="datetime-local" 
                                className="form-input" 
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Color</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="e.g., Alpine White"
                    />
                </div>
                <div className="form-group">
                    <label>Gearbox</label>
                    <select 
                        className="form-input"
                        name="gearbox"
                        value={formData.gearbox}
                        onChange={handleInputChange}
                    >
                        <option value="">Select gearbox</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Any">Any</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Fuel Type</label>
                    <select 
                        className="form-input"
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleInputChange}
                    >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Body Type</label>
                    <select 
                        className="form-input"
                        name="bodyType"
                        value={formData.bodyType}
                        onChange={handleInputChange}
                    >
                        <option value="">Select body type</option>
                        <option value="Any">Any</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="SUV">SUV</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Van">Van</option>
                        <option value="Wagon">Wagon</option>
                    </select>
                </div>
            </div>

            <div className="form-row full">
                <div className="form-group">
                    <label>Engine</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        name="engine"
                        value={formData.engine}
                        onChange={handleInputChange}
                        placeholder="e.g., 3.0L Twin-Turbo I6"
                    />
                </div>
            </div>

            <div className="form-row full">
                <div className="form-group">
                    <label>Description *</label>
                    <textarea 
                        className="form-input" 
                        rows="4" 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your vehicle's condition, features, and any additional information..." 
                        required
                    ></textarea>
                </div>
            </div>

            <h3 style={{ marginTop: '32px', marginBottom: '16px' }}><i className="fas fa-camera"></i> Photos</h3>
            
            <div className="image-upload" onClick={() => document.getElementById('imageInput').click()}>
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Click to upload photos</p>
                <small>Upload up to 20 photos (JPG, PNG, max 5MB each)</small>
                <input 
                    type="file" 
                    id="imageInput" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                />
            </div>

            <div className="form-row full">
                <div className="form-group">
                    <label>Or add image URLs</label>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input 
                            type="text" 
                            className="form-input" 
                            name="imageUrls"
                            value={formData.imageUrls}
                            onChange={handleInputChange}
                            placeholder="Enter image URLs separated by commas"
                            style={{ flex: 1 }}
                        />
                        <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={addImageUrl}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Add URLs
                        </button>
                    </div>
                    <small>Enter multiple URLs separated by commas</small>
                </div>
            </div>

            <div className="image-preview">
                {imagePreviews.map(preview => (
                    <div key={preview.id} className="preview-item">
                        <img src={preview.url} alt="Preview" />
                        <button 
                            type="button" 
                            className="preview-remove"
                            onClick={() => removeImage(preview.id)}
                        >×</button>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: '32px', marginBottom: '16px' }}><i className="fas fa-user"></i> Contact Information</h3>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Contact Name *</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                        type="tel" 
                        className="form-input" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row full">
                <div className="form-group">
                    <label>Location *</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State" 
                        required
                    />
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <button type="submit" className="btn btn-primary" style={{ marginRight: '12px' }}>
                    <i className="fas fa-plus"></i>
                    List My Vehicle
                </button>
                <button type="button" className="btn btn-outline" onClick={clearForm}>
                    <i className="fas fa-times"></i>
                    Clear Form
                </button>
            </div>
        </form>
    );
};

export default SellForm; 
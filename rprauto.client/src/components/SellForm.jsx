import React, { useState } from 'react';
import './styles/sell.css';

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
        location: ''
    });

    const [imagePreviews, setImagePreviews] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
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
            location: ''
        });
        setImagePreviews([]);
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
                        <option value="both">Both</option>
                    </select>
                </div>
            </div>

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
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                        <option value="semi-automatic">Semi-Automatic</option>
                        <option value="cvt">CVT</option>
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
                        <option value="gasoline">Gasoline</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="diesel">Diesel</option>
                        <option value="plug-in-hybrid">Plug-in Hybrid</option>
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
                        <option value="sedan">Sedan</option>
                        <option value="coupe">Coupe</option>
                        <option value="suv">SUV</option>
                        <option value="convertible">Convertible</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="wagon">Wagon</option>
                        <option value="truck">Truck</option>
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
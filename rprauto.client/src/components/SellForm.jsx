import React, { useState } from 'react';
import './styles/sell.css';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { makes, gearboxOptions, fuelOptions, getModelsForMake } from './data/carOptions';

const years = Array.from({length: 15}, (_, i) => {
    const y = (2010 + i).toString();
    return { value: y, label: y };
});
const bodyTypeOptions = [
    { value: '', label: 'Select Body Type' },
    { value: 'Any', label: 'Any' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Convertible', label: 'Convertible' },
    { value: 'Pickup', label: 'Pickup' },
    { value: 'Van', label: 'Van' },
    { value: 'Wagon', label: 'Wagon' }
];

const SellForm = () => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        price: '',
        listingType: '',
        color: '',
        gearboxType: '',
        fuelType: '',
        bodyType: '',
        engineSize: '',
        horsePower: '',
        description: '',
        doors: 4,
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
            if (
                !formData.make ||
                !formData.model ||
                !formData.year ||
                !formData.mileage ||
                !formData.listingType ||
                !formData.description ||
                (formData.listingType === 'buy-now' && !formData.price)
            ) {
                setError('Please fill in all required fields');
                return;
            }

            // Convert form data to match server model
            const carData = {
                Make: formData.make,
                Model: formData.model,
                Year: parseInt(formData.year),
                Mileage: parseInt(formData.mileage),
                Color: formData.color || '',
                GearboxType: formData.gearboxType || 'Any',
                FuelType: formData.fuelType || 'Petrol',
                BodyType: formData.bodyType || 'Any',
                EngineSize: formData.engineSize ? parseFloat(formData.engineSize) : 0,
                HorsePower: formData.horsePower ? parseInt(formData.horsePower) : 0,
                Pictures: imagePreviews.map(preview => preview.url),
                Doors: formData.doors,
                Description: formData.description
            };

            if (formData.listingType === 'buy-now') {
                // Create regular listing
                const listingData = {
                    car: carData,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    endAt: new Date().toISOString()
                };

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
                    TopBid: 0,
                    MinBid: parseInt(formData.minBid, 10),
                    InstantBuy: parseInt(formData.instantBuy, 10),
                    Car: carData,
                    EndAt: new Date(formData.endDate).toISOString(),
                    Description: formData.description
                };

                const payload = { request: bidData };

                const bidResponse = await fetch('https://rprauto.onrender.com/bid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.trim()}`
                    },
                    body: JSON.stringify(payload)
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
            gearboxType: '',
            fuelType: '',
            bodyType: '',
            engineSize: '',
            horsePower: '',
            description: '',
            doors: 4,
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

    // Add darkInputStyle for inputs, matching Auction
    const darkInputStyle = {
        background: '#181828',
        border: '1.5px solid #23233a',
        borderRadius: 8,
        color: '#fff',
        fontSize: '0.95rem',
        padding: '6px 10px',
        minHeight: '50px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border 0.2s, box-shadow 0.2s',
    };

    return (
        <form className="sell-form" onSubmit={handleSubmit}>
            <h3><i className="fas fa-car"></i> Vehicle Information</h3>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Make *</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={makes.map(make => ({ value: make, label: make }))}
                        value={formData.make ? { value: formData.make, label: formData.make } : null}
                        onChange={option => setFormData(prev => ({ ...prev, make: option?.value, model: '' }))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Model *</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={formData.make ? getModelsForMake(formData.make).map(model => ({ value: model, label: model })) : []}
                        value={formData.model ? { value: formData.model, label: formData.model } : null}
                        onChange={option => setFormData(prev => ({ ...prev, model: option?.value }))}
                        required
                        isDisabled={!formData.make}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Year *</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={years}
                        value={formData.year ? { value: formData.year, label: formData.year } : null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({ ...prev, year: selectedOption?.value }));
                        }}
                        required
                    />
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
                        style={darkInputStyle}
                    />
                </div>
            </div>

            <div className="form-row">
                {formData.listingType !== 'auction' && (
                    <div className="form-group">
                        <label>Price *</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="e.g., 75000" 
                            required={formData.listingType === 'buy-now'}
                            style={darkInputStyle}
                        />
                    </div>
                )}
                <div className="form-group">
                    <label>Listing Type *</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={[
                            { value: '', label: 'Select type' },
                            { value: 'buy-now', label: 'Buy Now' },
                            { value: 'auction', label: 'Auction' }
                        ]}
                        value={formData.listingType ? { value: formData.listingType, label: formData.listingType } : null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({ ...prev, listingType: selectedOption?.value }));
                        }}
                        required
                    />
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
                                style={darkInputStyle}
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
                                style={darkInputStyle}
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
                                style={darkInputStyle}
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
                        style={darkInputStyle}
                    />
                </div>
                <div className="form-group">
                    <label>Gearbox</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={gearboxOptions}
                        value={formData.gearboxType ? { value: formData.gearboxType, label: formData.gearboxType } : null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({ ...prev, gearboxType: selectedOption?.value }));
                        }}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Fuel Type</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={fuelOptions}
                        value={formData.fuelType ? { value: formData.fuelType, label: formData.fuelType } : null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({ ...prev, fuelType: selectedOption?.value }));
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>Body Type</label>
                    <Select
                        className="react-select"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                background: '#181828',
                                border: '1.5px solid #23233a',
                                borderRadius: 8,
                                minHeight: 44,
                                fontSize: '1.1rem',
                                color: '#fff',
                                boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                            }),
                            valueContainer: base => ({
                                ...base,
                                color: '#fff',
                                padding: '8px 12px',
                                background: '#181828',
                            }),
                            placeholder: base => ({
                                ...base,
                                color: '#bdbdf7',
                                fontSize: '1.1rem',
                            }),
                            singleValue: base => ({
                                ...base,
                                color: '#fff',
                                fontSize: '1.1rem',
                            }),
                            indicatorSeparator: base => ({
                                ...base,
                                background: '#23233a',
                            }),
                            dropdownIndicator: base => ({
                                ...base,
                                color: '#A8A1F8',
                                transition: 'color 0.2s',
                            }),
                            menu: base => ({
                                ...base,
                                background: '#181828',
                                color: '#fff',
                                borderRadius: 8,
                                border: '1.5px solid #23233a',
                                zIndex: 2147483647,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isSelected
                                    ? 'linear-gradient(90deg, #695FD6 60%, #A8A1F8 100%)'
                                    : state.isFocused
                                    ? '#23233a'
                                    : 'transparent',
                                color: state.isSelected ? '#fff' : state.isFocused ? '#A8A1F8' : '#bdbdf7',
                                fontSize: '1.08rem',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }),
                            menuList: base => ({
                                ...base,
                                maxHeight: 220,
                                overflowY: 'auto',
                                background: '#181828',
                            }),
                        }}
                        menuPortalTarget={document.body}
                        options={bodyTypeOptions}
                        value={formData.bodyType ? { value: formData.bodyType, label: formData.bodyType } : null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({ ...prev, bodyType: selectedOption?.value }));
                        }}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Engine Size</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        name="engineSize"
                        value={formData.engineSize}
                        onChange={handleInputChange}
                        placeholder="e.g., 3.0"
                        step="0.1"
                        min="0"
                        style={darkInputStyle}
                    />
                </div>
                <div className="form-group">
                    <label>Horsepower</label>
                    <input 
                        type="number" 
                        className="form-input" 
                        name="horsePower"
                        value={formData.horsePower}
                        onChange={handleInputChange}
                        placeholder="e.g., 300"
                        min="0"
                        style={darkInputStyle}
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
                        style={darkInputStyle}
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
                            style={{ ...darkInputStyle, flex: 1 }}
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
                        style={darkInputStyle}
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
                        style={darkInputStyle}
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
                        style={darkInputStyle}
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
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles/marketplace.css';
import ListingCard from './ListingCard';
import Select from 'react-select';
import { Range } from 'react-range';
import { makes, gearboxOptions, fuelOptions, mileageOptions, getModelsForMake } from './data/carOptions';
const years = Array.from({length: 15}, (_, i) => (2010 + i).toString());

const Market = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    search: '',
    priceMin: 0,
    priceMax: 200000,
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    gearbox: '',
    color: '',
    doors: '',
    fuel: '',
    engineMin: '',
    engineMax: '',
    powerMin: '',
    powerMax: '',
    mileage: ''
  });
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update darkInputStyle for inputs
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
    // Parse query params
    const params = new URLSearchParams(location.search);
    const make = params.get('make') || '';
    const model = params.get('model') || '';
    const year = params.get('year') || '';
    if (make || model || year) {
      setFilters(prev => ({
        ...prev,
        make,
        model,
        yearFrom: year,
        yearTo: year
      }));
      setShouldApplyFilters(true);
    } else {
      fetchCars();
    }
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    if (shouldApplyFilters) {
      applyFilters();
      setShouldApplyFilters(false);
    }
    // eslint-disable-next-line
  }, [shouldApplyFilters, filters]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://rprauto.onrender.com/listing?page=1&pageSize=30');
      const data = await response.json();
      
      const formattedCars = data.Listings.map(listing => ({
        id: listing.Id,
        title: `${listing.Car.Make} ${listing.Car.Model}`,
        year: listing.Car.Year,
        make: listing.Car.Make,
        model: listing.Car.Model,
        gearbox: listing.Car.GearboxType,
        color: listing.Car.Color,
        doors: listing.Car.Doors,
        fuelType: listing.Car.FuelType,
        engine: listing.Car.EngineSize,
        power: listing.Car.HorsePower,
        mileage: listing.Car.Mileage,
        bodyType: listing.Car.BodyType,
        price: listing.Price,
        description: listing.Description,
        images: listing.Car.Pictures || [],
        phone: listing.User?.Personal?.PhoneNumber || "N/A"
      }));

      setCars(formattedCars);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again later.');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (filters.make) queryParams.append('make', filters.make);
      if (filters.model) queryParams.append('model', filters.model);
      if (filters.gearbox) queryParams.append('gearbox', filters.gearbox);
      if (filters.color) queryParams.append('color', filters.color);
      if (filters.doors) queryParams.append('doors', filters.doors);
      if (filters.fuel) queryParams.append('fuel', filters.fuel);
      if (filters.engineMin !== '' && filters.engineMin !== undefined && filters.engineMin !== null) queryParams.append('engineMin', filters.engineMin);
      if (filters.engineMax !== '' && filters.engineMax !== undefined && filters.engineMax !== null) queryParams.append('engineMax', filters.engineMax);
      if (filters.powerMin !== '' && filters.powerMin !== undefined && filters.powerMin !== null) queryParams.append('powerMin', filters.powerMin);
      if (filters.powerMax !== '' && filters.powerMax !== undefined && filters.powerMax !== null) queryParams.append('powerMax', filters.powerMax);
      if (filters.mileage) {
        if (filters.mileage.includes('-')) {
          const [min, max] = filters.mileage.split('-');
          queryParams.append('mileageMin', min);
          queryParams.append('mileageMax', max);
        } else if (filters.mileage.endsWith('+')) {
          const min = filters.mileage.replace('+', '');
          queryParams.append('mileageMin', min);
        }
      }
      if (filters.priceMin !== '' && filters.priceMin !== undefined && filters.priceMin !== null) queryParams.append('priceMin', filters.priceMin);
      if (filters.priceMax !== '' && filters.priceMax !== undefined && filters.priceMax !== null) queryParams.append('priceMax', filters.priceMax);
      if (filters.yearFrom !== '' && filters.yearFrom !== undefined && filters.yearFrom !== null) queryParams.append('yearFrom', filters.yearFrom);
      if (filters.yearTo !== '' && filters.yearTo !== undefined && filters.yearTo !== null) queryParams.append('yearTo', filters.yearTo);
      
      const response = await fetch(`https://rprauto.onrender.com/listing/search?${queryParams.toString()}`);
      const data = await response.json();
      
      const formattedCars = data.map(listing => ({
        id: listing._id,
        title: `${listing.Car.Make} ${listing.Car.Model}`,
        year: listing.Car.Year,
        make: listing.Car.Make,
        model: listing.Car.Model,
        gearbox: listing.Car.GearboxType,
        color: listing.Car.Color,
        doors: listing.Car.Doors,
        fuelType: listing.Car.FuelType,
        engine: listing.Car.EngineSize,
        power: listing.Car.HorsePower,
        mileage: listing.Car.Mileage,
        bodyType: listing.Car.BodyType,
        price: listing.Price,
        description: listing.Description,
        images: listing.Car.Pictures || [],
        phone: listing.User?.Personal?.PhoneNumber || "N/A"
      }));

      setCars(formattedCars);
      setLoading(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to apply filters. Please try again.');
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priceMin: 0,
      priceMax: 200000,
      make: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      gearbox: '',
      color: '',
      doors: '',
      fuel: '',
      engineMin: '',
      engineMax: '',
      powerMin: '',
      powerMax: '',
      mileage: ''
    });
    fetchCars();
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div className="container">
          <div className="loading">Loading cars...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-container">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <div className="container">
        <div className="marketplace-layout">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <h3><i className="fas fa-filter"></i> Advanced Filters</h3>
              </div>
              <div className="filter-content">
                {/* Search */}
                <div className="filter-group">
                  <label>Search</label>
                  <div className="search-input">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      className="filter-input"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Make, model, year..."
                      style={{ ...darkInputStyle, paddingLeft: '48px' }}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="filter-group">
                  <label>Price Range: ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}</label>
                  <div className="price-range" style={{ position: 'relative', height: '40px', background: 'transparent', border: 'none', padding: '32px 0 16px 0' }}>
                    <Range
                      step={1000}
                      min={0}
                      max={500000}
                      values={[filters.priceMin, filters.priceMax]}
                      onChange={([min, max]) => setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }))}
                      renderTrack={({ props, children }) => {
                        const { key, ...rest } = props;
                        return (
                          <div
                            key={key}
                            {...rest}
                            style={{
                              ...rest.style,
                              height: '5px',
                              width: '100%',
                              background: `linear-gradient(to right, #374151 ${((filters.priceMin)/500000)*100}%, #695FD6 ${((filters.priceMin)/500000)*100}%, #695FD6 ${((filters.priceMax)/500000)*100}%, #374151 ${((filters.priceMax)/500000)*100}%)`,
                              borderRadius: '3px',
                              position: 'absolute',
                              top: '50%',
                              left: 0,
                              transform: 'translateY(-50%)',
                              zIndex: 2,
                            }}
                          >
                            {children}
                          </div>
                        );
                      }}
                      renderThumb={({ props, index, isDragged }) => {
                        const { key, ...rest } = props;
                        return (
                          <div
                            key={key}
                            {...rest}
                            style={{
                              ...rest.style,
                              height: '24px',
                              width: '24px',
                              borderRadius: '50%',
                              backgroundColor: isDragged ? '#A8A1F8' : '#695FD6',
                              border: '2px solid #fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isDragged ? '0 0 0 2px #695FD655' : 'none',
                              zIndex: 5,
                            }}
                          >
                            <span style={{
                              position: 'absolute',
                              top: '-28px',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1rem',
                              background: '#23233a',
                              borderRadius: 6,
                              padding: '2px 8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              whiteSpace: 'nowrap',
                            }}>
                              ${[filters.priceMin, filters.priceMax][index].toLocaleString()}
                            </span>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Make */}
                <div className="filter-group">
                  <label>Make</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
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
                    options={makes.map(make => ({ value: make, label: make }))}
                    value={filters.make ? { value: filters.make, label: filters.make } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'make', value: option?.value } })}
                  />
                </div>

                {/* Model */}
                <div className="filter-group">
                  <label>Model</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
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
                    options={filters.make ? getModelsForMake(filters.make).map(model => ({ value: model, label: model })) : []}
                    value={filters.model ? { value: filters.model, label: filters.model } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'model', value: option?.value } })}
                    isDisabled={!filters.make}
                  />
                </div>

                {/* Year */}
                <div className="filter-group">
                  <label>Year</label>
                  <div className="year-inputs">
                    <Select
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          background: '#181828',
                          border: '1.5px solid #23233a',
                          borderRadius: 8,
                          minHeight: 32,
                          fontSize: '0.95rem',
                          color: '#fff',
                          boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                          transition: 'border 0.2s, box-shadow 0.2s',
                        }),
                        valueContainer: base => ({
                          ...base,
                          color: '#fff',
                          padding: '6px 10px',
                          background: '#181828',
                        }),
                        placeholder: base => ({
                          ...base,
                          color: '#bdbdf7',
                          fontSize: '0.95rem',
                        }),
                        singleValue: base => ({
                          ...base,
                          color: '#fff',
                          fontSize: '0.95rem',
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
                          fontSize: '0.95rem',
                          padding: '6px 10px',
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
                      options={years.map(year => ({ value: year, label: year }))}
                      value={filters.yearFrom ? { value: filters.yearFrom, label: filters.yearFrom } : null}
                      onChange={(option) => handleFilterChange({ target: { name: 'yearFrom', value: option?.value } })}
                    />
                    <Select
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          background: '#181828',
                          border: '1.5px solid #23233a',
                          borderRadius: 8,
                          minHeight: 32,
                          fontSize: '0.95rem',
                          color: '#fff',
                          boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                          transition: 'border 0.2s, box-shadow 0.2s',
                        }),
                        valueContainer: base => ({
                          ...base,
                          color: '#fff',
                          padding: '6px 10px',
                          background: '#181828',
                        }),
                        placeholder: base => ({
                          ...base,
                          color: '#bdbdf7',
                          fontSize: '0.95rem',
                        }),
                        singleValue: base => ({
                          ...base,
                          color: '#fff',
                          fontSize: '0.95rem',
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
                          fontSize: '0.95rem',
                          padding: '6px 10px',
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
                      options={years.map(year => ({ value: year, label: year }))}
                      value={filters.yearTo ? { value: filters.yearTo, label: filters.yearTo } : null}
                      onChange={(option) => handleFilterChange({ target: { name: 'yearTo', value: option?.value } })}
                    />
                  </div>
                </div>

                {/* Gearbox */}
                <div className="filter-group">
                  <label>Gearbox</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
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
                    options={gearboxOptions}
                    value={filters.gearbox ? { value: filters.gearbox, label: filters.gearbox } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'gearbox', value: option?.value } })}
                  />
                </div>

                {/* Color */}
                <div className="filter-group">
                  <label>Color</label>
                  <input
                    type="text"
                    className="filter-input"
                    name="color"
                    value={filters.color}
                    onChange={handleFilterChange}
                    placeholder="Enter color"
                    style={darkInputStyle}
                    onFocus={e => { e.target.style.borderColor = '#A8A1F8'; e.target.style.boxShadow = '0 0 0 2px #695FD655'; }}
                    onBlur={e => { e.target.style.borderColor = '#23233a'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Doors */}
                <div className="filter-group">
                  <label>Doors</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
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
                    options={[
                      { value: '', label: 'Select doors' },
                      { value: '2', label: '2 Doors' },
                      { value: '3', label: '3 Doors' },
                      { value: '4', label: '4 Doors' },
                      { value: '5', label: '5 Doors' }
                    ]}
                    value={filters.doors ? { value: filters.doors, label: filters.doors } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'doors', value: option?.value } })}
                  />
                </div>

                {/* Fuel Type */}
                <div className="filter-group">
                  <label>Fuel Type</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
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
                    options={fuelOptions}
                    value={filters.fuel ? { value: filters.fuel, label: filters.fuel } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'fuel', value: option?.value } })}
                  />
                </div>

                {/* Engine Size */}
                <div className="filter-group">
                  <label>Engine Size (L)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="filter-input"
                      name="engineMin"
                      value={filters.engineMin}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      step="0.1"
                      min="0"
                      style={darkInputStyle}
                    />
                    <input
                      type="number"
                      className="filter-input"
                      name="engineMax"
                      value={filters.engineMax}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      step="0.1"
                      min="0"
                      style={darkInputStyle}
                    />
                  </div>
                </div>

                {/* Power */}
                <div className="filter-group">
                  <label>Power (HP)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="filter-input"
                      name="powerMin"
                      value={filters.powerMin}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      min="0"
                      style={darkInputStyle}
                    />
                    <input
                      type="number"
                      className="filter-input"
                      name="powerMax"
                      value={filters.powerMax}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      min="0"
                      style={darkInputStyle}
                    />
                  </div>
                </div>

                {/* Mileage */}
                <div className="filter-group">
                  <label>Mileage (km)</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        background: '#181828',
                        border: '1.5px solid #23233a',
                        borderRadius: 8,
                        minHeight: 32,
                        fontSize: '0.95rem',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 2px #695FD655' : 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }),
                      valueContainer: base => ({
                        ...base,
                        color: '#fff',
                        padding: '6px 10px',
                        background: '#181828',
                      }),
                      placeholder: base => ({
                        ...base,
                        color: '#bdbdf7',
                        fontSize: '0.95rem',
                      }),
                      singleValue: base => ({
                        ...base,
                        color: '#fff',
                        fontSize: '0.95rem',
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
                        fontSize: '0.95rem',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                      }),
                      menuList: base => ({
                        ...base,
                        maxHeight: 150,
                        overflowY: 'auto',
                        background: '#181828',
                      }),
                    }}
                    options={mileageOptions}
                    value={filters.mileage ? { value: filters.mileage, label: filters.mileage } : null}
                    onChange={(option) => handleFilterChange({ target: { name: 'mileage', value: option?.value } })}
                    menuPlacement="bottom"
                  />
                </div>

                <button className="btn btn-primary filter-apply" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button className="btn btn-outline filter-clear" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Header */}
            <div className="marketplace-header">
              <div className="header-info">
                <h1>Marketplace</h1>
                <p>Showing {cars.length} vehicles</p>
              </div>
              <div className="sort-dropdown">
                <select className="filter-select">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="mileage">Lowest Mileage</option>
                  <option value="year">Newest Year</option>
                  <option value="power">Highest Power</option>
                </select>
              </div>
            </div>

            {/* Car Grid */}
            <div className="cars-grid">
              {cars.map(car => (
                <ListingCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="btn btn-outline" disabled>Previous</button>
              <button className="btn btn-primary">1</button>
              <button className="btn btn-outline">2</button>
              <button className="btn btn-outline">3</button>
              <button className="btn btn-outline">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market; 
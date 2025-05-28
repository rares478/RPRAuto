import React, { useState, useEffect } from 'react';
import './styles/auction.css';
import AuctionCard from './AuctionCard';
import Select from 'react-select';
import { Range } from 'react-range';
import { makes, gearboxOptions, fuelOptions, mileageOptions, endingInOptions, getModelsForMake } from './data/carOptions';

const years = Array.from({length: 15}, (_, i) => (2010 + i).toString());

const Auction = () => {
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
    mileage: '',
    endingIn: ''
  });

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add darkInputStyle for inputs
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

  // Define selectStyles for react-select, copied from Market.jsx
  const selectStyles = {
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
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async (queryParams = new URLSearchParams(), isSearch = false) => {
    try {
      setLoading(true);
      const endpoint = isSearch ? 'https://rprauto.onrender.com/bid/search' : `https://rprauto.onrender.com/bid?${queryParams.toString()}`;
      const response = await fetch(isSearch ? `${endpoint}?${queryParams.toString()}` : endpoint);
      const data = await response.json();
      
      const bidsArray = Array.isArray(data) ? data : (data.Bids || []);
      const formattedBids = bidsArray.map(bid => ({
        id: bid.Id,
        title: bid.Title || `${bid.Car.Make} ${bid.Car.Model}`,
        year: bid.Car.Year,
        make: bid.Car.Make,
        model: bid.Car.Model,
        gearbox: bid.Car.GearboxType,
        color: bid.Car.Color,
        doors: bid.Car.Doors,
        fuelType: bid.Car.FuelType,
        engine: bid.Car.EngineSize,
        power: bid.Car.HorsePower,
        mileage: bid.Car.Mileage,
        bodyType: bid.Car.BodyType,
        currentBid: bid.TopBid,
        minBid: bid.MinBid,
        instantBuy: bid.InstantBuy,
        endTime: bid.EndAt,
        description: bid.Car.Description,
        images: bid.Car.Pictures || [],
        seller: {
          id: bid.UserId,
          name: 'Seller' // TODO: Fetch seller name from user service
        },
        bidHistory: Object.entries(bid.Bids || {}).map(([userId, amount]) => ({
          bidder: {
            id: userId,
            name: 'Bidder' // TODO: Fetch bidder name from user service
          },
          amount: amount,
          time: new Date().toISOString() // TODO: Add timestamp to bid history
        }))
      }));

      setBids(formattedBids);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError('Failed to load bids. Please try again later.');
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

  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    
    if (filters.make) queryParams.append('make', filters.make.toLowerCase());
    if (filters.model) queryParams.append('model', filters.model.toLowerCase());
    if (filters.priceMin !== '' && filters.priceMin !== undefined && filters.priceMin !== null) queryParams.append('priceMin', filters.priceMin);
    if (filters.priceMax !== '' && filters.priceMax !== undefined && filters.priceMax !== null) queryParams.append('priceMax', filters.priceMax);
    if (filters.yearFrom !== '' && filters.yearFrom !== undefined && filters.yearFrom !== null) queryParams.append('yearFrom', filters.yearFrom);
    if (filters.yearTo !== '' && filters.yearTo !== undefined && filters.yearTo !== null) queryParams.append('yearTo', filters.yearTo);
    if (filters.gearbox && filters.gearbox !== 'Any') queryParams.append('gearbox', filters.gearbox);
    if (filters.color) queryParams.append('color', filters.color.toLowerCase());
    if (filters.doors) queryParams.append('doors', filters.doors);
    if (filters.fuel && filters.fuel !== 'Any') queryParams.append('fuel', filters.fuel);
    if (filters.engineMin !== '' && filters.engineMin !== undefined && filters.engineMin !== null) queryParams.append('engineMin', filters.engineMin);
    if (filters.engineMax !== '' && filters.engineMax !== undefined && filters.engineMax !== null) queryParams.append('engineMax', filters.engineMax);
    if (filters.powerMin !== '' && filters.powerMin !== undefined && filters.powerMin !== null) queryParams.append('powerMin', filters.powerMin);
    if (filters.powerMax !== '' && filters.powerMax !== undefined && filters.powerMax !== null) queryParams.append('powerMax', filters.powerMax);
    // Handle mileage range (km)
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
    if (filters.endingIn && filters.endingIn !== 'any') queryParams.append('endingIn', filters.endingIn);
    fetchBids(queryParams, true);
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
      mileage: '',
      endingIn: ''
    });
    fetchBids();
  };

  if (loading) {
    return (
      <div className="auction-container">
        <div className="container">
          <div className="loading">Loading bids...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auction-container">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auction-container">
      <div className="container">
        <div className="auction-layout">
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
                      onFocus={e => { e.target.style.borderColor = '#A8A1F8'; e.target.style.boxShadow = '0 0 0 2px #695FD655'; }}
                      onBlur={e => { e.target.style.borderColor = '#23233a'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="filter-group">
                  <label>Price Range: ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}</label>
                  <div className="price-range">
                    <Range
                      step={1000}
                      min={0}
                      max={500000}
                      values={[filters.priceMin, filters.priceMax]}
                      onChange={([min, max]) => setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }))}
                      renderTrack={({ props, children }) => {
                        const { key, ...restProps } = props;
                        return (
                          <div
                            {...restProps}
                            style={{
                              ...props.style,
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
                            {React.Children.map(children, (child, idx) =>
                              React.isValidElement(child)
                                ? React.cloneElement(child, { key: idx })
                                : child
                            )}
                          </div>
                        );
                      }}
                      renderThumb={({ props, index, isDragged }) => {
                        const { key, ...restProps } = props;
                        return (
                          <div
                            key={index}
                            {...restProps}
                            style={{
                              ...props.style,
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
                    styles={selectStyles}
                    options={makes.map(make => ({ value: make, label: make }))}
                    value={filters.make ? { value: filters.make, label: filters.make } : null}
                    onChange={option => setFilters({ ...filters, make: option?.value, model: '' })}
                  />
                </div>

                {/* Model */}
                <div className="filter-group">
                  <label>Model</label>
                  <Select
                    classNamePrefix="react-select"
                    styles={selectStyles}
                    options={filters.make ? getModelsForMake(filters.make).map(model => ({ value: model, label: model })) : []}
                    value={filters.model ? { value: filters.model, label: filters.model } : null}
                    onChange={(option) => setFilters({ ...filters, model: option?.value })}
                    isDisabled={!filters.make}
                  />
                </div>

                {/* Year Range */}
                <div className="filter-group">
                  <label>Year Range</label>
                  <div className="year-range">
                    <Select
                      options={years.map(year => ({ value: year, label: year }))}
                      value={filters.yearFrom}
                      onChange={(selectedOption) => setFilters({ ...filters, yearFrom: selectedOption.value })}
                      styles={selectStyles}
                    />
                    <Select
                      options={years.map(year => ({ value: year, label: year }))}
                      value={filters.yearTo}
                      onChange={(selectedOption) => setFilters({ ...filters, yearTo: selectedOption.value })}
                      styles={selectStyles}
                    />
                  </div>
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
                    options={mileageOptions}
                    value={filters.mileage}
                    onChange={(selectedOption) => setFilters({ ...filters, mileage: selectedOption.value })}
                    styles={selectStyles}
                  />
                </div>

                {/* Additional filters */}
                <div className="filter-group">
                  <label>Gearbox</label>
                  <Select
                    options={gearboxOptions}
                    value={filters.gearbox}
                    onChange={(selectedOption) => setFilters({ ...filters, gearbox: selectedOption.value })}
                    styles={selectStyles}
                  />
                </div>

                <div className="filter-group">
                  <label>Fuel Type</label>
                  <Select
                    options={fuelOptions}
                    value={filters.fuel}
                    onChange={(selectedOption) => setFilters({ ...filters, fuel: selectedOption.value })}
                    styles={selectStyles}
                  />
                </div>

                {/* Ending In */}
                <div className="filter-group">
                  <label>Ending In</label>
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
                    options={endingInOptions}
                    value={filters.endingIn ? endingInOptions.find(opt => opt.value === filters.endingIn) : null}
                    onChange={(option) => setFilters({ ...filters, endingIn: option?.value })}
                    menuPlacement="bottom"
                  />
                </div>

                <div className="filter-buttons">
                  <button className="apply-filters" onClick={applyFilters}>
                    Apply Filters
                  </button>
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Listings */}
          <div className="auction-listings">
            {bids.map(bid => (
              <AuctionCard
                key={bid.id}
                auction={bid}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction; 
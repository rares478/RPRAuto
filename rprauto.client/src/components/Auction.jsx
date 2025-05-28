import React, { useState, useEffect } from 'react';
import './styles/auction.css';
import AuctionCard from './AuctionCard';

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
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Make, model, year..."
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="filter-group">
                  <label>Price Range: ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}</label>
                  <div className="price-range">
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      value={filters.priceMin}
                      name="priceMin"
                      onChange={handleFilterChange}
                      className="slider"
                    />
                    <input
                      type="range"
                      min={filters.priceMin}
                      max="500000"
                      value={filters.priceMax}
                      name="priceMax"
                      onChange={handleFilterChange}
                      className="slider"
                    />
                  </div>
                </div>

                {/* Make */}
                <div className="filter-group">
                  <label>Make</label>
                  <select
                    className="filter-select"
                    name="make"
                    value={filters.make}
                    onChange={handleFilterChange}
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
                  </select>
                </div>

                {/* Model */}
                <div className="filter-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={filters.model}
                    onChange={handleFilterChange}
                    placeholder="Enter model"
                    className="filter-input"
                  />
                </div>

                {/* Year Range */}
                <div className="filter-group">
                  <label>Year Range</label>
                  <div className="year-range">
                    <input
                      type="number"
                      name="yearFrom"
                      value={filters.yearFrom}
                      onChange={handleFilterChange}
                      placeholder="From"
                      className="filter-input"
                    />
                    <input
                      type="number"
                      name="yearTo"
                      value={filters.yearTo}
                      onChange={handleFilterChange}
                      placeholder="To"
                      className="filter-input"
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
                      style={{ width: '50%' }}
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
                      style={{ width: '50%' }}
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
                      style={{ width: '50%' }}
                    />
                    <input
                      type="number"
                      className="filter-input"
                      name="powerMax"
                      value={filters.powerMax}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      min="0"
                      style={{ width: '50%' }}
                    />
                  </div>
                </div>

                {/* Mileage */}
                <div className="filter-group">
                  <label>Mileage (km)</label>
                  <select
                    className="filter-select"
                    name="mileage"
                    value={filters.mileage}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select mileage</option>
                    <option value="0-10000">0 - 10,000 km</option>
                    <option value="10001-25000">10,001 - 25,000 km</option>
                    <option value="25001-50000">25,001 - 50,000 km</option>
                    <option value="50001-75000">50,001 - 75,000 km</option>
                    <option value="75001-100000">75,001 - 100,000 km</option>
                    <option value="100001+">100,001+ km</option>
                  </select>
                </div>

                {/* Additional filters */}
                <div className="filter-group">
                  <label>Gearbox</label>
                  <select
                    className="filter-select"
                    name="gearbox"
                    value={filters.gearbox}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Fuel Type</label>
                  <select
                    className="filter-select"
                    name="fuel"
                    value={filters.fuel}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Ending In */}
                <div className="filter-group">
                  <label>Ending In</label>
                  <select
                    className="filter-select"
                    name="endingIn"
                    value={filters.endingIn}
                    onChange={handleFilterChange}
                  >
                    <option value="any">Any</option>
                    <option value="1h">1 hour</option>
                    <option value="12h">12 hours</option>
                    <option value="1d">1 day</option>
                    <option value="3d">3 days</option>
                    <option value="1w">1 week</option>
                  </select>
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
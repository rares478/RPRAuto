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
    engine: '',
    power: '',
    mileage: ''
  });

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async (queryParams = new URLSearchParams()) => {
    try {
      setLoading(true);
      const response = await fetch(`https://rprauto.onrender.com/bid?${queryParams.toString()}`);
      const data = await response.json();
      
      const formattedBids = data.Bids.map(bid => ({
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
    if (filters.priceMin) queryParams.append('price', filters.priceMin);
    if (filters.yearFrom) queryParams.append('year', filters.yearFrom);
    if (filters.gearbox !== 'Any') queryParams.append('gearbox', filters.gearbox);
    if (filters.bodyType !== 'Any') queryParams.append('body', filters.bodyType);
    if (filters.color) queryParams.append('color', filters.color.toLowerCase());
    if (filters.doors) queryParams.append('doors', filters.doors);
    if (filters.fuel !== 'Any') queryParams.append('fuel', filters.fuel);
    if (filters.engine) queryParams.append('engine', filters.engine);
    if (filters.power) queryParams.append('power', filters.power);
    if (filters.mileage) queryParams.append('mileage', filters.mileage);

    fetchBids(queryParams);
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
      engine: '',
      power: '',
      mileage: ''
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
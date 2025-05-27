import React, { useState, useEffect } from 'react';
import './styles/marketplace.css';

const Market = () => {
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

  const [cars, setCars] = useState([]);
  const [currentSlides, setCurrentSlides] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [showPhones, setShowPhones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://rprauto.onrender.com/listing?page=1&pageSize=30');
      const data = await response.json();
      
      const formattedCars = data.Listings.map(listing => ({
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
      
      // Initialize current slides for each car
      const initialSlides = {};
      formattedCars.forEach(car => {
        initialSlides[car.id] = 0;
      });
      setCurrentSlides(initialSlides);
      
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
      if (filters.engine) queryParams.append('engine', filters.engine);
      if (filters.power) queryParams.append('power', filters.power);
      if (filters.mileage) queryParams.append('mileage', filters.mileage);
      
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
      engine: '',
      power: '',
      mileage: ''
    });
    fetchCars();
  };

  const changeSlide = (carId, direction, e) => {
    e.stopPropagation();
    setCurrentSlides(prev => {
      const car = cars.find(c => c.id === carId);
      const newSlide = (prev[carId] + direction + car.images.length) % car.images.length;
      return { ...prev, [carId]: newSlide };
    });
  };

  const goToSlide = (carId, slideIndex, e) => {
    e.stopPropagation();
    setCurrentSlides(prev => ({ ...prev, [carId]: slideIndex }));
  };

  const flipCard = (carId, e) => {
    e.stopPropagation();
    setFlippedCards(prev => ({ ...prev, [carId]: !prev[carId] }));
  };

  const showPhoneNumber = (carId, e) => {
    e.stopPropagation();
    setShowPhones(prev => ({ ...prev, [carId]: !prev[carId] }));
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
                  <select
                    className="filter-select"
                    name="model"
                    value={filters.model}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select model</option>
                    <option value="m4">M4</option>
                    <option value="911">911</option>
                    <option value="model-s">Model S</option>
                    <option value="huracan">Huracán</option>
                    <option value="amg-gt">AMG GT</option>
                  </select>
                </div>

                {/* Year */}
                <div className="filter-group">
                  <label>Year</label>
                  <div className="year-inputs">
                    <select
                      className="filter-select"
                      name="yearFrom"
                      value={filters.yearFrom}
                      onChange={handleFilterChange}
                    >
                      <option value="">From</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={2015 + i}>{2015 + i}</option>
                      ))}
                    </select>
                    <select
                      className="filter-select"
                      name="yearTo"
                      value={filters.yearTo}
                      onChange={handleFilterChange}
                    >
                      <option value="">To</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={2015 + i}>{2015 + i}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gearbox */}
                <div className="filter-group">
                  <label>Gearbox</label>
                  <select
                    className="filter-select"
                    name="gearbox"
                    value={filters.gearbox}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select gearbox</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Any">Any</option>
                  </select>
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
                  />
                </div>

                {/* Doors */}
                <div className="filter-group">
                  <label>Doors</label>
                  <select
                    className="filter-select"
                    name="doors"
                    value={filters.doors}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select doors</option>
                    <option value="2">2 Doors</option>
                    <option value="3">3 Doors</option>
                    <option value="4">4 Doors</option>
                    <option value="5">5 Doors</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="filter-group">
                  <label>Fuel Type</label>
                  <select
                    className="filter-select"
                    name="fuel"
                    value={filters.fuel}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Engine Size */}
                <div className="filter-group">
                  <label>Engine Size</label>
                  <input
                    type="number"
                    className="filter-input"
                    name="engine"
                    value={filters.engine}
                    onChange={handleFilterChange}
                    placeholder="Enter engine size"
                    step="0.1"
                    min="0"
                  />
                </div>

                {/* Power */}
                <div className="filter-group">
                  <label>Power (HP)</label>
                  <input
                    type="number"
                    className="filter-input"
                    name="power"
                    value={filters.power}
                    onChange={handleFilterChange}
                    placeholder="Enter horsepower"
                    min="0"
                  />
                </div>

                {/* Mileage */}
                <div className="filter-group">
                  <label>Mileage</label>
                  <select
                    className="filter-select"
                    name="mileage"
                    value={filters.mileage}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select mileage</option>
                    <option value="0-10000">0 - 10,000 miles</option>
                    <option value="10001-25000">10,001 - 25,000 miles</option>
                    <option value="25001-50000">25,001 - 50,000 miles</option>
                    <option value="50001-75000">50,001 - 75,000 miles</option>
                    <option value="75001-100000">75,001 - 100,000 miles</option>
                    <option value="100001+">100,001+ miles</option>
                  </select>
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
                <div key={car.id} className="car-card-container">
                  <div 
                    className={`car-card ${flippedCards[car.id] ? 'flipped' : ''}`}
                    onClick={() => flipCard(car.id, { stopPropagation: () => {} })}
                  >
                    <div className="car-card-front">
                      <div className="car-slideshow">
                        {car.images.map((image, index) => (
                          <div
                            key={index}
                            className={`slide ${currentSlides[car.id] === index ? 'active' : ''}`}
                          >
                            <div
                              className="car-photo"
                              style={{ backgroundImage: `url(${image})` }}
                            ></div>
                          </div>
                        ))}
                        
                        <div
                          className="nav-arrow prev"
                          onClick={(e) => changeSlide(car.id, -1, e)}
                        >
                          ❮
                        </div>
                        <div
                          className="nav-arrow next"
                          onClick={(e) => changeSlide(car.id, 1, e)}
                        >
                          ❯
                        </div>
                        
                        <div className="slide-indicator">
                          {car.images.map((_, index) => (
                            <div
                              key={index}
                              className={`dot ${currentSlides[car.id] === index ? 'active' : ''}`}
                              onClick={(e) => goToSlide(car.id, index, e)}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div
                        className="flip-indicator"
                        onClick={(e) => flipCard(car.id, e)}
                      >
                        Flip for details
                      </div>
                    </div>
                    
                    <div className="car-card-back">
                      <div className="car-details-container">
                        <div className="car-header">
                          <span className="car-title">{car.title}</span>
                          <span className="car-year">{car.year}</span>
                        </div>
                        
                        <div className="car-specs-column">
                          <div className="spec-row">
                            <span className="spec-label">Make:</span>
                            <span className="spec-value">{car.make}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Model:</span>
                            <span className="spec-value">{car.model}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Gearbox:</span>
                            <span className="spec-value">{car.gearbox}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Color:</span>
                            <span className="spec-value">{car.color}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Doors:</span>
                            <span className="spec-value">{car.doors}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Fuel Type:</span>
                            <span className="spec-value">{car.fuelType}</span>
                          </div>
                        </div>
                        
                        <div className="car-specs-column">
                          <div className="spec-row">
                            <span className="spec-label">Engine:</span>
                            <span className="spec-value">{car.engine}L</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Power:</span>
                            <span className="spec-value">{car.power} HP</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Mileage:</span>
                            <span className="spec-value">{car.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Body Type:</span>
                            <span className="spec-value">{car.bodyType}</span>
                          </div>
                        </div>
                        
                        <div className="car-description">
                          {car.description}
                        </div>
                        
                        <div className="car-price-large">
                          ${car.price.toLocaleString()}
                        </div>
                        
                        <div className="button-container">
                          <button
                            className={`call-button ${showPhones[car.id] ? 'show-phone' : ''}`}
                            onClick={(e) => showPhoneNumber(car.id, e)}
                          >
                            <span className="call-text">Call Now</span>
                            <span className="phone-number">{car.phone}</span>
                          </button>
                        </div>
                      </div>
                      <div
                        className="flip-indicator"
                        onClick={(e) => flipCard(car.id, e)}
                      >
                        Flip back
                      </div>
                    </div>
                  </div>
                </div>
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
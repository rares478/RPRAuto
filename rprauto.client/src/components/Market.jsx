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

  const [cars, setCars] = useState([
    {
      id: 1,
      title: 'BMW M4 Competition',
      year: '2023',
      make: 'BMW',
      model: 'M4 Competition',
      gearbox: '8-Speed Automatic',
      color: 'Alpine White',
      doors: '2',
      fuelType: 'Gasoline',
      engine: '3.0L Twin-Turbo I6',
      power: '503 hp',
      acceleration: '3.8 sec',
      mileage: '2,500 mi',
      bodyType: 'Coupe',
      price: 75000,
      description: 'This 2023 BMW M4 Competition represents the pinnacle of BMW\'s performance engineering. With its twin-turbo inline-6 engine producing 503 horsepower, it delivers exceptional acceleration.',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      ],
      phone: '555-BMW-CARS'
    },
    // Add more car objects here...
  ]);

  const [currentSlides, setCurrentSlides] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [showPhones, setShowPhones] = useState({});

  useEffect(() => {
    // Initialize current slides for each car
    const initialSlides = {};
    cars.forEach(car => {
      initialSlides[car.id] = 0;
    });
    setCurrentSlides(initialSlides);
  }, [cars]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    
    if (name === 'priceMin' && newValue > filters.priceMax) {
      return; // Don't allow min to exceed max
    }
    if (name === 'priceMax' && newValue < filters.priceMin) {
      return; // Don't allow max to be less than min
    }
    
    setFilters(prev => {
      const newFilters = { ...prev, [name]: newValue };
      
      // Update the range visualization
      const priceRange = document.querySelector('.price-range');
      if (priceRange) {
        const minPercent = (newFilters.priceMin / 500000) * 100;
        const maxPercent = (newFilters.priceMax / 500000) * 100;
        priceRange.style.setProperty('--min-percent', `${minPercent}%`);
        priceRange.style.setProperty('--max-percent', `${maxPercent}%`);
      }
      
      return newFilters;
    });
  };

  // Initialize range visualization on component mount
  useEffect(() => {
    const priceRange = document.querySelector('.price-range');
    if (priceRange) {
      const minPercent = (filters.priceMin / 500000) * 100;
      const maxPercent = (filters.priceMax / 500000) * 100;
      priceRange.style.setProperty('--min-percent', `${minPercent}%`);
      priceRange.style.setProperty('--max-percent', `${maxPercent}%`);
    }
  }, []);

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    // Implement filter logic here
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
                      onChange={handlePriceRangeChange}
                      className="slider"
                    />
                    <input
                      type="range"
                      min={filters.priceMin}
                      max="500000"
                      value={filters.priceMax}
                      name="priceMax"
                      onChange={handlePriceRangeChange}
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
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="semi-automatic">Semi-Automatic</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                {/* Color */}
                <div className="filter-group">
                  <label>Color</label>
                  <select
                    className="filter-select"
                    name="color"
                    value={filters.color}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select color</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="silver">Silver</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="gray">Gray</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                  </select>
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
                    <option value="">Select fuel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>

                {/* Engine Size */}
                <div className="filter-group">
                  <label>Engine Size</label>
                  <select
                    className="filter-select"
                    name="engine"
                    value={filters.engine}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select engine size</option>
                    <option value="1.0-1.5">1.0L - 1.5L</option>
                    <option value="1.6-2.0">1.6L - 2.0L</option>
                    <option value="2.1-3.0">2.1L - 3.0L</option>
                    <option value="3.1-4.0">3.1L - 4.0L</option>
                    <option value="4.1-5.0">4.1L - 5.0L</option>
                    <option value="5.1+">5.1L+</option>
                  </select>
                </div>

                {/* Body Type */}
                <div className="filter-group">
                  <label>Body Type</label>
                  <select
                    className="filter-select"
                    name="bodyType"
                    value={filters.bodyType}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select type</option>
                    <option value="sedan">Sedan</option>
                    <option value="coupe">Coupe</option>
                    <option value="suv">SUV</option>
                    <option value="convertible">Convertible</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="wagon">Wagon</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                {/* Horse Power */}
                <div className="filter-group">
                  <label>Horse Power</label>
                  <select
                    className="filter-select"
                    name="power"
                    value={filters.power}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select power range</option>
                    <option value="0-150">0 - 150 HP</option>
                    <option value="151-250">151 - 250 HP</option>
                    <option value="251-350">251 - 350 HP</option>
                    <option value="351-450">351 - 450 HP</option>
                    <option value="451-550">451 - 550 HP</option>
                    <option value="551+">551+ HP</option>
                  </select>
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
                            <span className="spec-value">{car.engine}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Power:</span>
                            <span className="spec-value">{car.power}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">0-60 mph:</span>
                            <span className="spec-value">{car.acceleration}</span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-label">Mileage:</span>
                            <span className="spec-value">{car.mileage}</span>
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
import React, { useState } from 'react';
import './styles/market.css';

const Market = () => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    price: '',
    year: '',
    gearbox: '',
    body: '',
    color: '',
    doors: '',
    fuel: '',
    engine: '',
    power: '',
    mileage: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Applied filters:', filters);
  };

  return (
    <div className="market-container">
      <header className="header">
        <h1>RPR Auto</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Inventory</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        <section className="search-bar">
          <input type="text" placeholder="Search cars..." />
          <button>Search</button>
        </section>

        <div className="content-wrapper">
          <aside className="filters">
            <h3>Filter Cars</h3>
            <form onSubmit={handleSubmit}>
              <label>Make:
                <input type="text" name="make" value={filters.make} onChange={handleChange} />
              </label><br />

              <label>Model:
                <input type="text" name="model" value={filters.model} onChange={handleChange} />
              </label><br />

              <label>Price Max:
                <input type="number" name="price" min="0" step="1000" value={filters.price} onChange={handleChange} />
              </label><br />

              <label>Year Min:
                <input type="number" name="year" min="1900" max="2025" value={filters.year} onChange={handleChange} />
              </label><br />

              <label>Gearbox:
                <select name="gearbox" value={filters.gearbox} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </label><br />

              <label>Body Type:
                <select name="body" value={filters.body} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="truck">Truck</option>
                </select>
              </label><br />

              <label>Colour:
                <input type="text" name="color" value={filters.color} onChange={handleChange} />
              </label><br />

              <label>Doors:
                <select name="doors" value={filters.doors} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </label><br />

              <label>Fuel Type:
                <select name="fuel" value={filters.fuel} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label><br />

              <label>Engine Size (L):
                <input type="number" name="engine" step="0.1" min="0" value={filters.engine} onChange={handleChange} />
              </label><br />

              <label>Power (HP):
                <input type="number" name="power" min="0" value={filters.power} onChange={handleChange} />
              </label><br />

              <label>Mileage Max (km):
                <input type="number" name="mileage" min="0" step="1000" value={filters.mileage} onChange={handleChange} />
              </label><br />

              <button type="submit">Apply Filters</button>
            </form>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Car Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Market; 
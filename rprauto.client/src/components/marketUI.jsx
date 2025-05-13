import React, { useState, useEffect } from 'react';
import './styles/market.css';
import './styles/card.css';
import { loadCarsHandle } from '../functionality/marketFun';

const Market = () => {
    const [filters, setFilters] = useState({
        make: '', model: '', price: '', year: '', gearbox: '',
        body: '', color: '', doors: '', fuel: '', engine: '', power: '', mileage: ''
    });

    const [cars, setCars] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const results = await loadCarsHandle(filters);
        setCars(results);
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
                            {Object.entries(filters).map(([key, value]) => (
                                <label key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:
                                    <input
                                        type={['price', 'year', 'engine', 'power', 'mileage'].includes(key) ? 'number' : 'text'}
                                        name={key}
                                        value={value}
                                        onChange={handleChange}
                                    />
                                </label>
                            ))}
                            <button type="submit">Apply Filters</button>
                        </form>
                    </aside>

                    <section className="car-list">
                        {cars.map((car, index) => (
                            <div className="card-container" key={index}>
                                <div className="card" id={`flipCard-${index}`}>
                                    <div className="card-front">
                                        <div className="car-slideshow">
                                            {car.images.map((img, idx) => (
                                                <div
                                                    className={`slide ${idx === 0 ? 'active' : ''}`}
                                                    key={idx}
                                                >
                                                    <div
                                                        className="car-photo"
                                                        style={{ backgroundImage: `url(${img})` }}
                                                    ></div>
                                                </div>
                                            ))}
                                            <div className="nav-arrow prev" onClick={(e) => changeSlide(-1, e, index)}>❮</div>
                                            <div className="nav-arrow next" onClick={(e) => changeSlide(1, e, index)}>❯</div>
                                            <div className="slide-indicator">
                                                {car.images.map((_, dotIndex) => (
                                                    <div className={`dot ${dotIndex === 0 ? 'active' : ''}`} key={dotIndex}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flip-indicator" onClick={(e) => flipCard(e, index)}>Flip for details</div>
                                    </div>
                                    <div className="card-back">
                                        <div className="car-details-container">
                                            <div className="car-header">
                                                <span className="car-title">{car.make} {car.model}</span>
                                                <span className="car-year">{car.year}</span>
                                            </div>
                                            <div className="car-specs-column">
                                                <div className="spec-row"><span className="spec-label">Gearbox:</span><span className="spec-value">{car.gearbox}</span></div>
                                                <div className="spec-row"><span className="spec-label">Color:</span><span className="spec-value">{car.color}</span></div>
                                                <div className="spec-row"><span className="spec-label">Fuel:</span><span className="spec-value">{car.fuel}</span></div>
                                            </div>
                                            <div className="car-specs-column">
                                                <div className="spec-row"><span className="spec-label">Engine:</span><span className="spec-value">{car.engine}L</span></div>
                                                <div className="spec-row"><span className="spec-label">Power:</span><span className="spec-value">{car.power} hp</span></div>
                                                <div className="spec-row"><span className="spec-label">Mileage:</span><span className="spec-value">{car.mileage} km</span></div>
                                            </div>
                                            <div className="car-description">{car.description}</div>
                                            <div className="car-price-large">${car.price}</div>
                                            <div className="button-container">
                                                <button className="button">Contact Seller</button>
                                            </div>
                                        </div>
                                        <div className="flip-indicator" onClick={(e) => flipCard(e, index)}>Flip back</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; 2025 Car Marketplace. All rights reserved.</p>
            </footer>
        </div>
    );
};

function flipCard(e, index) {
    e.stopPropagation();
    document.getElementById(`flipCard-${index}`).classList.toggle('flipped');
}

function changeSlide(step, e, cardIndex) {
    e.stopPropagation();
    const card = document.getElementById(`flipCard-${cardIndex}`);
    const slides = card.querySelectorAll('.slide');
    const dots = card.querySelectorAll('.dot');
    let current = [...slides].findIndex(s => s.classList.contains('active'));

    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    let next = (current + step + slides.length) % slides.length;
    slides[next].classList.add('active');
    dots[next].classList.add('active');
}

export default Market;

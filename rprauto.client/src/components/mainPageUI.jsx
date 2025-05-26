import React, { useState, useEffect } from "react";
import "./styles/mainPage.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

// handle functions
import { fetchCars } from "../functionality/carsFun";
import { verifyUserHandle } from "../functionality/authFun";

function MainPage() {
    const [cars, setCars] = useState([]);
    const [currentSlide, setCurrentSlide] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwnerModalVisible, setIsOwnerModalVisible] = useState(false); // State for the first popup
    const [isOwnerPanelVisible, setIsOwnerPanelVisible] = useState(false); // State for the second popup
    const [ownerPassword, setOwnerPassword] = useState(""); // State to handle owner password input

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            const isValid = await verifyUserHandle();
            setIsAuthenticated(isValid);
        };

        checkAuth();
    }, []);

    // Fetch cars data
    useEffect(() => {
        const loadCars = async () => {
            try {
                const carList = await fetchCars();
                setCars(carList);
            } catch (error) {
                console.error('Error loading cars:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCars();
    }, []);

    // Function to handle slide changes
    const changeSlide = (carId, direction, event) => {
        event.stopPropagation();
        setCurrentSlide(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) + direction + 3) % 3
        }));
    };

    // Function to handle direct slide selection
    const goToSlide = (carId, index, event) => {
        event.stopPropagation();
        setCurrentSlide(prev => ({
            ...prev,
            [carId]: index
        }));
    };

    // Function to handle card flip
    const flipCard = (carId, event) => {
        if (event) {
            event.stopPropagation();
        }

        if (event && (
            event.target.classList.contains('nav-arrow') ||
            event.target.classList.contains('dot') ||
            event.target.classList.contains('btn') ||
            event.target.closest('.nav-arrow') ||
            event.target.closest('.dot') ||
            event.target.closest('.btn') ||
            event.target.closest('.flip-indicator')
        )) {
            return;
        }

        setCars(prev => prev.map(car =>
            car.id === carId ? { ...car, isFlipped: !car.isFlipped } : car
        ));
    };

    // Function to show phone number
    const showPhoneNumber = (carId, phoneNumber, event) => {
        event.stopPropagation();
        setCars(prev => prev.map(car =>
            car.id === carId ? { ...car, showPhone: true } : car
        ));

        setTimeout(() => {
            setCars(prev => prev.map(car =>
                car.id === carId ? { ...car, showPhone: false } : car
            ));
        }, 3000);
    };

    // Function to handle owner login
    // Function to handle showing the Owner Modal
    const showOwnerModal = () => {
        setIsOwnerModalVisible(true);
    };

    // Function to handle closing the Owner Modal
    const closeOwnerModal = () => {
        setIsOwnerModalVisible(false);
        setOwnerPassword(""); // Clear the password input
    };

    // Function to handle closing the Owner Panel
    const closeOwnerPanel = () => {
        setIsOwnerPanelVisible(false);
    };

    // Function to handle Owner Login
    const handleOwnerLogin = (e) => {
        e.preventDefault();
        if (ownerPassword === "1234") {
            setIsOwnerModalVisible(false); // Close the first popup
            setIsOwnerPanelVisible(true); // Show the second popup
        } else {
            alert("Invalid password. Access denied.");
        }
    };

    return (
        <div className="main-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-content">
                    <div className="nav-brand">
                        <a href="/">RPR Auto</a>
                    </div>
                    <div className="nav-links">
                        <a href="/" class="nav-link active" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                            Home
                        </a>
                        <a href="/marketplace" class="nav-link" onClick={(e) => { e.preventDefault(); navigate("/marketplace"); }}>
                            Marketplace
                        </a>
                        <a href="/auctions" class="nav-link" onClick={(e) => { e.preventDefault(); navigate("/auctions"); }}>
                            Auctions
                        </a>
                    </div>
                    <div class="nav-buttons">
                        {!isAuthenticated && (
                            <>
                                <button className="nav-button" onClick={() => window.location.href = "/signin"} style={{ display: "inline" }}>
                                    Sign In
                                </button>
                                <button className="nav-button" onClick={() => window.location.href = "/register"} style={{ display: "inline" }}>
                                    Register
                                </button>
                                <button className="nav-link" onClick={() => window.location.href = "/account"} style={{ display: "none" }}>
                                    My Account
                                </button>
                            </>
                        )}
                        {isAuthenticated && (
                           <>
                               <button className="nav-button" onClick={() => window.location.href = "/signin"} style={{ display: "none" }}>
                                   Sign In
                               </button>
                               <button className="nav-button" onClick={() => window.location.href = "/register"} style={{ display: "none" }}>
                                   Register
                               </button>
                               <button className="nav-link" onClick={() => window.location.href = "/account"} style={{ display: "inline" }}>
                                   My Account
                               </button>
                           </>
                        )}

                        <button className="btn btn-owner" onClick={showOwnerModal}>
                            Owner
                        </button>
                    </div>
                </div>
            </nav>

            {/* Owner Section */}
            {isOwnerModalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeOwnerModal}>
                            &times;
                        </span>
                        <h2>Owner Access</h2>
                        <form onSubmit={handleOwnerLogin}>
                            <div className="form-group">
                                <label>Owner Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter owner password"
                                    value={ownerPassword}
                                    onChange={(e) => setOwnerPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary full-width">
                                Access Owner Panel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Owner Panel (2nd Popup) */}
            {isOwnerPanelVisible && (
                <div className="modal owner-panel">
                    <div className="modal-content owner-content">
                        <span className="close" onClick={closeOwnerPanel}>
                            &times;
                        </span>
                        <h2>Owner Control Panel</h2>

                        <div className="owner-sections">
                            <div className="owner-section">
                                <h3>
                                    <i className="fas fa-palette"></i> Site Customization
                                </h3>
                                <div className="owner-controls">
                                    <div className="control-group">
                                        <label>Site Title</label>
                                        <input type="text" id="siteTitle" className="form-input" defaultValue="RPR Auto" />
                                        <button className="btn btn-sm btn-primary" onClick={() => alert("Site title updated!")}>
                                            Update
                                        </button>
                                    </div>
                                    <div className="control-group">
                                        <label>Hero Title</label>
                                        <input type="text" id="heroTitle" className="form-input" defaultValue="Find Your Dream Car" />
                                        <button className="btn btn-sm btn-primary" onClick={() => alert("Hero title updated!")}>
                                            Update
                                        </button>
                                    </div>
                                    <div className="control-group">
                                        <label>Hero Subtitle</label>
                                        <input
                                            type="text"
                                            id="heroSubtitle"
                                            className="form-input"
                                            defaultValue="Buy, sell, and bid on premium vehicles in our trusted marketplace"
                                        />
                                        <button className="btn btn-sm btn-primary" onClick={() => alert("Hero subtitle updated!")}>
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="owner-section">
                                <h3>
                                    <i className="fas fa-chart-bar"></i> Site Statistics
                                </h3>
                                <div className="owner-controls">
                                    <div className="stats-grid">
                                        <div className="stat-control">
                                            <label>Active Users</label>
                                            <input type="text" id="activeUsers" className="form-input" defaultValue="50K+" />
                                            <button className="btn btn-sm btn-primary" onClick={() => alert("Active users updated!")}>
                                                Update
                                            </button>
                                        </div>
                                        <div className="stat-control">
                                            <label>Cars Sold</label>
                                            <input type="text" id="carsSold" className="form-input" defaultValue="15K+" />
                                            <button className="btn btn-sm btn-primary" onClick={() => alert("Cars sold updated!")}>
                                                Update
                                            </button>
                                        </div>
                                        <div className="stat-control">
                                            <label>Live Auctions</label>
                                            <input type="text" id="liveAuctions" className="form-input" defaultValue="24/7" />
                                            <button className="btn btn-sm btn-primary" onClick={() => alert("Live auctions updated!")}>
                                                Update
                                            </button>
                                        </div>
                                        <div className="stat-control">
                                            <label>Satisfaction Rate</label>
                                            <input type="text" id="satisfactionRate" className="form-input" defaultValue="98%" />
                                            <button className="btn btn-sm btn-primary" onClick={() => alert("Satisfaction rate updated!")}>
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Find Your Dream Car</h1>
                        <p>Buy, sell, and bid on premium vehicles in our trusted marketplace</p>
                        <div className="search-bar">
                            <input type="text" placeholder="Search by make, model, or year..." />
                            <button className="btn btn-primary">
                                <i className="fas fa-search"></i>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3>50K+</h3>
                            <p>Active Users</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">
                                <i className="fas fa-award"></i>
                            </div>
                            <h3>15K+</h3>
                            <p>Cars Sold</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3>24/7</h3>
                            <p>Live Auctions</p>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>98%</h3>
                            <p>Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Cars Section */}
            <section className="featured-cars">
                <div className="container">
                    <div className="section-header">
                        <h2>Featured Vehicles</h2>
                        <p>Discover premium cars from trusted sellers</p>
                    </div>

                    {isLoading ? (
                        <p>Loading cars...</p>
                    ) : cars.length === 0 ? (
                        <p>No cars available at the moment.</p>
                    ) : (
                        <div className="cars-grid">
                            {cars.map(car => (
                                <div key={car.id} className="car-card-container">
                                    <div className={`car-card ${car.isFlipped ? 'flipped' : ''}`} onClick={(e) => flipCard(car.id, e)}>
                                        <div className="car-card-front">
                                            <div className="car-slideshow">
                                                {car.images.map((image, index) => (
                                                    <div key={index} className={`slide ${currentSlide[car.id] === index ? 'active' : ''}`}>
                                                        <div className="car-photo" style={{ backgroundImage: `url(${image})` }}></div>
                                                    </div>
                                                ))}
                                                <div className="nav-arrow prev" onClick={(e) => changeSlide(car.id, -1, e)}>❮</div>
                                                <div className="nav-arrow next" onClick={(e) => changeSlide(car.id, 1, e)}>❯</div>
                                                <div className="slide-indicator">
                                                    {car.images.map((_, index) => (
                                                        <div key={index} className={`dot ${currentSlide[car.id] === index ? 'active' : ''}`} onClick={(e) => goToSlide(car.id, index, e)}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flip-indicator" onClick={(e) => flipCard(car.id, e)}>Flip for details</div>
                                        </div>
                                        <div className="car-card-back">
                                            <div className="car-details-container">
                                                <div className="car-header">
                                                    <span className="car-title">{car.make} {car.model}</span>
                                                    <span className="car-year">{car.year}</span>
                                                </div>
                                                <div className="car-description">{car.description}</div>
                                                <div className="car-price-large">${car.price.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default MainPage;
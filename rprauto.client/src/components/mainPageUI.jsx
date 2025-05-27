import React, { useState, useEffect } from "react";
import "./styles/mainPage.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

function MainPage() {
     const [cars, setCars] = useState([]);
     const [currentSlide, setCurrentSlide] = useState({});
     const [flippedCards, setFlippedCards] = useState({});
     const [showPhones, setShowPhones] = useState({});

     // Function to handle slide changes
     const changeSlide = (carId, direction, event) => {
          event.stopPropagation();
          setCurrentSlide(prev => {
               const car = cars.find(c => c.id === carId);
               const newSlide = ((prev[carId] || 0) + direction + car.images.length) % car.images.length;
               return { ...prev, [carId]: newSlide };
          });
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
          
          setFlippedCards(prev => {
               const newState = { ...prev };
               newState[carId] = !newState[carId];
               return newState;
          });
     };

     // Function to show phone number
     const showPhoneNumber = (carId, phoneNumber, event) => {
          event.stopPropagation();
          setShowPhones(prev => {
               const newState = { ...prev };
               newState[carId] = true;
               return newState;
          });
          
          setTimeout(() => {
               setShowPhones(prev => {
                    const newState = { ...prev };
                    newState[carId] = false;
                    return newState;
               });
          }, 3000);
     };

     // Fetch cars data from your API
     useEffect(() => {
          const fetchCars = async () => {
               try {
                    const response = await fetch('https://rprauto.onrender.com/listing?page=1&pageSize=3');
                    const data = await response.json();
                    
                    // Get 3 random cars from the listings
                    const randomCars = data.Listings
                         .map(listing => ({
                              id: listing.Id || listing._id,
                              make: listing.Car.Make,
                              model: listing.Car.Model,
                              year: listing.Car.Year,
                              price: listing.Price,
                              description: listing.Description,
                              images: listing.Car.Pictures || [],
                              specs: {
                                   "Mileage": listing.Car.Mileage,
                                   "Engine": listing.Car.EngineSize,
                                   "Power": listing.Car.HorsePower,
                                   "Fuel": listing.Car.FuelType,
                                   "Gearbox": listing.Car.GearboxType,
                                   "Body": listing.Car.BodyType,
                                   "Color": listing.Car.Color,
                                   "Doors": listing.Car.Doors
                              },
                              phoneNumber: listing.User?.Personal?.PhoneNumber || "N/A",
                              isFlipped: false,
                              showPhone: false
                         }));
                    
                    console.log('Random cars:', randomCars);
                    setCars(randomCars);
                    
                    // Initialize current slides for each car
                    const initialSlides = {};
               } catch (error) {
                    console.error('Error fetching cars:', error);
               }
          };
          
          fetchCars();
     }, []);

    return (
          <div className="main-container">
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

                         <div className="cars-grid">
                              {cars.map(car => (
                                   <div key={car.id} className="car-card-container">
                                        <div 
                                             className={`car-card ${flippedCards[car.id] ? 'flipped' : ''}`}
                                             onClick={(e) => flipCard(car.id, e)}
                                        >
                                             <div className="car-id">ID: {car.id}</div>
                                             <div className="car-card-front">
                                                  <div className="car-slideshow">
                                                       {car.images.map((image, index) => (
                                                            <div
                                                                 key={index}
                                                                 className={`slide ${currentSlide[car.id] === index ? 'active' : ''}`}
                                                            >
                                                                 <div
                                                                      className="car-photo"
                                                                      style={{ backgroundImage: `url(${image})` }}
                                                                 ></div>
                                                            </div>
                                                       ))}
                                                       
                                                       <div
                                                            className="nav-arrow prev"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 changeSlide(car.id, -1, e);
                                                            }}
                                                       >
                                                            ❮
                                                       </div>
                                                       <div
                                                            className="nav-arrow next"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 changeSlide(car.id, 1, e);
                                                            }}
                                                       >
                                                            ❯
                                                       </div>
                                                       
                                                       <div className="slide-indicator">
                                                            {car.images.map((_, index) => (
                                                                 <div
                                                                      key={index}
                                                                      className={`dot ${currentSlide[car.id] === index ? 'active' : ''}`}
                                                                      onClick={(e) => {
                                                                           e.stopPropagation();
                                                                           goToSlide(car.id, index, e);
                                                                      }}
                                                                 ></div>
                                                            ))}
                </div>
            </div>
                                                  <div
                                                       className="flip-indicator"
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            flipCard(car.id, e);
                                                       }}
                                                  >
                                                       Flip for details
                                                  </div>
                    </div>
                                             
                                             <div className="car-card-back">
                                                  <div className="car-details-container">
                                                       <div className="car-header">
                                                            <span className="car-title">{car.make} {car.model}</span>
                                                            <span className="car-year">{car.year}</span>
                </div>
                                                       
                                                       <div className="car-specs-column">
                                                            {Object.entries(car.specs).slice(0, 5).map(([key, value]) => (
                                                                 <div key={key} className="spec-row">
                                                                      <span className="spec-label">{key}:</span>
                                                                      <span className="spec-value">{value}</span>
            </div>
                                                            ))}
                            </div>
                                                       
                                                       <div className="car-specs-column">
                                                            {Object.entries(car.specs).slice(5).map(([key, value]) => (
                                                                 <div key={key} className="spec-row">
                                                                      <span className="spec-label">{key}:</span>
                                                                      <span className="spec-value">{value}</span>
                            </div>
                                                            ))}
                            </div>
                                                       
                                                       <div className="car-description">{car.description}</div>
                                                       
                                                       <div className="car-price-large">${car.price.toLocaleString()}</div>
                                                       
                                                       <div className="button-container">
                                                            <button className={`call-button ${showPhones[car.id] ? 'show-phone' : ''}`} onClick={(e) => showPhoneNumber(car.id, car.phoneNumber, e)}>
                                                                 <span className="call-text">Call Now</span>
                                                                 <span className="phone-number">{car.phoneNumber}</span>
                                                            </button>
                            </div>
                        </div>
                                                  <div
                                                       className="flip-indicator"
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            flipCard(car.id, e);
                                                       }}
                                                  >
                                                       Flip back
                                                  </div>
                        </div>
                    </div>
            </div>
                              ))}
                         </div>

                         <div className="section-footer">
                              <button className="btn btn-outline">View All Vehicles</button>
                        </div>
                    </div>
               </section>

               {/* How It Works Section */}
               <section className="how-it-works">
                    <div className="container">
                         <div className="section-header">
                              <h2>How It Works</h2>
                              <p>Simple steps to buy or sell your vehicle</p>
                         </div>

                         <div className="steps-grid">
                              <div className="step-item">
                                   <div className="step-number">1</div>
                                   <h3>Browse & Search</h3>
                                   <p>Explore thousands of verified vehicles or use our advanced search to find exactly what you need.</p>
                              </div>
                              <div className="step-item">
                                   <div className="step-number">2</div>
                                   <h3>Bid or Buy</h3>
                                   <p>Participate in live auctions or purchase vehicles instantly with our Buy Now option.</p>
                              </div>
                              <div className="step-item">
                                   <div className="step-number">3</div>
                                   <h3>Secure Transaction</h3>
                                   <p>Complete your purchase with our secure payment system and arrange delivery or pickup.</p>
                              </div>
                        </div>
                    </div>
               </section>

               {/* Footer */}
               <footer className="footer">
                    <div className="container">
                         <div className="footer-grid">
                              <div className="footer-section">
                                   <h3>RPR Auto</h3>
                                   <p>The premier destination for buying and selling premium vehicles through auctions and direct sales.</p>
                              </div>
                              <div className="footer-section">
                                   <h4>Quick Links</h4>
                                   <ul>
                                        <li><a href="/marketplace">Marketplace</a></li>
                                        <li><a href="/auctions">Live Auctions</a></li>
                                        <li><a href="/account">My Account</a></li>
                                        <li><a href="/about">About Us</a></li>
                                   </ul>
                              </div>
                              <div className="footer-section">
                                   <h4>Support</h4>
                                   <ul>
                                        <li><a href="/help">Help Center</a></li>
                                        <li><a href="/contact">Contact Us</a></li>
                                        <li><a href="/terms">Terms of Service</a></li>
                                        <li><a href="/privacy">Privacy Policy</a></li>
                                   </ul>
                              </div>
                              <div className="footer-section">
                                   <h4>Contact Info</h4>
                                   <div className="contact-info">
                                        <p>1-800-RPR-AUTO</p>
                                        <p>support@rprauto.com</p>
                                        <p>123 Car Street, Auto City, AC 12345</p>
                        </div>
                    </div>
                </div>
                         <div className="footer-bottom">
                              <p>&copy; 2024 RPR Auto. All rights reserved.</p>
            </div>
                    </div>
               </footer>
        </div>
    );
}

export default MainPage;
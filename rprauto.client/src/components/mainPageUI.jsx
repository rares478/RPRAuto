import React, { useState, useEffect } from "react";
import Select from 'react-select';
import "./styles/mainPage.css";
import ListingCard from './ListingCard';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import { makes, getModelsForMake } from './data/carOptions';

function MainPage() {
     const [cars, setCars] = useState([]);
     const [siteSettings, setSiteSettings] = useState({
          siteTitle: 'RPR Auto',
          heroTitle: 'Find Your Dream Car',
          heroSubtitle: 'Buy, sell, and bid on premium vehicles in our trusted marketplace',
          activeUsers: '0',
          carsSold: '0',
          liveAuctions: '0',
          satisfactionRate: '0'
     });
     const [selectedMake, setSelectedMake] = useState(null);
     const [selectedModel, setSelectedModel] = useState(null);
     const [selectedYear, setSelectedYear] = useState(null);
     const navigate = useNavigate();

     useEffect(() => {
          loadSiteSettings();
          fetchCars();
     }, []);

     const loadSiteSettings = async () => {
          try {
               const response = await fetch('https://rprauto-ajdq.onrender.com/api/sitesettings');
               if (!response.ok) {
                    throw new Error('Failed to load site settings');
               }
               const data = await response.json();
               setSiteSettings({
                    siteTitle: data.SiteTitle || 'RPR Auto',
                    heroTitle: data.HeroTitle || 'Find Your Dream Car',
                    heroSubtitle: data.HeroSubtitle || 'Buy, sell, and bid on premium vehicles in our trusted marketplace',
                    activeUsers: data.ActiveUsers || '0',
                    carsSold: data.CarsSold || '0',
                    liveAuctions: data.LiveAuctions || '0',
                    satisfactionRate: data.SatisfactionRate || '0'
               });
          } catch (error) {
               console.error('Error loading site settings:', error);
          }
     };

     // Fetch cars data from your API
     const fetchCars = async () => {
          try {
               const response = await fetch('https://rprauto-ajdq.onrender.com/listing?page=1&pageSize=3');
               const data = await response.json();
               
               // Get 3 random cars from the listings
               const randomCars = data.Listings
                    .map(listing => ({
                         id: listing.Id,
                         title: `${listing.Car.Make} ${listing.Car.Model}`,
                         make: listing.Car.Make,
                         model: listing.Car.Model,
                         year: listing.Car.Year,
                         price: listing.Price,
                         description: listing.Description,
                         images: listing.Car.Pictures || [],
                         gearbox: listing.Car.GearboxType,
                         color: listing.Car.Color,
                         doors: listing.Car.Doors,
                         fuelType: listing.Car.FuelType,
                         engine: listing.Car.EngineSize,
                         power: listing.Car.HorsePower,
                         mileage: listing.Car.Mileage,
                         bodyType: listing.Car.BodyType,
                         phone: listing.User?.Personal?.PhoneNumber || "N/A"
                    }));
                
               setCars(randomCars);
          } catch (error) {
               console.error('Error fetching cars:', error);
          }
     };

     // Dropdown search handler
     const handleSearch = (e) => {
          if (e) e.preventDefault();
          let params = new URLSearchParams();
          if (selectedMake) params.append('make', selectedMake.value);
          if (selectedModel) params.append('model', selectedModel.value);
          if (selectedYear) params.append('year', selectedYear.value);
          navigate(`/market?${params.toString()}`);
     };

     const years = Array.from({length: 15}, (_, i) => {
          const y = (2010 + i).toString();
          return { value: y, label: y };
     });

    return (
          <div className="main-page">
               {/* Hero Section */}
               <section className="hero">
                    <div className="container">
                         <div className="hero-content">
                              <h1>{siteSettings.heroTitle}</h1>
                              <p>{siteSettings.heroSubtitle}</p>
                              <div className="search-bar">
                                   <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                             <Select
                                                  options={makes.filter(m => m).map(make => ({ value: make, label: make }))}
                                                  value={selectedMake}
                                                  onChange={option => {
                                                       setSelectedMake(option);
                                                       setSelectedModel(null);
                                                  }}
                                                  placeholder="Select Make"
                                                  isClearable
                                                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                                  styles={{
                                                       menuPortal: base => ({ ...base, zIndex: 2147483647 })
                                                  }}
                                                  classNamePrefix="react-select"
                                             />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                             <Select
                                                  options={selectedMake ? getModelsForMake(selectedMake.value).map(model => ({ value: model, label: model })) : []}
                                                  value={selectedModel}
                                                  onChange={option => setSelectedModel(option)}
                                                  placeholder="Select Model"
                                                  isClearable
                                                  isDisabled={!selectedMake}
                                                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                                  styles={{
                                                       menuPortal: base => ({ ...base, zIndex: 2147483647 })
                                                  }}
                                                  classNamePrefix="react-select"
                                             />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                             <Select
                                                  options={[{ value: '', label: 'Year From' }, ...years]}
                                                  value={selectedYear}
                                                  onChange={option => setSelectedYear(option)}
                                                  placeholder="Year From"
                                                  isClearable
                                                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                                  styles={{
                                                       menuPortal: base => ({ ...base, zIndex: 2147483647 })
                                                  }}
                                                  classNamePrefix="react-select"
                                             />
                                        </div>
                                        <button className="btn btn-primary" type="submit">
                                             <i className="fas fa-search"></i>
                                             Search
                                        </button>
                                   </form>
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
                                   <h3>{siteSettings.activeUsers}</h3>
                                   <p>Active Users</p>
                              </div>
                              <div className="stat-item">
                                   <div className="stat-icon">
                                        <i className="fas fa-award"></i>
                                   </div>
                                   <h3>{siteSettings.carsSold}</h3>
                                   <p>Cars Sold</p>
                              </div>
                              <div className="stat-item">
                                   <div className="stat-icon">
                                        <i className="fas fa-clock"></i>
                                   </div>
                                   <h3>{siteSettings.liveAuctions}</h3>
                                   <p>Live Auctions</p>
                              </div>
                              <div className="stat-item">
                                   <div className="stat-icon">
                                        <i className="fas fa-chart-line"></i>
                                   </div>
                                   <h3>{siteSettings.satisfactionRate}</h3>
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
                                   <ListingCard key={car.id} car={car} />
                              ))}
                         </div>

                         <div className="section-footer">
                              <button className="btn btn-outline" onClick={() => navigate('/market')}>View All Vehicles</button>
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
                                        <li><a href="/market">Marketplace</a></li>
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
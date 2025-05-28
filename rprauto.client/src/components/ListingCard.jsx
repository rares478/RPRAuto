import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles/card.css';

const ListingCard = ({ car }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupSlide, setPopupSlide] = useState(0);

    useEffect(() => {
        const sellerId = car.sellerId || car.userId || car.UserId || car.ownerId;
        if (sellerId) {
            fetch(`https://rprauto.onrender.com/user/${sellerId}/public`)
                .then(res => res.json())
                .then(data => setSellerInfo(data))
                .catch(() => setSellerInfo(null));
        }
    }, [car]);

    const changeSlide = (direction, e) => {
        e.stopPropagation();
        setCurrentSlide(prev => (prev + direction + car.images.length) % car.images.length);
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setCurrentSlide(index);
    };

    const flipCard = (e) => {
        if (e) e.stopPropagation();
        setIsFlipped(prev => !prev);
    };

    const showPhoneNumber = (e) => {
        e.stopPropagation();
        setShowPhone(true);
        setTimeout(() => setShowPhone(false), 3000);
    };

    const handleImageClick = (imageUrl, index, e) => {
        e.stopPropagation();
        setPopupSlide(index);
        setPopupOpen(true);
    };

    const closePopup = () => setPopupOpen(false);

    const popupNext = (e) => {
        e.stopPropagation();
        setPopupSlide((popupSlide + 1) % car.images.length);
    };
    const popupPrev = (e) => {
        e.stopPropagation();
        setPopupSlide((popupSlide - 1 + car.images.length) % car.images.length);
    };

    const popupOverlay = popupOpen ? ReactDOM.createPortal(
        <div className="image-popup-overlay image-popup-blur" onClick={closePopup}>
            <div className="image-popup-modal" onClick={e => e.stopPropagation()}>
                <img src={car.images[popupSlide].startsWith('http') ? car.images[popupSlide] : `https://rprauto.onrender.com${car.images[popupSlide]}`} alt="Car" className="image-popup-img image-popup-img-large" />
                {car.images.length > 1 && (
                    <>
                        <button className="image-popup-arrow left" onClick={popupPrev}>❮</button>
                        <button className="image-popup-arrow right" onClick={popupNext}>❯</button>
                    </>
                )}
                <button className="image-popup-close" onClick={closePopup}>&times;</button>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="car-card-container">
            <div className={`car-card-modern${isFlipped ? ' flipped' : ''}`} onClick={flipCard}>
                {/* FRONT */}
                <div className="car-card-front-modern">
                    <div className="car-slideshow-modern">
                        {car.images.map((image, index) => {
                            const imageUrl = image.startsWith('http') ? image : `https://rprauto.onrender.com${image}`;
                            return (
                                <div
                                    key={index}
                                    className={`slide-modern${currentSlide === index ? ' active' : ''}`}
                                    style={{ backgroundImage: `url(${imageUrl})` }}
                                    onClick={!isFlipped ? (e => handleImageClick(imageUrl, index, e)) : undefined}
                                />
                            );
                        })}
                        {car.images.length > 1 && (
                            <>
                                <div className="nav-arrow prev" onClick={e => changeSlide(-1, e)}>❮</div>
                                <div className="nav-arrow next" onClick={e => changeSlide(1, e)}>❯</div>
                            </>
                        )}
                        <div className="slide-indicator">
                            {car.images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`dot${currentSlide === index ? ' active' : ''}`}
                                    onClick={e => goToSlide(index, e)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="car-title-row">
                        <span className="car-title">{car.make} {car.model} {car.year}</span>
                        <span className="car-price">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="car-specs-row">
                        <span>{car.mileage.toLocaleString()} km</span>
                        <span>{car.fuelType}</span>
                        <span>{car.gearbox}</span>
                        <span>{car.bodyType}</span>
                    </div>
                    <div className="card-front-actions">
                        <button className="buy-button-modern" onClick={e => e.stopPropagation()}>Buy Now</button>
                        <div className="flip-indicator-modern" onClick={flipCard}>Details ⟶</div>
                    </div>
                </div>
                {/* BACK */}
                <div className="car-card-back-modern">
                    <div className="car-title-row">
                        <span className="car-title">{car.make} {car.model} {car.year}</span>
                        <span className="car-price">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="car-specs-grid">
                        <div className="spec-item"><i className="fas fa-tachometer-alt"></i><span>{car.mileage.toLocaleString()} km</span></div>
                        <div className="spec-item"><i className="fas fa-bolt"></i><span>{car.engine} L</span></div>
                    </div>
                    <div className="car-specs-grid">
                        <div className="spec-item"><i className="fas fa-cogs"></i><span>{car.gearbox}</span></div>
                        <div className="spec-item"><i className="fas fa-gas-pump"></i><span>{car.fuelType}</span></div>
                    </div>
                    <div className="car-specs-grid">
                        <div className="spec-item"><i className="fas fa-palette"></i><span>{car.color}</span></div>
                        <div className="spec-item"><i className="fas fa-door-closed"></i><span>{car.doors} doors</span></div>
                        <div className="spec-item"><i className="fas fa-horse-head"></i><span>{car.power || car.horsePower} HP</span></div>
                    </div>
                    <div className="car-description-modern">{car.description}</div>
                    {sellerInfo && (
                        <div className="seller-info-modern">
                            <h4>Seller Info</h4>
                            <div><b>Name:</b> {sellerInfo.displayName}</div>
                            <div><b>Phone:</b> {sellerInfo.phoneNumber}</div>
                            <div><b>City:</b> {sellerInfo.city}</div>
                            <div><b>Rating:</b> {sellerInfo.rating?.toFixed(1) ?? 0} ⭐</div>
                        </div>
                    )}
                    <div className="card-back-actions">
                        <button
                            className={`call-button-modern${showPhone ? ' show-phone' : ''}`}
                            onClick={showPhoneNumber}
                        >
                            {showPhone ? (
                                <span className="phone-number-modern">{sellerInfo?.phoneNumber || car.phone}</span>
                            ) : (
                                <span className="call-text-modern">Call Now</span>
                            )}
                        </button>
                        <div className="flip-indicator-modern" onClick={flipCard}>⟵ Back</div>
                    </div>
                </div>
            </div>
            {popupOverlay}
        </div>
    );
};

export default ListingCard; 
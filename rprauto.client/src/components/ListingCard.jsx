import React, { useState } from 'react';
import './styles/card.css';

const ListingCard = ({ car }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    const changeSlide = (direction, e) => {
        e.stopPropagation();
        setCurrentSlide(prev => {
            const newSlide = (prev + direction + car.images.length) % car.images.length;
            return newSlide;
        });
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setCurrentSlide(index);
    };

    const flipCard = (e) => {
        if (e) {
            e.stopPropagation();
        }
        
        if (e && (
            e.target.classList.contains('nav-arrow') ||
            e.target.classList.contains('dot') ||
            e.target.classList.contains('btn') ||
            e.target.closest('.nav-arrow') ||
            e.target.closest('.dot') ||
            e.target.closest('.btn') ||
            e.target.closest('.flip-indicator')
        )) {
            return;
        }
        
        setIsFlipped(prev => !prev);
    };

    const showPhoneNumber = (e) => {
        e.stopPropagation();
        setShowPhone(true);
        
        setTimeout(() => {
            setShowPhone(false);
        }, 3000);
    };

    return (
        <div className="car-card-container">
            <div 
                className={`car-card ${isFlipped ? 'flipped' : ''}`}
                onClick={flipCard}
            >
                <div className="car-card-front">
                    <div className="car-slideshow">
                        {car.images.map((image, index) => {
                            const imageUrl = image.startsWith('http') ? image : `https://rprauto.onrender.com${image}`;
                            return (
                                <div
                                    key={index}
                                    className={`slide ${currentSlide === index ? 'active' : ''}`}
                                >
                                    <div
                                        className="car-photo"
                                        style={{ 
                                            backgroundImage: `url(${imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                        
                        {car.images.length > 1 && (
                            <>
                                <div
                                    className="nav-arrow prev"
                                    onClick={(e) => changeSlide(-1, e)}
                                >
                                    ❮
                                </div>
                                <div
                                    className="nav-arrow next"
                                    onClick={(e) => changeSlide(1, e)}
                                >
                                    ❯
                                </div>
                            </>
                        )}
                        
                        <div className="slide-indicator">
                            {car.images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`dot ${currentSlide === index ? 'active' : ''}`}
                                    onClick={(e) => goToSlide(index, e)}
                                />
                            ))}
                        </div>
                    </div>
                    <div
                        className="flip-indicator"
                        onClick={flipCard}
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
                            <button
                                className="buy-button"
                                onClick={(e) => e.stopPropagation()}
                            />
                            ${car.price.toLocaleString()}
                        </div>
                        
                        <div className="button-container">
                            <button
                                className={`call-button ${showPhone ? 'show-phone' : ''}`}
                                onClick={showPhoneNumber}
                            >
                                <span className="call-text">Call Now</span>
                                <span className="phone-number">{car.phone}</span>
                            </button>
                        </div>
                    </div>
                    <div
                        className="flip-indicator"
                        onClick={flipCard}
                    >
                        Flip back
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard; 
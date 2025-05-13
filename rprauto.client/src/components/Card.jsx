import React, { useState } from 'react';
import './styles/card.css';

const Card = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const slides = [
    { url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
    { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
    { url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
  ];

  const flipCard = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const changeSlide = (n, e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => {
      let next = prev + n;
      if (next >= slides.length) next = 0;
      if (next < 0) next = slides.length - 1;
      return next;
    });
  };

  const goToSlide = (n) => {
    setCurrentSlide(n);
  };

  return (
    <div className="card-container">
      <div className={`card ${isFlipped ? 'flipped' : ''}`} id="flipCard" onClick={flipCard}>
        <div className="card-front">
          <div className="car-slideshow" onClick={(e) => e.stopPropagation()}>
            {slides.map((slide, index) => (
              <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
                <div className="car-photo" style={{ backgroundImage: `url(${slide.url})` }}></div>
              </div>
            ))}
            <div className="nav-arrow prev" onClick={(e) => changeSlide(-1, e)}>❮</div>
            <div className="nav-arrow next" onClick={(e) => changeSlide(1, e)}>❯</div>
            <div className="slide-indicator">
              {slides.map((_, index) => (
                <div key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(index)}></div>
              ))}
            </div>
          </div>
          <div className="flip-indicator" onClick={flipCard}>Flip for details</div>
        </div>
        <div className="card-back">
          <div className="car-details-container">
            <div className="car-header">
              <span className="car-title">Tesla Model S Plaid</span>
              <span className="car-year">2022</span>
            </div>
            <div className="car-specs-column">
              <div className="spec-row">
                <span className="spec-label">Make:</span>
                <span className="spec-value">Tesla</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Model:</span>
                <span className="spec-value">Model S Plaid</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Gearbox:</span>
                <span className="spec-value">1-Speed Automatic</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Color:</span>
                <span className="spec-value">Midnight Silver</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Fuel Type:</span>
                <span className="spec-value">Electric</span>
              </div>
            </div>
            <div className="car-specs-column">
              <div className="spec-row">
                <span className="spec-label">Engine:</span>
                <span className="spec-value">Tri-Motor</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Power:</span>
                <span className="spec-value">1,020 hp</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">0-60 mph:</span>
                <span className="spec-value">1.99 sec</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Mileage:</span>
                <span className="spec-value">5,200 mi</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Range:</span>
                <span className="spec-value">396 mi</span>
              </div>
            </div>
            <div className="car-description">
              This 2022 Tesla Model S Plaid represents the pinnacle of electric performance. With its tri-motor setup producing 1,020 horsepower, it delivers breathtaking acceleration while maintaining premium comfort and cutting-edge technology including Full Self-Driving capability.
            </div>
            <div className="car-price-large">$109,990</div>
            <div className="button-container">
              <button className="button"></button>
            </div>
          </div>
          <div className="flip-indicator" onClick={flipCard}>Flip back</div>
        </div>
      </div>
    </div>
  );
};

export default Card; 
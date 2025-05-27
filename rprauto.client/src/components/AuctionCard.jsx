import React, { useState, useEffect } from 'react';
import './styles/card1.css';

const AuctionCard = ({ auction }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const minIncrement = 1250; // This should come from the auction data

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const endDate = new Date(auction.endTime);
      const distance = endDate - now;
      
      if (distance < 0) {
        setTimeRemaining('AUCTION ENDED');
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      const formatTime = (time) => time < 10 ? `0${time}` : time;
      setTimeRemaining(`${days}d ${formatTime(hours)}h ${formatTime(minutes)}m ${formatTime(seconds)}s`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    return () => clearInterval(interval);
  }, [auction.endTime]);

  const changeSlide = (direction, e) => {
    e.stopPropagation();
    setCurrentSlide(prev => {
      const newSlide = (prev + direction + auction.images.length) % auction.images.length;
      return newSlide;
    });
  };

  const goToSlide = (slideIndex, e) => {
    e.stopPropagation();
    setCurrentSlide(slideIndex);
  };

  const handleBidSubmit = async (e) => {
    e.stopPropagation();
    const bidValue = parseFloat(bidAmount);
    const minBid = Math.max(auction.currentBid + minIncrement, auction.minBid);

    if (isNaN(bidValue)) {
      alert('Please enter a valid bid amount');
      return;
    }

    if (bidValue < minBid) {
      alert(`Your bid must be at least $${minBid.toLocaleString()}`);
      return;
    }

    try {
      const response = await fetch(`https://rprauto.onrender.com/bid/${auction.id}/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: bidValue
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bid');
      }

      // Update local state or trigger a refresh
      setBidAmount('');
      alert(`Bid of $${bidValue.toLocaleString()} placed successfully!`);
      
      // Refresh the bid data
      window.location.reload();
    } catch (error) {
      console.error('Error placing bid:', error);
      alert(error.message || 'Failed to place bid. Please try again.');
    }
  };

  return (
    <div className={`card flip-wrapper ${isFlipped ? 'flipped' : ''}`} id="flipCard">
      <div className="card-front">
        <div className="front-content">
          <div className="car-slideshow">
            {auction.images.map((image, index) => (
              <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
                <div className="car-photo" style={{ backgroundImage: `url(${image})` }}></div>
              </div>
            ))}
            
            <div className="nav-arrow prev" onClick={(e) => changeSlide(-1, e)}>❮</div>
            <div className="nav-arrow next" onClick={(e) => changeSlide(1, e)}>❯</div>
            
            <div className="slide-indicator">
              {auction.images.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={(e) => goToSlide(index, e)}
                ></div>
              ))}
            </div>

            <div className="basic-info-overlay">
              <div className="basic-info-title">{auction.title}</div>
              <div className="basic-info-time">
                <i className="fas fa-clock"></i>
                {timeRemaining}
              </div>
            </div>

            <button 
              className="show-details-button"
              onClick={() => setShowDetails(true)}
            >
              Show Details
            </button>
          </div>

          <div className={`details-panel ${showDetails ? 'show' : ''}`}>
            <div className="details-header">
              <div className="details-title">{auction.title}</div>
              <button 
                className="close-details"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="front-details">
              <div className="car-header">
                <div>
                  <h1 className="car-title">{auction.title}</h1>
                  <p className="car-year">{auction.year}</p>
                </div>
                <div className="time-remaining">
                  <i className="fas fa-clock"></i> {timeRemaining}
                </div>
              </div>
              
              <div className="car-specs">
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-tachometer-alt"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Power</span>
                    <span className="spec-value">{auction.power} hp</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-bolt"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Engine</span>
                    <span className="spec-value">{auction.engine}L</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-road"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">{auction.mileage} mi</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-cogs"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{auction.gearbox}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-gas-pump"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-value">{auction.fuelType}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-icon"><i className="fas fa-palette"></i></div>
                  <div className="spec-text">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{auction.color}</span>
                  </div>
                </div>
              </div>
              
              <div className="current-bid">
                <div className="bid-label">CURRENT BID</div>
                <div className="bid-amount">${auction.currentBid.toLocaleString()}</div>
                <div className="bid-label">{auction.bidHistory.length} bids so far</div>
              </div>
              
              <button className="bid-button" onClick={() => setIsFlipped(true)}>PLACE A BID</button>
              
              <div className="seller-info">
                <div className="seller-avatar">
                  {auction.seller.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="seller-label">Sold by</span>
                  <span className="seller-name">{auction.seller.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-back">
        <div className="auction-header">
          <h2 className="auction-title">Auction for {auction.title}</h2>
          <div className="time-remaining">
            <i className="fas fa-clock"></i> {timeRemaining}
          </div>
        </div>
        
        <div className="bid-history">
          {auction.bidHistory.map((bid, index) => (
            <div key={index} className="bid-item">
              <div className="bidder-info">
                <div className="bidder-avatar">
                  {bid.bidder.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="bidder-name">{bid.bidder.name}</div>
                  <div className="bid-time">{bid.time}</div>
                </div>
              </div>
              <div className="bid-amount-small">${bid.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
        
        <div className="highest-bid">
          <div className="highest-bid-label">YOUR MAX BID WOULD NEED TO BE</div>
          <div className="highest-bid-amount">
            ${(auction.currentBid + minIncrement).toLocaleString()}
          </div>
          <div className="highest-bidder">(Minimum bid increment: ${minIncrement.toLocaleString()})</div>
        </div>
        
        <div className="bid-form">
          <input
            type="number"
            className="bid-input"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Enter your bid amount ($${(auction.currentBid + minIncrement).toLocaleString()} minimum)`}
            min={auction.currentBid + minIncrement}
            step="100"
          />
          <button className="place-bid-button" onClick={handleBidSubmit}>
            PLACE BID
          </button>
        </div>
        
        <button className="back-button" onClick={() => setIsFlipped(false)}>
          BACK TO CAR DETAILS
        </button>
      </div>
    </div>
  );
};

export default AuctionCard; 
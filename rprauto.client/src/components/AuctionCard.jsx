import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles/card1.css';
import Cookies from 'js-cookie';

const AuctionCard = ({ auction }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [sellerName, setSellerName] = useState(auction.seller?.name || 'Seller');
  const [bidderNames, setBidderNames] = useState({});
  const minIncrement = 1250; // This should come from the auction data
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSlide, setPopupSlide] = useState(0);

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

  // Fetch seller name
  useEffect(() => {
    if (auction.seller?.id) {
      fetch(`https://rprauto.onrender.com/user/${auction.seller.id}/public`)
        .then(res => res.json())
        .then(data => setSellerName(data.DisplayName || 'Seller'))
        .catch(() => setSellerName('Seller'));
    }
  }, [auction.seller?.id]);

  // Fetch bidder names
  useEffect(() => {
    const uniqueBidderIds = Array.from(new Set((auction.bidHistory || []).map(bid => bid.bidder.id)));
    const names = {};
    let isMounted = true;
    Promise.all(uniqueBidderIds.map(id =>
      fetch(`https://rprauto.onrender.com/user/${id}/public`)
        .then(res => res.json())
        .then(data => ({ id, name: data.DisplayName || 'Bidder' }))
        .catch(() => ({ id, name: 'Bidder' }))
    )).then(results => {
      if (isMounted) {
        results.forEach(({ id, name }) => {
          names[id] = name;
        });
        setBidderNames(names);
      }
    });
    return () => { isMounted = false; };
  }, [auction.bidHistory]);

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
    const token = Cookies.get('authToken');
    
    if (!token) {
      alert('Please log in to place a bid');
      return;
    }

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bidValue
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          Cookies.remove('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(responseData.message || 'Failed to place bid');
      }

      // Update local state or trigger a refresh
      setBidAmount('');
      alert(`Bid of $${bidValue.toLocaleString()} placed successfully!`);
      
      // Refresh the bid data
      window.location.reload();
    } catch (error) {
      console.error('Error placing bid:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        auctionId: auction.id,
        bidAmount: bidValue
      });
      alert(error.message || 'Failed to place bid. Please try again.');
    }
  };

  const handleInstantBuy = async (e) => {
    e.stopPropagation();
    const token = Cookies.get('authToken');
    
    if (!token) {
      alert('Please log in to buy this car');
      return;
    }

    if (!auction.instantBuy) return;

    if (!confirm(`Are you sure you want to buy this car for $${auction.instantBuy.toLocaleString()}?`)) {
      return;
    }

    try {

      const response = await fetch(`https://rprauto.onrender.com/bid/${auction.id}/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: auction.instantBuy
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          Cookies.remove('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(responseData.message || 'Failed to place instant buy bid');
      }

      alert(`Congratulations! You've purchased the car for $${auction.instantBuy.toLocaleString()}`);
      window.location.reload();
    } catch (error) {
      console.error('Error placing instant buy bid:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        auctionId: auction.id,
        instantBuyAmount: auction.instantBuy
      });
      alert(error.message || 'Failed to place instant buy bid. Please try again.');
    }
  };

  const handleImageClick = (imageUrl, index, e) => {
    e.stopPropagation();
    setPopupSlide(index);
    setPopupOpen(true);
  };

  const closePopup = () => setPopupOpen(false);

  const popupNext = (e) => {
    e.stopPropagation();
    setPopupSlide((popupSlide + 1) % auction.images.length);
  };
  const popupPrev = (e) => {
    e.stopPropagation();
    setPopupSlide((popupSlide - 1 + auction.images.length) % auction.images.length);
  };

  const popupOverlay = popupOpen ? ReactDOM.createPortal(
    <div className="image-popup-overlay image-popup-blur" onClick={closePopup}>
      <div className="image-popup-modal" onClick={e => e.stopPropagation()}>
        <img
          src={auction.images[popupSlide].startsWith('http') ? auction.images[popupSlide] : `https://rprauto.onrender.com${auction.images[popupSlide]}`}
          alt="Car"
          className="image-popup-img image-popup-img-large"
        />
        {auction.images.length > 1 && (
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
    <>
      <div className={`card flip-wrapper ${isFlipped ? 'flipped' : ''}`} id="flipCard">
        <div className="card-inner">
          <div className="card-front">
            <div className="fullscreen-icon">
              <button
                className="fullscreen-btn"
                onClick={e => handleImageClick(auction.images[currentSlide], currentSlide, e)}
                title="View Image Fullscreen"
              >
                <i className="fas fa-expand"></i>
              </button>
            </div>
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
                      <p className="car-year">Year: {auction.year}</p>
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
                      {sellerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="seller-label">Sold by</span>
                      <span className="seller-name">{sellerName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Image Popup Overlay (Portal) */}
            {popupOverlay}
          </div>

          <div className="card-back">
            <div className="auction-header">
              <h2 className="auction-title">Auction for {auction.title}</h2>
              <div className="time-remaining">
                <i className="fas fa-clock"></i> {timeRemaining}
              </div>
            </div>
            
            <div className="bid-history">
              {auction.bidHistory.map((bid, index) => {
                const name = bidderNames[bid.bidder.id] || 'Bidder';
                return (
                  <div key={index} className="bid-item">
                    <div className="bidder-info">
                      <div className="bidder-avatar">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="bidder-name">{name}</div>
                        <div className="bid-time">{bid.time}</div>
                      </div>
                    </div>
                    <div className="bid-amount-small">${bid.amount.toLocaleString()}</div>
                  </div>
                );
              })}
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

            {auction.instantBuy && (
              <div className="instant-buy-section">
                <div className="instant-buy-label">INSTANT BUY PRICE</div>
                <div className="instant-buy-amount">${auction.instantBuy.toLocaleString()}</div>
                <button className="instant-buy-button" onClick={handleInstantBuy}>
                  BUY NOW
                </button>
              </div>
            )}
            
            <button className="back-button" onClick={() => setIsFlipped(false)}>
              BACK TO CAR DETAILS
            </button>
          </div>
        </div>
      </div>
      {popupOverlay}
    </>
  );
};

export default AuctionCard; 
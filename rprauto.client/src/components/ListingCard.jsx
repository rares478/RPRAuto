import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles/card.css';
import ReviewModal from './ReviewModal';
import Cookies from 'js-cookie';

const ListingCard = ({ car }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupSlide, setPopupSlide] = useState(0);
    const [sellerInfoOpen, setSellerInfoOpen] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        if (!car?.sellerId) {
            setSellerInfo(null);
            return;
        }

        const fetchSellerInfo = async () => {
            try {
                const response = await fetch(`https://rprauto-ajdq.onrender.com/user/${car.sellerId}/public`);
                if (!response.ok) {
                    throw new Error('Failed to fetch seller info');
                }
                const data = await response.json();
                setSellerInfo(data);
            } catch (error) {
                console.error('Error fetching seller info:', error);
                setSellerInfo(null);
            }
        };

        fetchSellerInfo();
    }, [car]);

    const handleReviewSubmit = async (rating) => {
        const token = Cookies.get('authToken');
        if (!token) {
            alert('Please log in to leave a review');
            return;
        }

        try {
            const response = await fetch('https://rprauto-ajdq.onrender.com/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId: car.id,
                    transactionType: 0, // 0 for Listing
                    rating: rating
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit review');
            }

            alert('Thank you for your review!');
            // Refresh seller info to update rating
            fetch(`https://rprauto-ajdq.onrender.com/user/${car.sellerId}/public`)
                .then(res => res.json())
                .then(data => setSellerInfo(data))
                .catch(() => setSellerInfo(null));
        } catch (error) {
            alert(error.message);
        }
    };

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
                <img src={car.images[popupSlide].startsWith('http') ? car.images[popupSlide] : `https://rprauto-ajdq.onrender.com${car.images[popupSlide]}`} alt="Car" className="image-popup-img image-popup-img-large" />
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

    const handlePurchase = async (e) => {
        e.stopPropagation();
        
        const token = Cookies.get('authToken');
        if (!token) {
            alert('Please log in to purchase this vehicle');
            return;
        }

        // Get the current user's ID from the token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = tokenData.sub;

        // Check if user is trying to buy their own listing
        if (currentUserId === car.sellerId) {
            alert('You cannot purchase your own listing');
            return;
        }

        if (!window.confirm(`Are you sure you want to purchase this ${car.make} ${car.model} for $${car.price.toLocaleString()}?`)) {
            return;
        }

        setIsPurchasing(true);
        try {
            console.log('Current User ID:', currentUserId);
            console.log('Car ID:', car.id);
            const response = await fetch(`https://rprauto-ajdq.onrender.com/listing/${car.id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    UserId: currentUserId,
                    ListingId: car.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to purchase vehicle');
            }

            alert('Congratulations! The vehicle has been purchased successfully.');
            // Update the car's status locally instead of reloading
            car.status = 'Sold';
            // Refresh seller info to ensure we have the latest data
            if (car.sellerId) {
                const sellerResponse = await fetch(`https://rprauto-ajdq.onrender.com/user/${car.sellerId}/public`);
                if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    setSellerInfo(sellerData);
                }
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="car-card-container">
            <div className={`car-card-modern${isFlipped ? ' flipped' : ''}`} onClick={flipCard}>
                {/* FRONT */}
                <div className="car-card-front-modern">
                    <div className="car-slideshow-modern">
                        {car.images.map((image, index) => {
                            const imageUrl = image.startsWith('http') ? image : `https://rprauto-ajdq.onrender.com${image}`;
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
                        <button 
                            className="buy-button-modern" 
                            onClick={handlePurchase}
                            disabled={isPurchasing || car.status === 'Sold'}
                            style={{
                                opacity: isPurchasing || car.status === 'Sold' ? 0.7 : 1,
                                cursor: isPurchasing || car.status === 'Sold' ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isPurchasing ? 'Processing...' : car.status === 'Sold' ? 'Sold' : 'Buy Now'}
                        </button>
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
                    <div className="card-back-actions">
                        <button
                            className="seller-info-button-modern"
                            onClick={e => { e.stopPropagation(); setSellerInfoOpen(true); }}
                        >
                            Seller Info
                        </button>
                        <div className="flip-indicator-modern" onClick={flipCard}>⟵ Back</div>
                    </div>
                </div>
            </div>
            {popupOverlay}
            {sellerInfoOpen && ReactDOM.createPortal(
                <div className="seller-info-popup-overlay" onClick={() => setSellerInfoOpen(false)}>
                    <div className="seller-info-popup-modal" onClick={e => e.stopPropagation()}>
                        <button className="seller-info-popup-close" onClick={() => setSellerInfoOpen(false)}>&times;</button>
                        <h3>Seller Info</h3>
                        {sellerInfo ? (
                            <div className="seller-info-modern">
                                <div><b>Name:</b> {sellerInfo.displayName || sellerInfo.DisplayName}</div>
                                <div><b>Phone:</b> {sellerInfo.PhoneNumber || car.phone}</div>
                                <div><b>City:</b> {sellerInfo.city || sellerInfo.City}</div>
                                <div><b>Rating:</b> {sellerInfo.rating?.toFixed(1) ?? 0} ⭐</div>
                                {car.status === 'Sold' && (
                                    <button 
                                        className="review-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowReviewModal(true);
                                        }}
                                    >
                                        Leave a Review
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="seller-info-modern">Seller info not available.</div>
                        )}
                    </div>
                </div>,
                document.body
            )}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleReviewSubmit}
                sellerName={sellerInfo?.displayName || sellerInfo?.DisplayName || 'the seller'}
            />
        </div>
    );
};

export default ListingCard; 
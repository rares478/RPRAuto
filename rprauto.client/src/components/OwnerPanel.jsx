import React from 'react';
import './styles/ownerPanel.css';

const OwnerPanel = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal owner-panel">
            <div className="modal-content owner-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Owner Control Panel</h2>
                
                <div className="owner-sections">
                    <div className="owner-section">
                        <h3><i className="fas fa-palette"></i> Site Customization</h3>
                        <div className="owner-controls">
                            <div className="control-group">
                                <label>Site Title</label>
                                <input type="text" id="siteTitle" className="form-input" defaultValue="RPR Auto" />
                                <button className="btn btn-sm btn-primary">Update</button>
                            </div>
                            <div className="control-group">
                                <label>Hero Title</label>
                                <input type="text" id="heroTitle" className="form-input" defaultValue="Find Your Dream Car" />
                                <button className="btn btn-sm btn-primary">Update</button>
                            </div>
                            <div className="control-group">
                                <label>Hero Subtitle</label>
                                <input type="text" id="heroSubtitle" className="form-input" defaultValue="Buy, sell, and bid on premium vehicles in our trusted marketplace" />
                                <button className="btn btn-sm btn-primary">Update</button>
                            </div>
                        </div>
                    </div>

                    <div className="owner-section">
                        <h3><i className="fas fa-chart-bar"></i> Site Statistics</h3>
                        <div className="owner-controls">
                            <div className="stats-grid">
                                <div className="stat-control">
                                    <label>Active Users</label>
                                    <input type="text" id="activeUsers" className="form-input" defaultValue="50K+" />
                                    <button className="btn btn-sm btn-primary">Update</button>
                                </div>
                                <div className="stat-control">
                                    <label>Cars Sold</label>
                                    <input type="text" id="carsSold" className="form-input" defaultValue="15K+" />
                                    <button className="btn btn-sm btn-primary">Update</button>
                                </div>
                                <div className="stat-control">
                                    <label>Live Auctions</label>
                                    <input type="text" id="liveAuctions" className="form-input" defaultValue="24/7" />
                                    <button className="btn btn-sm btn-primary">Update</button>
                                </div>
                                <div className="stat-control">
                                    <label>Satisfaction Rate</label>
                                    <input type="text" id="satisfactionRate" className="form-input" defaultValue="98%" />
                                    <button className="btn btn-sm btn-primary">Update</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="owner-section">
                        <h3><i className="fas fa-cog"></i> Site Management</h3>
                        <div className="owner-controls">
                            <button className="btn btn-primary">
                                <i className="fas fa-tools"></i>
                                Toggle Maintenance Mode
                            </button>
                            <button className="btn btn-outline">
                                <i className="fas fa-sync"></i>
                                Clear Site Cache
                            </button>
                            <button className="btn btn-outline">
                                <i className="fas fa-download"></i>
                                Export User Data
                            </button>
                            <button className="btn btn-outline">
                                <i className="fas fa-file-alt"></i>
                                View Site Logs
                            </button>
                        </div>
                    </div>

                    <div className="owner-section">
                        <h3><i className="fas fa-users"></i> User Management</h3>
                        <div className="owner-controls">
                            <div className="user-search">
                                <input type="text" placeholder="Search users..." className="form-input" />
                                <button className="btn btn-primary">Search</button>
                            </div>
                            <div className="user-actions">
                                <button className="btn btn-outline">View All Users</button>
                                <button className="btn btn-outline">Reported Users</button>
                                <button className="btn btn-outline">Active Auctions</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPanel; 
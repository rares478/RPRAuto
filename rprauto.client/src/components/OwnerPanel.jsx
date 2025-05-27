import React, { useState, useEffect } from 'react';
import './styles/ownerPanel.css';
import Cookies from 'js-cookie';

const OwnerPanel = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        siteTitle: '',
        heroTitle: '',
        heroSubtitle: '',
        activeUsers: '',
        carsSold: '',
        liveAuctions: '',
        satisfactionRate: '',
        maintenanceMode: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        try {
            const response = await fetch('https://rprauto.onrender.com/api/sitesettings');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load settings');
            }
            
            const data = await response.json();
            setSettings({
                siteTitle: data.siteTitle || '',
                heroTitle: data.heroTitle || '',
                heroSubtitle: data.heroSubtitle || '',
                activeUsers: data.activeUsers || '0',
                carsSold: data.carsSold || '0',
                liveAuctions: data.liveAuctions || '0',
                satisfactionRate: data.satisfactionRate || '0',
                maintenanceMode: data.maintenanceMode || false
            });
        } catch (error) {
            console.error('Error loading settings:', error);
            showMessage(error.message || 'Failed to load settings', 'error');
        }
    };

    const handleCustomizationUpdate = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showMessage('Authentication token not found. Please log in again.', 'error');
                return;
            }

            const response = await fetch('https://rprauto.onrender.com/api/sitesettings/customization', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    siteTitle: settings.siteTitle,
                    heroTitle: settings.heroTitle,
                    heroSubtitle: settings.heroSubtitle
                })
            });

            if (response.ok) {
                showMessage('Site customization updated successfully', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update customization');
            }
        } catch (error) {
            console.error('Error updating customization:', error);
            showMessage(error.message || 'Failed to update customization', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatisticsUpdate = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showMessage('Authentication token not found. Please log in again.', 'error');
                return;
            }

            const response = await fetch('https://rprauto.onrender.com/api/sitesettings/statistics', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activeUsers: settings.activeUsers,
                    carsSold: settings.carsSold,
                    liveAuctions: settings.liveAuctions,
                    satisfactionRate: settings.satisfactionRate
                })
            });

            if (response.ok) {
                showMessage('Site statistics updated successfully', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update statistics');
            }
        } catch (error) {
            console.error('Error updating statistics:', error);
            showMessage(error.message || 'Failed to update statistics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMaintenanceToggle = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                showMessage('Authentication token not found. Please log in again.', 'error');
                return;
            }

            const response = await fetch('https://rprauto.onrender.com/api/sitesettings/maintenance', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(!settings.maintenanceMode)
            });

            if (response.ok) {
                setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
                showMessage(`Maintenance mode ${!settings.maintenanceMode ? 'enabled' : 'disabled'} successfully`, 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to toggle maintenance mode');
            }
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            showMessage(error.message || 'Failed to toggle maintenance mode', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="owner-panel">
            <div className="owner-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Owner Control Panel</h2>
                
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="owner-sections">
                    <div className="owner-section">
                        <h3><i className="fas fa-palette"></i> Site Customization</h3>
                        <div className="owner-controls">
                            <div className="control-group">
                                <label>Site Title</label>
                                <input 
                                    type="text" 
                                    value={settings.siteTitle}
                                    onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                                    className="form-input" 
                                />
                            </div>
                            <div className="control-group">
                                <label>Hero Title</label>
                                <input 
                                    type="text" 
                                    value={settings.heroTitle}
                                    onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                                    className="form-input" 
                                />
                            </div>
                            <div className="control-group">
                                <label>Hero Subtitle</label>
                                <input 
                                    type="text" 
                                    value={settings.heroSubtitle}
                                    onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                                    className="form-input" 
                                />
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={handleCustomizationUpdate}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Update Customization'}
                            </button>
                        </div>
                    </div>

                    <div className="owner-section">
                        <h3><i className="fas fa-chart-bar"></i> Site Statistics</h3>
                        <div className="owner-controls">
                            <div className="stats-grid">
                                <div className="stat-control">
                                    <label>Active Users</label>
                                    <input 
                                        type="text" 
                                        value={settings.activeUsers}
                                        onChange={(e) => setSettings(prev => ({ ...prev, activeUsers: e.target.value }))}
                                        className="form-input" 
                                    />
                                </div>
                                <div className="stat-control">
                                    <label>Cars Sold</label>
                                    <input 
                                        type="text" 
                                        value={settings.carsSold}
                                        onChange={(e) => setSettings(prev => ({ ...prev, carsSold: e.target.value }))}
                                        className="form-input" 
                                    />
                                </div>
                                <div className="stat-control">
                                    <label>Live Auctions</label>
                                    <input 
                                        type="text" 
                                        value={settings.liveAuctions}
                                        onChange={(e) => setSettings(prev => ({ ...prev, liveAuctions: e.target.value }))}
                                        className="form-input" 
                                    />
                                </div>
                                <div className="stat-control">
                                    <label>Satisfaction Rate</label>
                                    <input 
                                        type="text" 
                                        value={settings.satisfactionRate}
                                        onChange={(e) => setSettings(prev => ({ ...prev, satisfactionRate: e.target.value }))}
                                        className="form-input" 
                                    />
                                </div>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={handleStatisticsUpdate}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Update Statistics'}
                            </button>
                        </div>
                    </div>

                    <div className="owner-section">
                        <h3><i className="fas fa-cog"></i> Site Management</h3>
                        <div className="owner-controls">
                            <button 
                                className={`btn ${settings.maintenanceMode ? 'btn-danger' : 'btn-primary'}`}
                                onClick={handleMaintenanceToggle}
                                disabled={isLoading}
                            >
                                <i className="fas fa-tools"></i>
                                {settings.maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
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
import React, { createContext, useState, useContext, useEffect } from 'react';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext);
    if (!context) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
};

export const SiteSettingsProvider = ({ children }) => {
    const [siteSettings, setSiteSettings] = useState({
        siteTitle: 'RPR Auto',
        heroTitle: 'Find Your Dream Car',
        heroSubtitle: 'Buy, sell, and bid on premium vehicles in our trusted marketplace',
        activeUsers: '0',
        carsSold: '0',
        liveAuctions: '0',
        satisfactionRate: '0'
    });

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

    useEffect(() => {
        loadSiteSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ siteSettings, loadSiteSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}; 
using MongoDB.Driver;
using RPRAuto.Server.Models;
using RPRAuto.Server.Interfaces;

namespace RPRAuto.Server.Repositories
{
    public class SiteSettingsRepository : ISiteSettingsRepository
    {
        private readonly IMongoCollection<SiteSettings> _siteSettings;

        public SiteSettingsRepository(IMongoDatabase database)
        {
            _siteSettings = database.GetCollection<SiteSettings>("siteSettings");
        }

        public async Task<SiteSettings> GetSettingsAsync()
        {
            var settings = await _siteSettings.Find(_ => true).FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SiteSettings();
                await _siteSettings.InsertOneAsync(settings);
            }
            return settings;
        }

        public async Task UpdateCustomizationAsync(string siteTitle, string heroTitle, string heroSubtitle)
        {
            var update = Builders<SiteSettings>.Update
                .Set(s => s.SiteTitle, siteTitle)
                .Set(s => s.HeroTitle, heroTitle)
                .Set(s => s.HeroSubtitle, heroSubtitle)
                .Set(s => s.LastUpdated, DateTime.UtcNow);

            await _siteSettings.UpdateOneAsync(_ => true, update);
        }

        public async Task UpdateStatisticsAsync(string activeUsers, string carsSold, string liveAuctions, string satisfactionRate)
        {
            var update = Builders<SiteSettings>.Update
                .Set(s => s.ActiveUsers, activeUsers)
                .Set(s => s.CarsSold, carsSold)
                .Set(s => s.LiveAuctions, liveAuctions)
                .Set(s => s.SatisfactionRate, satisfactionRate)
                .Set(s => s.LastUpdated, DateTime.UtcNow);

            await _siteSettings.UpdateOneAsync(_ => true, update);
        }

        public async Task ToggleMaintenanceModeAsync(bool maintenanceMode)
        {
            var update = Builders<SiteSettings>.Update
                .Set(s => s.MaintenanceMode, maintenanceMode)
                .Set(s => s.LastUpdated, DateTime.UtcNow);

            await _siteSettings.UpdateOneAsync(_ => true, update);
        }
    }
} 
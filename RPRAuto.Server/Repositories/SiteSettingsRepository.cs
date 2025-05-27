using MongoDB.Driver;
using RPRAuto.Server.Models;
using RPRAuto.Server.Interfaces;

namespace RPRAuto.Server.Repositories
{
    public class SiteSettingsRepository : MongoRepository<SiteSettings>, ISiteSettingsRepository
    {
        public SiteSettingsRepository(IMongoClient mongoClient) 
            : base(mongoClient, "RPR", "SiteSettings")
        {
        }

        public async Task<SiteSettings> GetSettingsAsync()
        {
            var settings = await _collection.Find(_ => true).FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SiteSettings
                {
                    SiteTitle = "RPR Auto",
                    HeroTitle = "Welcome to RPR Auto",
                    HeroSubtitle = "Your trusted platform for car auctions",
                    ActiveUsers = "0",
                    CarsSold = "0",
                    LiveAuctions = "0",
                    SatisfactionRate = "0",
                    MaintenanceMode = false,
                    LastUpdated = DateTime.UtcNow
                };
                await _collection.InsertOneAsync(settings);
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

            await _collection.UpdateOneAsync(_ => true, update);
        }

        public async Task UpdateStatisticsAsync(string activeUsers, string carsSold, string liveAuctions, string satisfactionRate)
        {
            var update = Builders<SiteSettings>.Update
                .Set(s => s.ActiveUsers, activeUsers)
                .Set(s => s.CarsSold, carsSold)
                .Set(s => s.LiveAuctions, liveAuctions)
                .Set(s => s.SatisfactionRate, satisfactionRate)
                .Set(s => s.LastUpdated, DateTime.UtcNow);

            await _collection.UpdateOneAsync(_ => true, update);
        }

        public async Task ToggleMaintenanceModeAsync(bool maintenanceMode)
        {
            var update = Builders<SiteSettings>.Update
                .Set(s => s.MaintenanceMode, maintenanceMode)
                .Set(s => s.LastUpdated, DateTime.UtcNow);

            await _collection.UpdateOneAsync(_ => true, update);
        }
    }
} 
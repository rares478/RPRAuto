using RPRAuto.Server.Models;

namespace RPRAuto.Server.Interfaces
{
    public interface ISiteSettingsRepository
    {
        Task<SiteSettings> GetSettingsAsync();
        Task UpdateCustomizationAsync(string siteTitle, string heroTitle, string heroSubtitle);
        Task UpdateStatisticsAsync(string activeUsers, string carsSold, string liveAuctions, string satisfactionRate);
        Task ToggleMaintenanceModeAsync(bool maintenanceMode);
    }
} 
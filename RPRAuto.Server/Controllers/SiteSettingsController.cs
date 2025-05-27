using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPRAuto.Server.Models;
using RPRAuto.Server.Repositories;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteSettingsController : ControllerBase
    {
        private readonly SiteSettingsRepository _siteSettingsRepository;

        public SiteSettingsController(SiteSettingsRepository siteSettingsRepository)
        {
            _siteSettingsRepository = siteSettingsRepository;
        }

        [HttpGet]
        public async Task<ActionResult<SiteSettings>> GetSiteSettings()
        {
            var settings = await _siteSettingsRepository.GetSettingsAsync();
            return Ok(settings);
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("customization")]
        public async Task<IActionResult> UpdateCustomization([FromBody] SiteSettings settings)
        {
            await _siteSettingsRepository.UpdateCustomizationAsync(
                settings.SiteTitle,
                settings.HeroTitle,
                settings.HeroSubtitle
            );
            return Ok(new { message = "Site customization updated successfully" });
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("statistics")]
        public async Task<IActionResult> UpdateStatistics([FromBody] SiteSettings settings)
        {
            await _siteSettingsRepository.UpdateStatisticsAsync(
                settings.ActiveUsers,
                settings.CarsSold,
                settings.LiveAuctions,
                settings.SatisfactionRate
            );
            return Ok(new { message = "Site statistics updated successfully" });
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("maintenance")]
        public async Task<IActionResult> ToggleMaintenanceMode([FromBody] bool maintenanceMode)
        {
            await _siteSettingsRepository.ToggleMaintenanceModeAsync(maintenanceMode);
            return Ok(new { message = $"Maintenance mode {(maintenanceMode ? "enabled" : "disabled")} successfully" });
        }
    }
} 
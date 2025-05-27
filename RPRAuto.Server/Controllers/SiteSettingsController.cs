using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPRAuto.Server.Models;
using RPRAuto.Server.Interfaces;
using System.Security.Claims;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteSettingsController : ControllerBase
    {
        private readonly ISiteSettingsRepository _siteSettingsRepository;
        private readonly ILogger<SiteSettingsController> _logger;

        public SiteSettingsController(
            ISiteSettingsRepository siteSettingsRepository, 
            ILogger<SiteSettingsController> logger)
        {
            _siteSettingsRepository = siteSettingsRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<SiteSettings>> GetSiteSettings()
        {
            try
            {
                var settings = await _siteSettingsRepository.GetSettingsAsync();
                if (settings == null)
                {
                    _logger.LogWarning("No site settings found");
                    return NotFound(new { message = "Site settings not found" });
                }
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving site settings");
                return StatusCode(500, new { message = "An error occurred while retrieving site settings" });
            }
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("customization")]
        public async Task<IActionResult> UpdateCustomization([FromBody] SiteSettings settings)
        {
            try
            {
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim == null || roleClaim.Value != "2")
                {
                    _logger.LogWarning("User does not have owner role");
                    return Forbid();
                }

                await _siteSettingsRepository.UpdateCustomizationAsync(
                    settings.SiteTitle,
                    settings.HeroTitle,
                    settings.HeroSubtitle
                );
                return Ok(new { message = "Site customization updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating site customization");
                return StatusCode(500, new { message = "An error occurred while updating site customization" });
            }
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("statistics")]
        public async Task<IActionResult> UpdateStatistics([FromBody] SiteSettings settings)
        {
            try
            {
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim == null || roleClaim.Value != "2")
                {
                    _logger.LogWarning("User does not have owner role");
                    return Forbid();
                }

                await _siteSettingsRepository.UpdateStatisticsAsync(
                    settings.ActiveUsers,
                    settings.CarsSold,
                    settings.LiveAuctions,
                    settings.SatisfactionRate
                );
                return Ok(new { message = "Site statistics updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating site statistics");
                return StatusCode(500, new { message = "An error occurred while updating site statistics" });
            }
        }

        [Authorize(Roles = "2")] // Only owner can update settings
        [HttpPut("maintenance")]
        public async Task<IActionResult> ToggleMaintenanceMode([FromBody] bool maintenanceMode)
        {
            try
            {
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                if (roleClaim == null || roleClaim.Value != "2")
                {
                    _logger.LogWarning("User does not have owner role");
                    return Forbid();
                }

                await _siteSettingsRepository.ToggleMaintenanceModeAsync(maintenanceMode);
                return Ok(new { message = $"Maintenance mode {(maintenanceMode ? "enabled" : "disabled")} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling maintenance mode");
                return StatusCode(500, new { message = "An error occurred while toggling maintenance mode" });
            }
        }
    }
} 
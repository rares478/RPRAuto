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

        [Authorize(Roles = "2,Admin")] // Allow both owner (2) and admin roles
        [HttpPut("customization")]
        public async Task<IActionResult> UpdateCustomization([FromBody] SiteSettings settings)
        {
            try
            {
                _logger.LogInformation("Attempting to update site customization");
                
                // Log all claims for debugging
                var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}");
                _logger.LogInformation("User claims: {Claims}", string.Join(", ", claims));

                var roleClaim = User.FindFirst(ClaimTypes.Role);
                _logger.LogInformation("User role claim: {Role}", roleClaim?.Value);

                if (roleClaim == null)
                {
                    _logger.LogWarning("No role claim found in token");
                    return Forbid("No role claim found in token");
                }

                // Check for valid roles
                if (roleClaim.Value != "2" && roleClaim.Value != "Owner" && roleClaim.Value != "Admin")
                {
                    _logger.LogWarning("User does not have required role. Current role: {Role}", roleClaim.Value);
                    return Forbid($"User does not have required role. Current role: {roleClaim.Value}");
                }

                _logger.LogInformation("Updating customization with values: SiteTitle={SiteTitle}, HeroTitle={HeroTitle}, HeroSubtitle={HeroSubtitle}",
                    settings.SiteTitle, settings.HeroTitle, settings.HeroSubtitle);

                await _siteSettingsRepository.UpdateCustomizationAsync(
                    settings.SiteTitle,
                    settings.HeroTitle,
                    settings.HeroSubtitle
                );

                _logger.LogInformation("Site customization updated successfully");
                return Ok(new { message = "Site customization updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating site customization");
                return StatusCode(500, new { message = "An error occurred while updating site customization" });
            }
        }

        [Authorize(Roles = "2,Admin")] // Allow both owner (2) and admin roles
        [HttpPut("statistics")]
        public async Task<IActionResult> UpdateStatistics([FromBody] SiteSettings settings)
        {
            try
            {
                _logger.LogInformation("Attempting to update site statistics");
                
                var roleClaim = User.FindFirst(ClaimTypes.Role);
                _logger.LogInformation("User role claim: {Role}", roleClaim?.Value);

                if (roleClaim == null)
                {
                    _logger.LogWarning("No role claim found in token");
                    return Forbid("No role claim found in token");
                }

                if (roleClaim.Value != "2" && roleClaim.Value != "Admin")
                {
                    _logger.LogWarning("User does not have required role. Current role: {Role}", roleClaim.Value);
                    return Forbid($"User does not have required role. Current role: {roleClaim.Value}");
                }

                _logger.LogInformation("Updating statistics with values: ActiveUsers={ActiveUsers}, CarsSold={CarsSold}, LiveAuctions={LiveAuctions}, SatisfactionRate={SatisfactionRate}",
                    settings.ActiveUsers, settings.CarsSold, settings.LiveAuctions, settings.SatisfactionRate);

                await _siteSettingsRepository.UpdateStatisticsAsync(
                    settings.ActiveUsers,
                    settings.CarsSold,
                    settings.LiveAuctions,
                    settings.SatisfactionRate
                );

                var updatedSettings = await _siteSettingsRepository.GetSettingsAsync();
                _logger.LogInformation("Site statistics updated successfully");
                return Ok(updatedSettings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating site statistics");
                return StatusCode(500, new { message = "An error occurred while updating site statistics" });
            }
        }

        [Authorize(Roles = "2,Admin")] // Only owner can update settings
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
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using RPRAuto.Server.Models.Enums;
using RPRAuto.Server.Models.User;

namespace RPRAuto.Server.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserRepository userRepository, 
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ValidationException("Email and password are required");

            if (request.IsCompany && string.IsNullOrWhiteSpace(request.CompanyCUI))
                throw new ValidationException("Company CUI is required for company accounts");

            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                throw new ValidationException("User with this email already exists");

            // Create new user
            var user = new User
            {
                PrivateData = new PrivateUserData
                {
                    Login = new LoginDetails
                    {
                        Email = request.Email,
                        Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
                    },
                    Personal = new PersonalData
                    {
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Address = request.Address
                    }
                },
                PublicData = new PublicUserData
                {
                    DisplayName = request.FirstName + (request.LastName != null ? " " + request.LastName : ""),
                    PhoneNumber = request.PhoneNumber,
                    City = request.City,
                    Country = request.Country,
                    MemberSince = DateTime.UtcNow,
                    Rating = 0,
                    TotalSales = 0,
                    IsVerified = false
                },
                Role = request.IsCompany ? UserRole.Company : UserRole.User,
                CompanyCUI = request.IsCompany ? request.CompanyCUI : null,
                Listings = new List<ObjectId>(),
                Bids = new List<ObjectId>(),
                Review = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse 
            { 
                Message = "Registration successful", 
                Token = token,
                UserData = new LoginDetailsResponse
                {
                    Email = user.PrivateData.Login.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new AuthResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration");
            return StatusCode(500, new AuthResponse { Message = "An error occurred during registration" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ValidationException("Email and password are required");

            // Find user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
                throw new ValidationException("Invalid email or password");

            // Verify password
            if (!user.VerifyPassword(request.Password))
                throw new ValidationException("Invalid email or password");

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse 
            { 
                Message = "Login successful", 
                Token = token,
                UserData = new LoginDetailsResponse
                {
                    Email = user.PrivateData.Login.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new AuthResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user login");
            return StatusCode(500, new AuthResponse { Message = "An error occurred during login" });
        }
    }

    [HttpPost("validate")]
    public ActionResult<AuthResponse> Validate([FromBody] string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var rsa = EnvLoader.GetRsaPublicKey();
            var securityKey = new RsaSecurityKey(rsa);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                ClockSkew = TimeSpan.Zero
            };

            handler.ValidateToken(token, validationParameters, out var validatedToken);
            return Ok(new AuthResponse { Message = "Token is valid" });
        }
        catch (Exception)
        {
            return Unauthorized(new AuthResponse { Message = "Invalid token" });
        }
    }

    [HttpGet("role")]
    public ActionResult<AuthResponse> GetUserRole()
    {
        try
        {
            _logger.LogInformation("Getting user role from token");
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            if (roleClaim == null)
            {
                _logger.LogWarning("No role claim found in token");
                throw new UnauthorizedException("No role claim found in token");
            }

            _logger.LogInformation($"Role claim found: {roleClaim.Value}");
            var role = (int)Enum.Parse<UserRole>(roleClaim.Value);
            return Ok(new { role });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user role");
            return Unauthorized(new AuthResponse { Message = "Invalid token" });
        }
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Current and new password are required" });

            // Get user ID from JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null)
                return Unauthorized(new { message = "Invalid token" });

            var userId = MongoDB.Bson.ObjectId.Parse(userIdClaim.Value);
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Verify current password
            if (!user.VerifyPassword(request.CurrentPassword))
                return BadRequest(new { message = "Current password is incorrect" });

            // Hash new password
            var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            var updated = await _userRepository.UpdatePasswordAsync(userId, newHashedPassword);
            if (!updated)
                return StatusCode(500, new { message = "Failed to update password" });

            return Ok(new { message = "Password updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new { message = "An error occurred while changing password" });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var rsa = EnvLoader.GetRsaPrivateKey();
        var securityKey = new RsaSecurityKey(rsa);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.PrivateData.Login.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
} 
﻿using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RPRAuto.Server.Classes;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("register")]
    public class RegisterController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly ILogger<RegisterController> _logger;

        public RegisterController(IMongoClient mongoClient, ILogger<RegisterController> logger)
        {
            var database = mongoClient.GetDatabase("RPR");
            _usersCollection = database.GetCollection<User>("Users");
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] Register registerRequest)
        {
            try
            {
                if (registerRequest == null)
                {
                    return BadRequest(new { status = 400, message = "Invalid request body" });
                }

                if (string.IsNullOrEmpty(registerRequest.Email) || string.IsNullOrEmpty(registerRequest.Password))
                {
                    return BadRequest(new { status = 400, message = "Email and password are required" });
                }
                
                if (registerRequest.IsCompany && string.IsNullOrEmpty(registerRequest.CompanyCUI))
                {
                    return BadRequest(new { status = 400, message = "Company CUI is required for company accounts" });
                }
                
                // Check if email already exists
                var existingUser = await _usersCollection.Find(u => u.Login.Email == registerRequest.Email).FirstOrDefaultAsync();
                if (existingUser != null)
                {
                    return BadRequest(new { status = 400, message = "Email already exists" });
                }
                
                // Create new user
                var user = new User
                {
                    Login = new LoginDetails
                    {
                        Email = registerRequest.Email,
                        Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password)
                    },
                    Personal = new PersonalData
                    {
                        FirstName = registerRequest.FirstName ?? "",
                        PhoneNumber = registerRequest.PhoneNumber ?? "",
                        LastName = "",
                        Address = "",
                        City = "",
                        Country = ""
                    },
                    Role = registerRequest.IsCompany ? Role.Company : Role.Seller,
                    CompanyCUI = registerRequest.IsCompany ? registerRequest.CompanyCUI : null,
                    Listings = new List<ObjectId>(),
                    Bids = new List<ObjectId>()
                };

                await _usersCollection.InsertOneAsync(user);


                var token = GenerateJwtToken(user);
                return Ok(new { status = 200, message = "User registered successfully", token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { status = 500, message = "An error occurred during registration" });
            }
        }
        
        private string GenerateJwtToken(User user)
        {
            var privateKey = EnvLoader.GetRsaPrivateKey();
            var securityKey = new RsaSecurityKey(privateKey);

            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Login.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            var token = new JwtSecurityToken(
                issuer: "RPRAuto.Server",
                audience: "RPRAuto.Client",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RPRAuto.Server.Classes;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("login")]
    public class LoginController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;

        public LoginController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("RPR");
            _usersCollection = database.GetCollection<User>("Users");
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] Login loginRequest)
        {
            var user = await _usersCollection.Find(u => u.Login.Email == loginRequest.Email).FirstOrDefaultAsync();

            if (user == null || !user.VerifyPassword(loginRequest.Password))
            {
                return Unauthorized(new { status = 401 ,message = "Invalid email or password" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new { status = 200, token });
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
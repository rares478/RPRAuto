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
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _usersCollection.Find(u => u.Username == loginRequest.Username).FirstOrDefaultAsync();

            if (user == null || !user.VerifyPassword(loginRequest.Password))
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var privateKey = EnvLoader.GetRsaPrivateKey();
            var securityKey = new RsaSecurityKey(privateKey);

            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
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

    public class User : IUser
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public int UserId { get; set; }
        public Role role { get; set; }
        public List<int> listings { get; set; } = new List<int>();
        public List<int> bids { get; set; } = new List<int>();
        public Dictionary<int, string> reviews { get; set; } = new Dictionary<int, string>();
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, Password);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
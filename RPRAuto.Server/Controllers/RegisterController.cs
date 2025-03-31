using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RPRAuto.Server.Classes;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("register")]
    public class RegisterController : ControllerBase
    {
        private readonly IMongoCollection<IUser> _usersCollection;

        public RegisterController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("RPR");
            _usersCollection = database.GetCollection<IUser>("Users");
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            // Check if username already exists
            var existingUser = await _usersCollection.Find(u => u.Username == registerRequest.Username).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return Conflict(new { message = "Username already exists" });
            }

            // Check if email already exists
            existingUser = await _usersCollection.Find(u => u.Email == registerRequest.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return Conflict(new { message = "Email already exists" });
            }

            // Create new user
            var user = new User
            {
                Username = registerRequest.Username,
                Email = registerRequest.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
                FirstName = registerRequest.FirstName,
                LastName = registerRequest.LastName,
                PhoneNumber = registerRequest.PhoneNumber,
                Address = registerRequest.Address,
                City = registerRequest.City,
                Country = registerRequest.Country
            };

            await _usersCollection.InsertOneAsync(user);

            return Ok(new { message = "User registered successfully" });
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
    }
    
    public class User : IUser
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public int UserId { get; set; }
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
}
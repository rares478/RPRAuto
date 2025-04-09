using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using RPRAuto.Server.Classes;

namespace RPRAuto.Server.Controllers
{
    [ApiController]
    [Route("register")]
    public class RegisterController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;

        public RegisterController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("RPR");
            _usersCollection = database.GetCollection<User>("Users");
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
                Country = registerRequest.Country,
                UserId = await GetNextUserId(),
                role = registerRequest.Role,
                listings = new List<int>(),
                bids = new List<int>(),
                reviews = new Dictionary<int, string>()
            };

            await _usersCollection.InsertOneAsync(user);

            return Ok(new { message = "User registered successfully" });
        }

        private async Task<int> GetNextUserId()
        {
            // Find the highest UserId and increment by 1
            var highestUser = await _usersCollection.Find(_ => true)
                .SortByDescending(u => u.UserId)
                .FirstOrDefaultAsync();

            return (highestUser?.UserId ?? 0) + 1;
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
        public Role Role { get; set; } = Role.Seller; // Default role
    }
}
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
        public async Task<IActionResult> Register([FromBody] Register registerRequest)
        {
            
            if (string.IsNullOrEmpty(registerRequest.Email) || string.IsNullOrEmpty(registerRequest.Password))
            {
                return BadRequest(new {status = 400, message = "Email and password are required" });
            }
            
            if (registerRequest.IsCompany && string.IsNullOrEmpty(registerRequest.CompanyCUI))
            {
                return BadRequest(new { status = 400, message = "Company CUI is required for company accounts" });
            }
            
            // Check if email already exists
            var existingUser = await _usersCollection.Find(u => u.Email == registerRequest.Email).FirstOrDefaultAsync();
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
                    FirstName = registerRequest.FirstName,
                    PhoneNumber = registerRequest.PhoneNumber,
                    // Set other fields to empty strings
                    LastName = "",
                    Address = "",
                    City = "",
                    Country = ""
                },
                Role = registerRequest.IsCompany ? Role.Company : Role.Seller,
                CompanyCUI = registerRequest.IsCompany ? registerRequest.CompanyCUI : null
            };

            await _usersCollection.InsertOneAsync(user);

            return Ok(new { status = 200, message = "User registered successfully" });
        }
    }
}
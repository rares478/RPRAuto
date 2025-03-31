﻿namespace RPRAuto.Server.Classes;

public interface IUser
{
    string Username { get; set; }
    string Password { get; set; }
    int UserId { get; set; }
    string Email { get; set; }
    string FirstName { get; set; }
    string LastName { get; set; }
    string PhoneNumber { get; set; }
    string Address { get; set; }
    string City { get; set; }
    string Country { get; set; }
    bool VerifyPassword(string password);
}

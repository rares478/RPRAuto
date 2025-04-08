﻿using Microsoft.Win32.SafeHandles;

 namespace RPRAuto.Server.Classes;

interface IUser
{
    class PersonalData
    {
        private string FirstName { get; set; }
        private string LastName { get; set; }
        private string PhoneNumber { get; set; }
        private string Address { get; set; }
        private string City { get; set; }
        private string Country { get; set; }
    }
    class LoginDetails
    {
        private string Username { get; set; }
        private string Password { get; set; }
    }
    int UserId { get; set; }
    Role role { get; set; }
    List<int> listings { get; set; }
    List<int> bids { get; set; }
    Dictionary<int, string> reviews { get; set; }
    
    bool VerifyPassword(string password);
}
 
 public enum Role{
    Admin,
    Seller,
    Company
 }

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RPRAuto.Server;
using RPRAuto.Server.Extensions;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Repositories;
using RPRAuto.Server.Models.Car;
using MongoDB.Bson.Serialization;
using RPRAuto.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Register MongoDB class maps
if (!BsonClassMap.IsClassMapRegistered(typeof(Car)))
{
    BsonClassMap.RegisterClassMap<Car>(cm =>
    {
        cm.AutoMap();
        cm.SetIsRootClass(true);
        cm.MapProperty(c => c.Make).SetElementName("make");
        cm.MapProperty(c => c.Model).SetElementName("model");
        cm.MapProperty(c => c.Year).SetElementName("year");
        cm.MapProperty(c => c.Mileage).SetElementName("mileage");
        cm.MapProperty(c => c.Color).SetElementName("color");
        cm.MapProperty(c => c.GearboxType).SetElementName("gearboxType");
        cm.MapProperty(c => c.FuelType).SetElementName("fuelType");
        cm.MapProperty(c => c.BodyType).SetElementName("bodyType");
        cm.MapProperty(c => c.EngineSize).SetElementName("engineSize");
        cm.MapProperty(c => c.HorsePower).SetElementName("horsePower");
        cm.MapProperty(c => c.Pictures).SetElementName("pictures");
    });
}

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddOpenApi();

// Configure MongoDB
builder.Services.AddSingleton<MongoDB.Driver.IMongoClient>(sp =>
    new MongoDB.Driver.MongoClient(builder.Configuration.GetConnectionString("MongoDB")));

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IListingRepository, ListingRepository>();
builder.Services.AddScoped<IBidRepository, BidRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ISiteSettingsRepository, SiteSettingsRepository>();
builder.Services.AddScoped<IReview,ReviewRepository>();
builder.Services.AddHostedService<BidCompletionService>();

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var rsa = EnvLoader.GetRsaPublicKey();
        var securityKey = new RsaSecurityKey(rsa);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = securityKey,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("Authentication failed: {Error}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("Token validated successfully");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Challenge issued: {Error}", context.Error);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        /*
        policy.WithOrigins("https://rpr-auto.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        
        policy.WithOrigins("https://rpr-auto-git-pojar-rares-projects-5c5d3702.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();*/
        
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Add global exception handler
app.UseGlobalExceptionHandler();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
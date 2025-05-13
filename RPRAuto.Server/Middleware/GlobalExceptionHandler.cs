using System.Net;
using System.Text.Json;
using RPRAuto.Server.Exceptions;
using RPRAuto.Server.Models;

namespace RPRAuto.Server.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionHandler(
        RequestDelegate next,
        ILogger<GlobalExceptionHandler> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var errorCode = "INTERNAL_SERVER_ERROR";
        var message = "An unexpected error occurred.";
        var details = _env.IsDevelopment() ? exception.ToString() : null;

        switch (exception)
        {
            case BaseException baseException:
                statusCode = baseException.StatusCode;
                errorCode = baseException.ErrorCode;
                message = baseException.Message;
                break;
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                errorCode = "UNAUTHORIZED";
                message = "You are not authorized to perform this action.";
                break;
            case JsonException:
                statusCode = HttpStatusCode.BadRequest;
                errorCode = "INVALID_JSON";
                message = "Invalid JSON format in request.";
                break;
        }

        _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResponse(errorCode, message, details);
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
} 
namespace RPRAuto.Server.Models;

public class ErrorResponse
{
    public string ErrorCode { get; set; }
    public string Message { get; set; }
    public string? Details { get; set; }
    public string? InnerException { get; set; }
    public DateTime Timestamp { get; set; }

    public ErrorResponse(string errorCode, string message, string? details = null, string? innerException = null)
    {
        ErrorCode = errorCode;
        Message = message;
        Details = details;
        InnerException = innerException;
        Timestamp = DateTime.UtcNow;
    }
} 
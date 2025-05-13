using System.Net;

namespace RPRAuto.Server.Exceptions;

public class ValidationException : BaseException
{
    public ValidationException(string message) 
        : base(message, HttpStatusCode.BadRequest, "VALIDATION_ERROR")
    {
    }

    public ValidationException(string message, Exception innerException) 
        : base(message, HttpStatusCode.BadRequest, "VALIDATION_ERROR", innerException)
    {
    }
} 
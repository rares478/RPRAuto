using System.Net;

namespace RPRAuto.Server.Exceptions;

public class UnauthorizedException : BaseException
{
    public UnauthorizedException(string message) 
        : base(message, HttpStatusCode.Unauthorized, "UNAUTHORIZED")
    {
    }

    public UnauthorizedException(string message, Exception innerException) 
        : base(message, HttpStatusCode.Unauthorized, "UNAUTHORIZED", innerException)
    {
    }
} 
using System.Net;

namespace RPRAuto.Server.Exceptions;

public class NotFoundException : BaseException
{
    public NotFoundException(string message) 
        : base(message, HttpStatusCode.NotFound, "NOT_FOUND")
    {
    }

    public NotFoundException(string message, Exception innerException) 
        : base(message, HttpStatusCode.NotFound, "NOT_FOUND", innerException)
    {
    }
} 
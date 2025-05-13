using System.Net;

namespace RPRAuto.Server.Exceptions;

public class BaseException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string ErrorCode { get; }

    public BaseException(string message, HttpStatusCode statusCode, string errorCode) 
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }

    public BaseException(string message, HttpStatusCode statusCode, string errorCode, Exception innerException) 
        : base(message, innerException)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
} 
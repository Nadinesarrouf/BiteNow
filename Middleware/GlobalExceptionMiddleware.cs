using System.Net;
using System.Text.Json;

namespace BiteNow.Middleware;

/// <summary>
/// Catches unhandled exceptions and returns a consistent JSON error response.
/// Prevents stack traces leaking to the client in production.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            statusCode = 500,
            message    = "An unexpected error occurred. Please try again later.",
            // Only expose detail in Development
            detail = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                ? ex.Message
                : null
        };

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            })
        );
    }
}
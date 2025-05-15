using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.Json;

namespace WebApplication1
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
            {
                _logger.LogError(ex, "Database update exception");

                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    error = pgEx.MessageText // Только текст из RAISE EXCEPTION
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");

                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    error = "Внутренняя ошибка сервера"
                }));
            }
        }
    }


}

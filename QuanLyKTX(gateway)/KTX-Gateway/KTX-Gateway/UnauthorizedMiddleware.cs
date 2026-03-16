using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace KTX_Gateway
{
    /// <summary>
    /// Middleware injects JSON body into 401/403 responses that have no body.
    /// Must run BEFORE Ocelot's own auth middleware.
    /// </summary>
    public class UnauthorizedMiddleware
    {
        private readonly RequestDelegate _next;

        public UnauthorizedMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Wrap the response stream so we can intercept the final status code
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            try
            {
                await _next(context);
            }
            finally
            {
                // If the response has no body but is 401/403 → inject JSON
                if ((context.Response.StatusCode == 401 || context.Response.StatusCode == 403)
                    && responseBody.Length == 0
                    && !context.Response.ContentLength.HasValue)
                {
                    var bytes = System.Text.Encoding.UTF8.GetBytes(
                        "{\"success\":false,\"message\":\"Unauthorized\"}");
                    context.Response.ContentType = "application/json; charset=utf-8";
                    context.Response.ContentLength = bytes.Length;
                    await originalBodyStream.WriteAsync(bytes);
                }
                else
                {
                    // Copy the captured body back to the original stream
                    responseBody.Position = 0;
                    await responseBody.CopyToAsync(originalBodyStream);
                }
            }
        }
    }

    public static class UnauthorizedMiddlewareExtensions
    {
        public static IApplicationBuilder UseUnauthorizedHandler(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UnauthorizedMiddleware>();
        }
    }
}

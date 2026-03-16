using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.IO;
using System.Text;
using MMLib.SwaggerForOcelot.DependencyInjection;
using MMLib.SwaggerForOcelot.Middleware;
using KTX_Gateway;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerForOcelot(builder.Configuration);

// JWT basic config (same style as Gateway 2)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "KTX_SecretKey_2024_VeryLongAndSecureKey_ForJWT_Token_Generation_AtLeast32Characters";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuers = new[] { "KTX-Admin", "KTX-User", jwtSettings["Issuer"] },
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    // Fix Bug #3: 401/403 response không có JSON body → trả JSON cho tất cả error responses
    x.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json; charset=utf-8";
                var body = Encoding.UTF8.GetBytes("{\"success\":false,\"message\":\"Unauthorized\"}");
                // Replace body stream (SetLength fails on Kestrel response stream)
                context.Response.Body = new MemoryStream();
                context.Response.Body.Write(body, 0, body.Length);
                context.Response.Body.Position = 0;
            }
            context.HandleResponse();
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json; charset=utf-8";
                var body = Encoding.UTF8.GetBytes("{\"success\":false,\"message\":\"Unauthorized\"}");
                try
                {
                    // Try to reset existing stream
                    context.Response.Body.SetLength(0);
                    context.Response.Body.Write(body, 0, body.Length);
                    context.Response.Body.Position = 0;
                }
                catch
                {
                    // Fallback: replace with fresh MemoryStream (handles Kestrel response stream)
                    context.Response.Body = new MemoryStream();
                    context.Response.Body.Write(body, 0, body.Length);
                    context.Response.Body.Position = 0;
                }
            }
            context.NoResult();
            return Task.CompletedTask;
        }
    };
});

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway");
    });
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Simple path redirects via inline middleware
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (path == "/" || path == "/admin")
    {
        context.Response.Redirect("/admin/swagger", false);
        return;
    }
    if (path == "/user")
    {
        context.Response.Redirect("/user/swagger", false);
        return;
    }
    await next();
});

// Custom middleware: intercept 401/403 from downstream (Ocelot) and inject JSON body
app.UseUnauthorizedHandler();
await app.UseOcelot();
app.UseSwaggerForOcelotUI(opt =>
{
    opt.PathToSwaggerGenerator = "/swagger/docs";
});
app.Run();



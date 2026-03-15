using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using KTX_Admin.Services;

var builder = WebApplication.CreateBuilder(args);

// EPPlus license
OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Fix: JSON deserialize dùng case-insensitive matching (nhận cả PascalCase và camelCase)
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // giữ nguyên PascalCase như model
    });
builder.Services.AddEndpointsApiExplorer();

// Đăng ký background service xử lý hóa đơn quá hạn
builder.Services.AddHostedService<OverdueBillService>();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "KTX Admin API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JwtSettings:SecretKey");
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
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    // Fix Bug #3: 401/403 responses must have JSON body
    x.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            // Stop default challenge behavior - we handle it ourselves
            context.HandleResponse();

            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json; charset=utf-8";
                var bytes = System.Text.Encoding.UTF8.GetBytes("{\"success\":false,\"message\":\"Unauthorized\"}");
                context.Response.Body.WriteAsync(bytes, 0, bytes.Length).Wait();
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using BiteNow.Data;
using BiteNow.Middleware;

var builder = WebApplication.CreateBuilder(args);

//
// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────
//

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// SQLite DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(
        builder.Configuration.GetConnectionString("Default")
        ?? "Data Source=restaurant.db"
    ));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Restaurant Ordering API",
        Version = "v1",
        Description = "Food ordering system API"
    });
});

// CORS (IMPORTANT FOR FRONTEND CONNECTION)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

//
// ─────────────────────────────────────────────────────────────
// APP PIPELINE
// ─────────────────────────────────────────────────────────────
//

var app = builder.Build();

// Auto migrate DB
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

// Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Restaurant API v1");
        c.RoutePrefix = string.Empty;
    });
}

// ⚠️ ORDER MATTERS (VERY IMPORTANT)
app.UseHttpsRedirection();

// ✅ MUST BE BEFORE AUTH + CONTROLLERS
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
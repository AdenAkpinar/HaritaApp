using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;
using Server.Data;
using Server.Repositories;
using Server.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT Ayarları
var secret_key = Encoding.ASCII.GetBytes("secret_key_for_this_gis_application");

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
        IssuerSigningKey = new SymmetricSecurityKey(secret_key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        foreach (var converter in NetTopologySuite.IO.GeoJsonSerializer.Create().Converters)
        {
            options.SerializerSettings.Converters.Add(converter);
        }
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite()));

builder.Services.AddScoped<IGeometryRepository, GeometryRepository>();
builder.Services.AddScoped<IGeometryService, GeometryService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

app.MapControllers();

app.Run();

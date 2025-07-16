using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using backend.Data;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// API Controller'ları ekle
builder.Services.AddControllers();

// Veritabanı bağlantısı
// SQL Server bağlantısı için retry politikası ile birlikte yapılandırma
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,                    // Maksimum yeniden deneme sayısı
                maxRetryDelay: TimeSpan.FromSeconds(30), // Denemeler arası maksimum bekleme süresi
                errorNumbersToAdd: null);            // Tüm SQL hataları için yeniden dene
        }));

// Identity yapılandırması
// Kullanıcı kimlik doğrulama ve yetkilendirme ayarları
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Şifre gereksinimleri
    options.Password.RequireDigit = true;           // En az bir rakam
    options.Password.RequireLowercase = true;       // En az bir küçük harf
    options.Password.RequireUppercase = true;       // En az bir büyük harf
    options.Password.RequireNonAlphanumeric = false;// Özel karakter gerekli değil
    options.Password.RequiredLength = 8;            // Minimum 8 karakter

    // Email gereksinimleri
    options.User.RequireUniqueEmail = true;         // Email adresleri benzersiz olmalı
})
.AddEntityFrameworkStores<ApplicationDbContext>()    // Identity verilerini EF Core ile sakla
.AddDefaultTokenProviders();                        // Şifre sıfırlama vb. için token sağlayıcıları

// JWT yapılandırması
// JSON Web Token ayarları ve doğrulama parametreleri
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// JWT tabanlı kimlik doğrulama ayarları
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,                      // Token yayıncısını doğrula
        ValidateAudience = true,                    // Token hedef kitlesini doğrula
        ValidateLifetime = true,                    // Token süresini kontrol et
        ValidateIssuerSigningKey = true,           // Token imza anahtarını doğrula
        ValidIssuer = jwtSettings?.Issuer,         // Geçerli yayıncı
        ValidAudience = jwtSettings?.Audience,     // Geçerli hedef kitle
        IssuerSigningKey = new SymmetricSecurityKey( // İmza anahtarı
            Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? "fallback-key-only-for-development"))
    };
});

// CORS politikası - Geliştirme ortamı için tüm originlere izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()     // Tüm kaynaklardan gelen isteklere izin ver
                   .AllowAnyMethod()     // Tüm HTTP metodlarına izin ver (GET, POST, vb.)
                   .AllowAnyHeader();    // Tüm HTTP başlıklarına izin ver
        });
});

// Swagger/OpenAPI yapılandırması
// API dokümantasyonu için Swagger ayarları
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Not Yönetim Sistemi API",
        Version = "v1",
        Description = "Ders notları yönetim sistemi için RESTful API"
    });

    // JWT kimlik doğrulama için Swagger yapılandırması
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Örnek veri oluşturma
// Uygulama ilk çalıştığında test kullanıcıları oluştur
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        await Seeder.SeedData(context, userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Örnek veri oluşturulurken bir hata oluştu.");
    }
}

// HTTP request pipeline yapılandırması
if (app.Environment.IsDevelopment())
{
    // Geliştirme ortamında Swagger UI'ı etkinleştir
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Not Yönetim Sistemi API V1");
        c.RoutePrefix = "api-docs";
        c.DocumentTitle = "Not Yönetim Sistemi - API Dokümantasyonu";
    });
}

// CORS politikasını uygula - Middleware sıralaması önemli
app.UseCors("AllowAll");

// Statik dosyaları etkinleştir
app.UseStaticFiles();

// Routing'i etkinleştir
app.UseRouting();

// HTTPS yönlendirmesi
// app.UseHttpsRedirection();

// Kimlik doğrulama ve yetkilendirme
app.UseAuthentication();
app.UseAuthorization();

// Controller route'larını yapılandır
app.MapControllers();
app.MapGet("/", () => "API is running!");

// Uygulamayı başlat
app.Run();

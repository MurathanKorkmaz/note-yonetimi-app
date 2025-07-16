using Microsoft.AspNetCore.Identity;
using backend.Models;

namespace backend.Data;

public static class Seeder
{
    public static async Task SeedData(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        // Eğer veritabanında hiç kullanıcı yoksa
        if (!userManager.Users.Any())
        {
            // Örnek kullanıcılar
            var users = new List<ApplicationUser>
            {
                new ApplicationUser
                {
                    UserName = "test@example.com",
                    Email = "test@example.com",
                    FirstName = "Test",
                    LastName = "User",
                    EmailConfirmed = true
                },
                new ApplicationUser
                {
                    UserName = "demo@example.com",
                    Email = "demo@example.com",
                    FirstName = "Demo",
                    LastName = "User",
                    EmailConfirmed = true
                }
            };

            foreach (var user in users)
            {
                await userManager.CreateAsync(user, "Test123!");
            }

            // Mock notlar kaldırıldı - sadece kullanıcı eklediği notlar gösterilecek
        }
    }
} 
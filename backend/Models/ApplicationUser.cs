using Microsoft.AspNetCore.Identity;

namespace backend.Models;

public class ApplicationUser : IdentityUser
{
    // Kullanıcının adı - Opsiyonel
    public string? FirstName { get; set; }

    // Kullanıcının soyadı - Opsiyonel
    public string? LastName { get; set; }

    // Hesabın oluşturulma tarihi - UTC formatında otomatik atanır
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // Kullanıcının notları ile ilişki - Lazy loading için virtual
    public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
} 
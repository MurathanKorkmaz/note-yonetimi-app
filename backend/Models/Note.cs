namespace backend.Models;

public class Note
{
    // Notun benzersiz kimliği
    public int Id { get; set; }

    // Dersin adı - Boş olamaz, minimum 3 karakter
    public string CourseName { get; set; } = string.Empty;

    // Not açıklaması - Boş olamaz, minimum 10 karakter
    public string Description { get; set; } = string.Empty;

    // Yüklenen dosyanın yolu - PDF, Word gibi dosyalar için
    // Null olabilir (dosya yüklenmemiş olabilir)
    public string? FilePath { get; set; }

    // Kullanıcı ilişkisi - Lazy loading için virtual
    public string UserId { get; set; } = string.Empty;
    public virtual ApplicationUser? User { get; set; }

    // Zaman damgaları - UTC formatında tutulur
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Oluşturma tarihi - Otomatik atanır
    public DateTime? UpdatedAt { get; set; }                    // Son güncelleme tarihi - Değişiklik yapıldığında güncellenir
    public DateTime? DeletedAt { get; set; }                    // Silinme tarihi - Null değilse not arşivde demektir
} 
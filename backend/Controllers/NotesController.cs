using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.IO;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public NotesController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // Dosya yükleme endpoint'i
    // Gelen dosyayı uploads klasörüne kaydeder ve dosya yolunu döner
    // Dosya adı çakışmalarını önlemek için benzersiz isim oluşturur
    [HttpPost("upload")]
    public async Task<ActionResult<string>> UploadFile(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Dosya seçilmedi");
            }

            string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return Ok(new { filePath = $"/uploads/{uniqueFileName}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Dosya yükleme hatası: {ex.Message}");
        }
    }

    // Aktif notları listeler
    // Silinmemiş (DeletedAt == null) notları oluşturma tarihine göre sıralayarak getirir
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
    {
        var notes = await _context.Notes
            .Where(n => n.DeletedAt == null) // Sadece silinmemiş notlar
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
        return Ok(notes);
    }

    // GET: api/Notes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Note>> GetNote(int id)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id && n.DeletedAt == null);

        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    // POST: api/Notes
    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote(Note note)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        note.CreatedAt = DateTime.UtcNow;
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
    }

    // Not güncelleme endpoint'i
    // Mevcut notu günceller ve eski dosya varsa siler
    // Güncelleme tarihini otomatik olarak ayarlar
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNote(int id, Note note)
    {
        if (id != note.Id)
        {
            return BadRequest();
        }

        var existingNote = await _context.Notes.FindAsync(id);

        if (existingNote == null)
        {
            return NotFound();
        }

        // Eğer dosya değiştiyse eski dosyayı sil
        if (!string.IsNullOrEmpty(existingNote.FilePath) && 
            existingNote.FilePath != note.FilePath)
        {
            DeleteFileIfExists(existingNote.FilePath);
        }

        existingNote.CourseName = note.CourseName;
        existingNote.Description = note.Description;
        existingNote.FilePath = note.FilePath;
        existingNote.UserId = note.UserId;
        existingNote.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NoteExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(existingNote);
    }

    // Not silme endpoint'i
    // Soft delete yapar (DeletedAt alanını doldurur)
    // Not zaten silinmişse dosyayı ve kaydı tamamen siler
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var note = await _context.Notes.FindAsync(id);

        if (note == null)
        {
            return NotFound();
        }

        if (note.DeletedAt != null)
        {
            // Kalıcı silme işlemi
            if (!string.IsNullOrEmpty(note.FilePath))
            {
                DeleteFileIfExists(note.FilePath);
            }
            _context.Notes.Remove(note);
        }
        else
        {
            // Soft delete
            note.DeletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Notes/5/permanent
    [HttpDelete("{id}/permanent")]
    public async Task<IActionResult> HardDeleteNote(int id)
    {
        var note = await _context.Notes
            .IgnoreQueryFilters() // Global query filter'ı bypass et
            .FirstOrDefaultAsync(n => n.Id == id && n.DeletedAt != null);

        if (note == null)
        {
            return NotFound("Arşivlenmiş not bulunamadı.");
        }

        // Dosyayı kalıcı olarak sil
        if (!string.IsNullOrEmpty(note.FilePath))
        {
            DeleteFileIfExists(note.FilePath);
        }

        // Notu veritabanından kalıcı olarak sil
        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Notes/archived
    [HttpGet("archived")]
    public async Task<ActionResult<IEnumerable<Note>>> GetArchivedNotes()
    {
        var archivedNotes = await _context.Notes
            .IgnoreQueryFilters() // Global query filter'ı bypass et
            .Where(n => n.DeletedAt != null)
            .OrderByDescending(n => n.DeletedAt)
            .ToListAsync();
        return Ok(archivedNotes);
    }

    // POST: api/Notes/5/restore
    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreNote(int id)
    {
        var note = await _context.Notes
            .IgnoreQueryFilters() // Global query filter'ı bypass et
            .FirstOrDefaultAsync(n => n.Id == id && n.DeletedAt != null);

        if (note == null)
        {
            return NotFound();
        }

        note.DeletedAt = null;
        await _context.SaveChangesAsync();

        return Ok(note);
    }

    private bool NoteExists(int id)
    {
        return _context.Notes.Any(e => e.Id == id && e.DeletedAt == null);
    }

    // Verilen dosya yolundaki dosyayı siler
    // Dosya bulunamazsa veya silinirken hata olursa işlemi sessizce geçer
    // Parametre: Web root'a göre relatif dosya yolu (/uploads/dosya.pdf gibi)
    private void DeleteFileIfExists(string filePath)
    {
        try
        {
            // URL formatındaki yolu fiziksel dosya yoluna çevir
            string fileName = filePath.Replace("/uploads/", "");
            string fullPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            // Dosya silme hatası olsa bile işlemi devam ettir
            Console.WriteLine($"Dosya silme hatası: {ex.Message}");
        }
    }
} 
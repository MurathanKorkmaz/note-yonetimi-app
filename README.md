# Not Yönetim Sistemi

## Projenin Amacı
Bu proje, öğrencilerin ve eğitimcilerin ders notlarını dijital ortamda yönetmelerini sağlayan modern bir web uygulamasıdır. Kullanıcılar notlarını oluşturabilir, düzenleyebilir, dosya ekleyebilir ve arşivleyebilir. Sistem, kullanıcı dostu arayüzü ve güvenli yapısıyla etkili bir not yönetimi deneyimi sunar.

## Özellikler
- Modern ve responsive kullanıcı arayüzü
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Not CRUD işlemleri
- Dosya yükleme desteği
- Soft delete ve arşivleme sistemi
- Arşivden kalıcı silme
- Tutarlı tasarım

## Kullanılan Teknolojiler ve Kütüphaneler

### Backend
- ASP.NET Core 8.0 (Web API framework)
- Entity Framework Core 8.0.2 (ORM ve veritabanı işlemleri)
- SQL Server (Veritabanı)
- JWT Authentication 8.0.0 (Güvenli kimlik doğrulama)
- Identity Framework 8.0.0 (Kullanıcı yönetimi)

### Frontend
- Next.js 14.1.0 (React framework)
- React 18.2.0
- TypeScript 5 (Tip güvenli JavaScript)
- Tailwind CSS 3.4.17 (Stil kütüphanesi)
- Axios 1.6.7 (HTTP istekleri)
- TipTap 3.0.6 (Zengin metin editörü)
- React Dropzone 14.3.8 (Dosya yükleme)

## Kurulum ve Çalıştırma Adımları

### Gereksinimler
- .NET 8.0 SDK
- Node.js 18+
- SQL Server
- Git (Kaynak kodu almak için)

### Backend Kurulum
1. Projeyi klonlayın ve backend klasörüne gidin:
```bash
git clone [repo-url]
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
dotnet restore
```

3. Veritabanını oluşturun:
```bash
dotnet ef database update
```

4. Uygulamayı başlatın:
```bash
dotnet run
```
Backend varsayılan olarak https://localhost:5000 adresinde çalışacaktır.

### Frontend Kurulum
1. Frontend klasörüne gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm run dev
```
Frontend varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

## API Uç Noktaları

### Kimlik Doğrulama Endpoint'leri

#### POST /api/Auth/register
Yeni kullanıcı kaydı için kullanılır.
```json
{
    "email": "user@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
}
```
Başarılı yanıt: 200 OK
```json
{
    "message": "Kullanıcı başarıyla oluşturuldu"
}
```

#### POST /api/Auth/login
Kullanıcı girişi için kullanılır.
```json
{
    "email": "user@example.com",
    "password": "Test123!"
}
```
Başarılı yanıt: 200 OK
```json
{
    "token": "JWT-TOKEN",
    "expiration": "2024-03-14T12:00:00Z"
}
```

### Not Endpoint'leri

#### GET /api/Notes
Tüm aktif notları listeler.
- Yetkilendirme: JWT Token gerekli
- Yanıt: 200 OK - Not listesi

#### GET /api/Notes/{id}
Belirli bir notu getirir.
- Yetkilendirme: JWT Token gerekli
- Parametre: id (not ID'si)
- Yanıt: 200 OK - Not detayları

#### POST /api/Notes
Yeni not oluşturur.
- Yetkilendirme: JWT Token gerekli
```json
{
    "courseName": "Not Başlığı",
    "description": "Not içeriği",
    "filePath": "/uploads/dosya.pdf"
}
```
Başarılı yanıt: 201 Created - Oluşturulan not

#### PUT /api/Notes/{id}
Notu günceller.
- Yetkilendirme: JWT Token gerekli
- Parametre: id (not ID'si)

#### DELETE /api/Notes/{id}
Notu arşive taşır (soft delete).
- Yetkilendirme: JWT Token gerekli
- Parametre: id (not ID'si)
- Yanıt: 204 No Content

#### GET /api/Notes/archived
Arşivlenmiş notları listeler.
- Yetkilendirme: JWT Token gerekli
- Yanıt: 200 OK - Arşivlenmiş not listesi

#### POST /api/Notes/{id}/restore
Arşivlenmiş notu geri yükler.
- Yetkilendirme: JWT Token gerekli
- Parametre: id (not ID'si)
- Yanıt: 200 OK

#### DELETE /api/Notes/{id}/permanent
Notu kalıcı olarak siler.
- Yetkilendirme: JWT Token gerekli
- Parametre: id (not ID'si)
- Yanıt: 204 No Content

#### POST /api/Notes/upload
Dosya yükleme için kullanılır.
- Yetkilendirme: JWT Token gerekli
- İstek türü: multipart/form-data
- Yanıt: 200 OK - Yüklenen dosya yolu

## Örnek Kullanıcılar
Uygulama ilk çalıştığında otomatik olarak oluşturulan örnek kullanıcılar:

1. Test Kullanıcısı
   - Email: test@example.com
   - Şifre: Test123!

2. Demo Kullanıcısı
   - Email: demo@example.com
   - Şifre: Test123!

## Güvenlik
- JWT tabanlı kimlik doğrulama
- Güvenli şifre politikası
- Dosya yükleme güvenliği
- CORS yapılandırması

## Dağıtım
1. Backend için:
```bash
dotnet publish -c Release
```

2. Frontend için:
```bash
npm run build
```

## Proje Yapısı

### Frontend Dosya Kullanımları
- `src/app/`: Sayfa yönlendirmeleri ve ana layout
- `src/components/`: Yeniden kullanılabilir UI bileşenleri
  - `layout/`: Sayfa düzeni bileşenleri
  - `notes/`: Not yönetimi ile ilgili bileşenler
  - `ui/`: Genel UI bileşenleri
- `src/services/`: API istekleri ve veri yönetimi
- `src/hooks/`: Özel React hook'ları
- `public/`: Statik dosyalar ve görseller

### Backend Dosya Kullanımları
- `Controllers/`: API endpoint'leri ve iş mantığı
  - `AuthController.cs`: Kimlik doğrulama işlemleri
  - `NotesController.cs`: Not yönetimi işlemleri
- `Models/`: Veri modelleri ve DTO'lar
- `Data/`: Veritabanı bağlamı ve migration'lar
- `wwwroot/uploads/`: Yüklenen dosyaların saklandığı klasör 
# Not Yönetim Sistemi

## Projenin Amacı
Bu proje, öğrencilerin ve eğitimcilerin ders notlarını dijital ortamda yönetmelerini sağlayan modern bir web uygulamasıdır. Kullanıcılar notlarını oluşturabilir, düzenleyebilir, dosya ekleyebilir ve arşivleyebilir.

## Temel Özellikler
- Not CRUD işlemleri ve dosya yükleme
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Soft delete ve arşivleme sistemi
- Modern ve responsive kullanıcı arayüzü

## Teknoloji Stack

### Backend
- ASP.NET Core 8.0 (Web API)
- Entity Framework Core 8.0.2 (ORM)
- SQL Server & Identity Framework 8.0.0
- JWT Authentication

### Frontend
- Next.js 14.1.0 & React 18.2.0
- TypeScript 5
- Tailwind CSS 3.4.17
- TipTap 3.0.6 (Rich Text Editor)

## Veritabanı Yapısı

### Ana Tablolar
1. **Notes**
   - Temel alanlar: `Id`, `CourseName`, `Description`, `FilePath`
   - Takip alanları: `CreatedAt`, `UpdatedAt`, `DeletedAt`
   - İlişkiler: `UserId` (FK to AspNetUsers)

2. **AspNetUsers** (Identity)
   - Kullanıcı bilgileri: `Id`, `FirstName`, `LastName`, `Email`
   - Güvenlik: `PasswordHash`, `SecurityStamp`
   - Takip: `CreatedAt`, `UpdatedAt`

### Identity Framework Tabloları
- `AspNetRoles`: Rol tanımları
- `AspNetUserRoles`: Kullanıcı-rol ilişkileri
- `AspNetUserClaims`, `AspNetRoleClaims`: Yetki talepleri
- `AspNetUserLogins`: Harici login bilgileri
- `AspNetUserTokens`: Kullanıcı token yönetimi

### Migration Geçmişi
1. `20250714161612_InitialNotesDbCreate`: Notes tablosu oluşturuldu
2. `20250715172811_AddIdentityAndUserRelations`: Identity tabloları (AspNetUsers, AspNetRoles vb.) eklendi
3. `20250715230443_RenameNoteTitleToCourseName`: Notes tablosunda Title → CourseName
4. `20250716165627_MakeUserNavigationPropertyNullable`: User ilişkisi opsiyonel yapıldı
5. `20250716173045_RemoveExistingMockNotes`: Test verileri temizlendi

## Kurulum

### Gereksinimler
- .NET 8.0 SDK
- Node.js 18+
- SQL Server

### Backend Kurulum
```bash
git clone [repo-url]
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Kurulum
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Auth Endpoints
- POST `/api/Auth/register`: Yeni kullanıcı kaydı
- POST `/api/Auth/login`: Kullanıcı girişi

### Notes Endpoints
- GET `/api/Notes`: Aktif notları listele
- POST `/api/Notes`: Yeni not oluştur
- PUT `/api/Notes/{id}`: Not güncelle
- DELETE `/api/Notes/{id}`: Notu arşivle
- GET `/api/Notes/archived`: Arşivlenmiş notları listele
- POST `/api/Notes/{id}/restore`: Arşivden geri yükle
- DELETE `/api/Notes/{id}/permanent`: Kalıcı olarak sil
- POST `/api/Notes/upload`: Dosya yükle

## Güvenlik
- JWT tabanlı kimlik doğrulama
- Güvenli şifre politikası
- CORS yapılandırması

## Proje Yapısı

### Frontend
- `src/app/`: Sayfalar ve layout
- `src/components/`: UI bileşenleri
- `src/services/`: API entegrasyonu
- `src/hooks/`: Custom hooks

### Backend
- `Controllers/`: API endpoint'leri
- `Models/`: Veri modelleri
- `Data/`: Veritabanı işlemleri
- `wwwroot/uploads/`: Dosya depolama 
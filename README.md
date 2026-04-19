NerdeTatil
==========

NerdeTatil, kullanıcıların gezi ve tatil yaptıkları yerleri kaydedip paylaşabildiği, diğer kullanıcıların paylaşımlarını keşfedip etkileşimde bulunabildiği bir web ve mobil uygulamadır.

Bu depo artık tek bir Expo Router istemcisi içerir. Aynı kod tabanı ile hem mobil (iOS/Android) hem web çalıştırılır.

---

## Proje Yapısı

Kök dizin yapısı:

```text
NerdeTatil
├─ client/         # Expo Router istemcisi (iOS + Android + Web)
└─ documentation/  # Proje dokümantasyonu (örn. Dokumantasyon.pdf)
```

- `client/`: Tek kod tabanında ekran/route yapısı ile çalışan çok platformlu uygulama.
- `documentation/`: `Dokumantasyon.pdf` dahil olmak üzere analiz, diyagramlar ve proje raporlarının bulunduğu klasör.

---

## Projenin Amacı

Bu proje, kullanıcıların:

- Gezi ve tatil yaptıkları **yerleri/mekanları kayıt altına almasını**,
- Bu yerlerle ilgili **deneyimlerini paylaşmasını**,
- Başka kullanıcıların paylaşımlarını **keşfetmesini**,
- Paylaşımlar üzerinden **etkileşime girmesini** (beğenme, yorum yapma, puanlama)

sağlayan bir web ve mobil uygulama geliştirmeyi amaçlar.

---

## Öne Çıkan Özellikler

- **Üyelik Sistemi**: Kullanıcı kaydı, giriş yapma, profil görüntüleme/düzenleme
- **Keşfet Modülü**: Diğer kullanıcıların paylaşımlarını kronolojik veya popülerliğe göre listeleme
- **Paylaşım Oluşturma**:
  - Konum/adres girme
  - Fotoğraf yükleme
  - Deneyim/yorum metni ekleme
  - 1–5 arası puan verme
- **Etkileşim**:
  - Paylaşımları “Beğendim / Beğenmedim” şeklinde değerlendirme
  - Yorum ekleme (paylaşımı yapan kullanıcının izin vermesi durumunda)
- **Arama & Filtreleme**:
  - Şehir veya mekan ismine göre arama
  - Konuma, beğeniye, tarihe göre filtreleme

---

## Teknik Mimari ve Teknoloji Yığını

### Frontend

- **Tek İstemci**: Expo + Expo Router + React Native
- **Platformlar**: iOS, Android, Web
- **State Yönetimi**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) (entegrasyon için hazır)
- **Router**: Expo Router (`app/` dosya tabanlı route yapısı)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: JWT (JSON Web Token)
- **Harita Entegrasyonu**: Leaflet (web istemci üzerinden)

---

## Kurulum ve Çalıştırma

### Önkoşullar

- Node.js (>= 18.x önerilir)
- npm veya yarn
- Git (opsiyonel, versiyon kontrol için)
- Mobil için:
  - Expo CLI (`npx expo` ile kullanılabilir)
  - Gerçek cihazda Expo Go uygulaması veya emülatör (Android Studio / Xcode)

### Depoyu klonlama

```bash
git clone <repo-url> NerdeTatil
cd NerdeTatil
```

---

### Birleşik Uygulama (Expo Router) – `client/`

Kurulum:

```bash
cd client
npm install
```

Ortam degiskenleri:

```bash
cd client
copy .env.example .env
```

Kullanilan genel degiskenler:

- EXPO_PUBLIC_APP_NAME
- EXPO_PUBLIC_API_BASE_URL
- EXPO_PUBLIC_ENABLE_MOCK

Geliştirme sunucusunu başlat:

```bash
npm run start
```

Platforma özel komutlar:

```bash
# Android emülatör / cihaz
npm run android

# iOS simülatör (sadece macOS)
npm run ios

# Web üzerinde çalıştırma
npm run web
```

Mobil ve web'i aynı anda açmak için:

```bash
npm run start:all
```

Telefon üzerinden test için Expo Go uygulamasını indirip, terminalde çıkan QR kodu okutabilirsin.

---

## Docker ile Veritabanı Kurulumu

### Sistem Gereksinimleri

- Docker Desktop (Windows, macOS) veya Docker Engine (Linux)
- Docker Compose v2.0+

### Docker Desktop Kurulumu

Windows veya macOS için:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) indir ve kur

Linux için:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### PostgreSQL Container'ını Başlatma

Proje kök dizininden:

```bash
# Container'ı başlat (arka planda çalışır)
docker-compose up -d

# Durumu kontrol et
docker-compose ps
```

**Bağlantı Bilgileri:**

| Ayar | Değer |
|------|-------|
| **Host** | localhost |
| **Port** | 5432 |
| **Username** | nerdetatil_user |
| **Password** | nerdetatil_password |
| **Database** | nerdetatil_db |
| **Connection URL** | `postgresql://nerdetatil_user:nerdetatil_password@localhost:5432/nerdetatil_db` |

### Backend Bağlantısı

`.env` dosyası oluştur:

```bash
cd [backend-dizini]
cp .env.example .env
```

`.env` dosyasını güncelle:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nerdetatil_db
DB_USER=nerdetatil_user
DB_PASSWORD=nerdetatil_password
DATABASE_URL=postgresql://nerdetatil_user:nerdetatil_password@localhost:5432/nerdetatil_db
```

### Veritabanı Bağlantısını Test Etme

#### psql ile (PostgreSQL komut satırı aracı):

```bash
# İlk kurulum: psql'i yükle (gerekli ise)
# Windows: chocolatey ile -> choco install postgresql
# Linux: apt-get install postgresql-client
# macOS: brew install postgresql

psql -h localhost -U nerdetatil_user -d nerdetatil_db
# Şifre iste: nerdetatil_password
```

#### DBeaver veya pgAdmin ile:

1. **DBeaver İndir:** https://dbeaver.io/download/
2. **Yeni Bağlantı Oluştur:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `nerdetatil_db`
   - Username: `nerdetatil_user`
   - Password: `nerdetatil_password`

#### Node.js ile:

```bash
npm install pg
node
```

```javascript
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'nerdetatil_db',
  user: 'nerdetatil_user',
  password: 'nerdetatil_password',
});

client.connect();
client.query('SELECT NOW()', (err, res) => {
  console.log(err, res.rows);
  client.end();
});
```

### Container İşlemleri

```bash
# Container'ı durdur
docker-compose down

# Veriyi sil ve baştan başla
docker-compose down -v

# Container log'larını görüntüle
docker-compose logs -f postgres

# Container'ı yeniden başlat
docker-compose restart postgres
```

### Troubleshooting

**Port 5432 zaten kullanımda?**

`docker-compose.yml` dosyasında port numarasını değiştir:

```yaml
ports:
  - "5433:5432"  # Host port'unu 5433'e değiştir
```

**Container başlamıyor mu?**

```bash
# Log'ları kontrol et
docker-compose logs postgres

# Tüm sistemin durumunu temizle
docker-compose down -v
docker-compose up -d --build
```

---

## Veritabanı Şeması ve İlişkiler

### Database Mimarisi

NerdeTatil uygulaması aşağıdaki tablolar kullanmaktadır:

#### **users**
Kullanıcı hesapları ve profil bilgileri
```
- id (UUID, Primary Key)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- username (VARCHAR, UNIQUE)
- full_name (VARCHAR)
- bio (TEXT)
- profile_image_url (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### **locations**
Ziyaret edilen yerler ve konumlar
```
- id (UUID, Primary Key)
- name (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- country (VARCHAR)
- latitude, longitude (DECIMAL)
- description (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### **posts**
Kullanıcı paylaşımları ve deneyimler
```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- location_id (UUID, Foreign Key → locations)
- title (VARCHAR)
- description (TEXT)
- rating (INTEGER 1-5)
- image_urls (TEXT[])
- is_public (BOOLEAN)
- allow_comments (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### **comments**
Paylaşımlara eklenen yorumlar
```
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key → posts)
- user_id (UUID, Foreign Key → users)
- content (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### **likes**
Paylaşımların beğenileri
```
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key → posts)
- user_id (UUID, Foreign Key → users)
- reaction_type (VARCHAR: 'like', 'love', 'interesting')
- created_at (TIMESTAMP)
```

#### **user_follows**
Kullanıcı takip sistemi (gelecek özellik)
```
- id (UUID, Primary Key)
- follower_id (UUID, Foreign Key → users)
- following_id (UUID, Foreign Key → users)
- created_at (TIMESTAMP)
```

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   users     │         │  locations   │
├─────────────┤         ├──────────────┤
│ id (PK)     │         │ id (PK)      │
│ email       │         │ name         │
│ username    │         │ city         │
│ full_name   │         │ latitude     │
│ bio         │         │ longitude    │
└─────────────┘         └──────────────┘
      ▲ │                      ▲
      │ │ (1:N)                │
      │ └──┬──────────────────┬─┘
      │    │                  │
      │    │              ┌──────────┐
      │    │              │  posts   │
      │    │              ├──────────┤
      │    │              │ id (PK)  │
      │    │              │ user_id  │
      │    │              │ location │
      │    │              │ rating   │
      │    │              └──────────┘
      │    │                  │
      │    │ (1:N)            │ (1:N)
      │    │                  │
   ┌──────────────┐      ┌─────────────┐
   │  comments    │      │   likes     │
   ├──────────────┤      ├─────────────┤
   │ id (PK)      │      │ id (PK)     │
   │ post_id (FK) │      │ post_id (FK)│
   │ user_id (FK) │      │ user_id (FK)│
   │ content      │      │ reaction_type│
   └──────────────┘      └─────────────┘
```

---

## Backend Entegrasyonu

### Dosya Yapısı

```
db/
├── init.sql              # Database schema ve initialization
├── connection.js         # PostgreSQL bağlantı pool'u
└── sample-api.js         # Sample API endpoint'leri
```

### Node.js Backend Setup

1. **Backend projesi oluştur:**
```bash
mkdir backend
cd backend
npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv
```

2. **`connection.js` dosyasını kopyala:**
```bash
cp ../db/connection.js ./src/db/connection.js
```

3. **`sample-api.js` dosyasını referans al ve API endpoint'lerini oluştur**

4. **`.env` dosyasını oluştur:**
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nerdetatil_db
DB_USER=nerdetatil_user
DB_PASSWORD=nerdetatil_password
DATABASE_URL=postgresql://nerdetatil_user:nerdetatil_password@localhost:5432/nerdetatil_db
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

5. **Express sunucusunu başlat:**
```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const db = require('./db/connection');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### API Endpoint Örnekleri

#### Kullanıcı Oluştur
```bash
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "exploreruser",
  "password": "securePassword123",
  "full_name": "Ahmet Yılmaz"
}
```

#### Paylaşım Oluştur
```bash
POST /api/posts
Content-Type: application/json

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Harika bir deneyim!",
  "description": "Cappadocia'daki balon turu müthişti...",
  "rating": 5,
  "image_urls": ["https://example.com/image1.jpg"]
}
```

#### Paylaşımları Listele
```bash
GET /api/posts?page=1&limit=10
```

#### Paylaşıma Beğeni Ekle
```bash
POST /api/posts/{postId}/like
Content-Type: application/json

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "reaction_type": "like"
}
```

### SQL Sorgu Örnekleri

**Son 10 paylaşımı konumuyla birlikte getir:**
```sql
SELECT p.*, u.username, l.name as location_name
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN locations l ON p.location_id = l.id
ORDER BY p.created_at DESC
LIMIT 10;
```

**Belirli bir şehirdeki tüm paylaşımları getir:**
```sql
SELECT p.*, l.city
FROM posts p
JOIN locations l ON p.location_id = l.id
WHERE l.city = 'Istanbul'
ORDER BY p.created_at DESC;
```

**En çok beğenilen paylaşımlar:**
```sql
SELECT p.id, p.title, COUNT(l.id) as like_count
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
GROUP BY p.id
ORDER BY like_count DESC
LIMIT 10;
```

**Kullanıcının tüm paylaşımları ve yorumları:**
```sql
SELECT p.id, p.title, COUNT(c.id) as comment_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.user_id = 'USER_UUID'
GROUP BY p.id;
```

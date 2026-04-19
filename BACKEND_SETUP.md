# Backend Setup Tamamlama Özeti

## ✅ Tamamlanan

### 1. **Docker PostgreSQL Database**
- ✓ Container çalışıyor
- ✓ Database schema oluşturuldu
- ✓ Tüm tablolar (users, posts, locations, comments, likes) hazır
- ✓ Veritabanı bağlantı detayları:
  - Host: `localhost:5432`
  - Database: `nerdetatil_db`
  - User: `nerdetatil_user`
  - Password: `nerdetatil_password`

### 2. **Backend Server (Express.js)**
- ✓ Server port 5000'de çalışıyor
- ✓ Database pool bağlantısı aktif
- ✓ CORS enabled (tüm originler için)
- ✓ API route'ları implementasyon:
  - ✓ Users (CREATE, GET)
  - ✓ Posts (LIST, GET, CREATE)
  - ✓ Comments (POST)
  - ✓ Likes (POST, DELETE)
  - ✓ Locations (LIST, CREATE)

### 3. **Oluşturulan Dosyalar**

```
backend/
├── server.js                    # Ana sunucu
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── .gitignore                   # Git ignore
├── README.md                    # Backend dokümentasyonu
├── src/
│   ├── db/
│   │   └── connection.js        # Database connection pool
│   ├── routes/
│   │   └── api.js               # API endpoints
│   └── middleware/              # (Future: JWT auth)
└── node_modules/                # Dependencies yüklü
```

---

## 🚀 Başlangıç Komutları

### 1. Backend Sunucusunu Başlat

```bash
cd backend

# Development mode (SQL query logs gösterir)
npm run dev

# Production mode
npm start
```

Backend şu adreste çalışacak: **http://localhost:5000**

### 2. Veritabanı Durumunu Kontrol Et

```bash
# Proje root dizininden:
docker-compose ps

# Output: nerdetatil_postgres ... Up (healthy)
```

### 3. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","database":"connected"}
```

**Kullanıcı Oluştur:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username123",
    "password": "password123",
    "full_name": "Full Name"
  }'
```

**Paylaşımları Listele:**
```bash
curl http://localhost:5000/api/posts
```

---

## 📱 Frontend'den Kullanım

### React Native / Expo Setup

**1. Environment Variable'ı Ayarla:**

```javascript
// client/src/config/env.ts
export const API_BASE_URL = 'http://localhost:5000';

// Android emulator için:
// export const API_BASE_URL = 'http://10.0.2.2:5000';

// Fiziksel cihazdan bağlanmak için (ip adresini değiştir):
// export const API_BASE_URL = 'http://192.168.1.100:5000';
```

**2. API Utility Dosyası Oluştur:**

```javascript
// client/src/services/api.ts
import { API_BASE_URL } from '../config/env';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Example usage:
export const getPosts = () => apiCall('/posts');
export const createPost = (data) => apiCall('/posts', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

**3. Component'da Kullan:**

```javascript
import { useEffect, useState } from 'react';
import { getPosts } from '../services/api';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts()
      .then(data => setPosts(data.posts))
      .catch(err => console.error(err));
  }, []);

  return (
    // ... JSX
  );
}
```

---

## 🔧 Gelecek Geliştirmeler

- [ ] JWT Authentication
- [ ] Input Validation (joi/express-validator)
- [ ] Password Hashing (bcryptjs implementation)
- [ ] Rate Limiting
- [ ] Request Logging Middleware
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Deployment Configuration
- [ ] Error Handling Improvements

---

## 🐛 Troubleshooting

### Port 5000 zaten kullanımda?
```bash
# .env dosyasında PORT'u değiştir
PORT=5001
```

### Veritabanı bağlantısı başarısız?
```bash
# Veritabanı durumunu kontrol et
docker-compose ps

# Logs'u gör
docker-compose logs postgres

# Yeniden başlat
docker-compose restart postgres
```

### Dependencies error?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Yönetimi

### PostgreSQL CLI ile Bağlan:
```bash
psql -h localhost -U nerdetatil_user -d nerdetatil_db
```

### DBeaver/pgAdmin ile Bağlan:
- Host: `localhost`
- Port: `5432`
- User: `nerdetatil_user`
- Password: `nerdetatil_password`

### Veritabanını Sıfırla:
```bash
docker-compose down -v  # Veriyi sil
docker-compose up -d    # Yeni database ile başlat
```

---

## 📝 API Referansı

### Users
- `POST /api/users` - Kullanıcı oluştur
- `GET /api/users/:id` - Kullanıcı bilgisi

### Posts  
- `GET /api/posts` - Paylaşımları listele (pagination destekli)
- `GET /api/posts/:id` - Paylaşım detayları + yorumlar
- `POST /api/posts` - Paylaşım oluştur
- `POST /api/posts/:id/comments` - Yorum ekle
- `POST /api/posts/:id/like` - Beğeni ekle
- `DELETE /api/posts/:id/like` - Beğeniyi kaldır

### Locations
- `GET /api/locations` - Konumları listele (filtreleme destekli)
- `POST /api/locations` - Konum oluştur

---

## ✨ Başarılı!

Backend sunucunuz başarıyla kuruldu ve veritabanına bağlandı. 

**Sonraki adımlar:**
1. ✓ Backend: Çalışıyor ✓
2. ⏳ Frontend'i API'ye bağla
3. ⏳ Authentication ekle
4. ⏳ Production'a deploy et

Happy coding! 🚀

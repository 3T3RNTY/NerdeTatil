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

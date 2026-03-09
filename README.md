NerdeTatil
==========

NerdeTatil, kullanıcıların gezi ve tatil yaptıkları yerleri kaydedip paylaşabildiği, diğer kullanıcıların paylaşımlarını keşfedip etkileşimde bulunabildiği bir web ve mobil uygulamadır.

Bu depo; web (React + Vite) ve mobil (Expo + React Native) istemcilerini ve proje dokümantasyonunu bir arada barındıran bir monorepo şeklinde yapılandırılmıştır.

---

## Proje Yapısı

Kök dizin yapısı:

```text
NerdeTatil
├─ web/            # Web uygulaması (React + TypeScript + Vite)
├─ mobile/         # Mobil uygulama (Expo + React Native)
└─ documentation/  # Proje dokümantasyonu (örn. Dokumantasyon.pdf)
```

- `web/`: Kullanıcıların tarayıcı üzerinden eriştiği React tabanlı web arayüzü.
- `mobile/`: Expo ile çalışan React Native mobil uygulaması.
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

- **Web**: React.js (TypeScript + Vite)
- **Mobil**: React Native (Expo)
- **State Yönetimi**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Stil**:
  - Web: Tailwind CSS
  - Mobil: NativeWind + TailwindCSS
- **Router (Web)**: `react-router-dom`
- **Harita Entegrasyonu (Web)**: Leaflet

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

### Web Uygulaması (React + Vite) – `web/`

Kurulum:

```bash
cd web
npm install
```

Geliştirme sunucusu:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Build sonrası önizleme:

```bash
npm run preview
```

---

### Mobil Uygulama (Expo + React Native) – `mobile/`

Kurulum:

```bash
cd mobile
npm install
```

Expo geliştirme sunucusunu başlatmak için:

```bash
npm run start
```

Platforma özel kısayollar:

```bash
# Android emülatör / cihaz
npm run android

# iOS simülatör (sadece macOS)
npm run ios

# Web üzerinde Expo
npm run web
```

Telefon üzerinden test için Expo Go uygulamasını indirip, terminalde çıkan QR kodu okutabilirsin.

---

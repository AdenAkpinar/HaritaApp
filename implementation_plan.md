# GIS Web Uygulaması Yol Haritası (Staj Projesi)

Merhaba! Yeni staj görevin hayırlı olsun. CBS (Coğrafi Bilgi Sistemleri) dünyasına adım atmak çok keyiflidir, hiç merak etme adım adım hepsini birlikte yapacağız. 

Mentörünün senden beklediği özellikleri karşılamak için modern ve sağlam bir teknoloji yığını seçmemiz gerekiyor. Daha önceki projelerinde React ve C# kullandığını gördüğüm için bu projede de onlarla ilerlemeyi öneriyorum.

## 🗺️ Proje Yol Haritası

Projeyi daha kolay yönetilebilmesi için 4 ana aşamaya böleceğiz:

1. **Aşama 1: Harita ve Çizim İşlemleri (Şu anki hedefimiz)**
   - Modern bir React (Vite) projesi oluşturulması.
   - Harita kütüphanesinin (OpenLayers veya Leaflet) entegre edilmesi.
   - Harita üzerinde Nokta (Point), Çizgi (LineString) ve Çokgen (Polygon) çizme, düzenleme ve silme araçlarının eklenmesi.
2. **Aşama 2: Veritabanı ve Backend Kurulumu**
   - C# .NET Core Web API projesi oluşturulması.
   - Veritabanında coğrafi verileri (Point, LineString) tutabilmek için `NetTopologySuite` entegrasyonu.
3. **Aşama 3: Frontend ve Backend Entegrasyonu**
   - Haritada çizdiğimiz verilerin veritabanına kaydedilmesi.
   - Veritabanındaki verilerin haritaya getirilmesi.
   - Harita üzerinden bir şekle tıklandığında (Feature) bilgilerinin gösterilmesi.
4. **Aşama 4: Kullanıcı Girişi (Login) Sistemi**
   - Sisteme JWT (JSON Web Token) ile kullanıcı giriş sisteminin eklenmesi.
   - Kullanıcıların sadece kendi çizdikleri verileri görebilmesi/düzenleyebilmesi.

---

## ❓ Open Questions (Açık Sorular)

Başlamadan önce seninle netleştirmemiz gereken birkaç teknik detay var. Lütfen aşağıdaki sorulara yanıt ver:

> [!IMPORTANT]
> 1. **Harita Kütüphanesi:** **Leaflet** (öğrenmesi daha kolay, eklentilerle çok güçlü) mi yoksa **OpenLayers** (daha yetenekli ama öğrenmesi biraz daha zor) mı kullanmak istersin? (Yeni başlıyorsan Leaflet tavsiye ederim).
> 2. **Veritabanı:** Coğrafi verileri tutmak için **PostgreSQL (PostGIS)** mi yoksa **Microsoft SQL Server** mı kullanmayı planlıyorsun?
> 3. **Klasör Yapısı:** Bu projeyi `c:\Users\ADEN\Desktop\cbs` klasörü içinde mi oluşturalım? Yoksa ayrı klasörler mi açalım?

## 🛠️ Proposed Changes (Önerilen İlk Adımlar)

Senin onayınla birlikte ilk olarak **Aşama 1**'den başlayacağız:
- `cbs` klasöründe yeni bir React projesi kuracağım.
- Haritayı ekleyip, çizim araçlarını (Draw, Edit, Delete) yerleştireceğim.

Lütfen soruları yanıtladıktan sonra "Onaylıyorum, Leaflet ve PostgreSQL ile başlayalım" gibi bir geri bildirim ver, hemen kodlamaya başlayalım!

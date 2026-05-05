import React, { useEffect, useRef, useState, useCallback } from 'react';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { fetchGeometries, createGeometry, updateGeometry, logout } from './api';
import Login from './components/Login';

const geoJsonFormat = new GeoJSON();

function App() {
  const [user, setUser] = useState(localStorage.getItem('username'));
  const [features, setFeatures] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Çizilen nesnelerin tutulduğu "havuz"
  const vectorSource = useRef(new VectorSource());

  // Mevcut çizimleri VectorSource'dan çekip React state'ine aktarır
  const refreshFeatureList = useCallback(() => {
    if (!vectorSource.current) return;
    
    try {
      const allFeatures = vectorSource.current.getFeatures().map(f => {
        const geojson = geoJsonFormat.writeFeatureObject(f, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });

        const id = f.getId();
        const rawName = f.get('name');
        const displayName = (!rawName || rawName === "Yeni Nesne") 
                            ? `Nesne ${id || '...'}` 
                            : rawName;

        return {
          id: id,
          name: displayName,
          type: geojson.geometry?.type || 'Unknown',
          coordinates: geojson.geometry?.coordinates || []
        };
      });
      setFeatures(allFeatures);
    } catch (err) {
      console.error("Liste yenilenirken hata:", err);
    }
  }, []);

  // API'den verileri çekip haritaya yükle
  const loadFeaturesFromApi = useCallback(async () => {
    const data = await fetchGeometries();
    if (data && data.features) {
      vectorSource.current.clear(); // Mevcut havuzu temizle
      const olFeatures = geoJsonFormat.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      vectorSource.current.addFeatures(olFeatures);
      refreshFeatureList();
    }
  }, [refreshFeatureList]);

  // Sayfa yüklendiğinde çalışır
  useEffect(() => {
    if (user) loadFeaturesFromApi();
  }, [loadFeaturesFromApi, user]);

  const handleFeatureAdded = useCallback(async (feature) => {
    // Yeni eklenen nesneyi GeoJSON formatına çevir
    const geojson = geoJsonFormat.writeFeatureObject(feature, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326'
    });
    
    geojson.properties = { name: "Yeni Nesne" };

    // API'ye kaydet
    const savedFeature = await createGeometry(geojson);
    
    // NTS GeoJSON, id'yi kök elemanda veya properties içinde döndürebilir
    const returnedId = (savedFeature && savedFeature.id) || (savedFeature && savedFeature.properties && savedFeature.properties.id);
    
    if (savedFeature && returnedId) {
        feature.setId(returnedId);
        feature.setProperties(savedFeature.properties || { name: "Yeni Nesne" });
    } else {
        feature.setId(crypto.randomUUID());
        feature.setProperties({ name: "Yeni Nesne" });
    }

    refreshFeatureList();
    setSelectedId(feature.getId());
  }, [refreshFeatureList]);

  const handleFeatureModified = useCallback(async (modifiedFeatures) => {
    if (!modifiedFeatures || modifiedFeatures.length === 0) return;

    for (const feature of modifiedFeatures) {
      const id = feature.getId();
      if (!id) continue;

      const geojson = geoJsonFormat.writeFeatureObject(feature, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326'
      });

      // API'yi güncelle
      await updateGeometry(id, geojson);
    }
    refreshFeatureList();
  }, [refreshFeatureList]);

  // Giriş başarısı
  const handleLoginSuccess = (data) => {
    setUser(data.username);
  };

  // Eğer kullanıcı giriş yapmamışsa Login sayfasını göster
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: '#0f172a' }}>
      {/* Üst Bar (Kullanıcı Bilgisi ve Logout) */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        right: 370, // Sidebar'ın yanına gelmesi için
        zIndex: 2000, 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(10px)',
        padding: '8px 20px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontWeight: '800', color: '#fff', fontSize: '13px', letterSpacing: '0.5px' }}>{user}</span>
          <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold' }}>GIS UZMANI</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
        <button 
          onClick={logout} 
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
            color: '#fff', 
            border: 'none', 
            padding: '6px 14px', 
            borderRadius: '10px', 
            cursor: 'pointer', 
            fontSize: '11px',
            fontWeight: '700',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ÇIKIŞ
        </button>
      </div>

      {/* SOL TARAF: Harita Bileşeni */}
      <div style={{ flex: 3, height: "100%" }}>
        <MapComponent
          vectorSource={vectorSource}
          selectedId={selectedId}
          onFeatureAdded={handleFeatureAdded}
          onFeatureSelected={setSelectedId} // Haritadan seçilince ID'yi güncelle
          onFeatureModified={handleFeatureModified} // Düzenleme olunca API'yi güncelle
        />
      </div>

      {/* SAĞ TARAF: Bilgi Paneli Bileşeni */}
      <Sidebar
        features={features}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

    </div>
  );
}

export default App;



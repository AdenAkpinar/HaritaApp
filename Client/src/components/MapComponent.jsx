import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Select } from 'ol/interaction'; // Gerekli etkileşimler
import { fromLonLat } from 'ol/proj';

function MapComponent({ vectorSource, selectedId, onFeatureAdded, onFeatureSelected, onFeatureModified }) {
  const mapElement = useRef();
  const mapRef = useRef();
  const selectInteraction = useRef(new Select()); // Seçme aracı
  const modifyInteraction = useRef(new Modify({ features: selectInteraction.current.getFeatures() })); // Düzenleme aracı

  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSource.current })
      ],
      view: new View({
        center: fromLonLat([32.8597, 39.9334]),
        zoom: 12
      })
    });

    // Başlangıçta seçme ve düzenleme araçlarını ekle ama pasif tutabiliriz veya hep aktif bırakabiliriz
    initialMap.addInteraction(selectInteraction.current);
    initialMap.addInteraction(modifyInteraction.current);

    // SEÇME OLAYI: Haritadan bir şey seçilince
    selectInteraction.current.on('select', (e) => {
      const selected = e.selected[0];
      if (onFeatureSelected) {
        onFeatureSelected(selected ? selected.getId() : null);
      }
    });

    // DÜZENLEME OLAYI: Nesne değiştirildiğinde
    modifyInteraction.current.on('modifyend', (e) => {
      const modifiedFeatures = e.features.getArray();
      if (onFeatureModified) onFeatureModified(modifiedFeatures);
    });

    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(null);
    };
  }, [vectorSource, onFeatureAdded, onFeatureSelected, onFeatureModified]);

  // DIŞARIDAN GELEN SEÇİMİ (Sidebar) HARİTAYLA SENKRONİZE ET
  useEffect(() => {
    if (!mapRef.current || !vectorSource.current) return;

    const selectedFeatures = selectInteraction.current?.getFeatures();
    if (!selectedFeatures) return;
    
    selectedFeatures.clear();

    if (selectedId) {
      const feature = vectorSource.current.getFeatureById(selectedId);
      if (feature) {
        selectedFeatures.push(feature);
      }
    }
  }, [selectedId, vectorSource]);

  // Araçları Temizleme ve Yönetme
  const setInteractionsActive = (active) => {
    selectInteraction.current.setActive(active);
    modifyInteraction.current.setActive(active);
  };

  const clearDrawInteractions = () => {
    mapRef.current.getInteractions().forEach(interaction => {
      if (interaction instanceof Draw) mapRef.current.removeInteraction(interaction);
    });
  };

  const startDraw = (type) => {
    clearDrawInteractions();
    setInteractionsActive(false); // Çizim yaparken seçme/düzenlemeyi kapat

    const draw = new Draw({
      source: vectorSource.current,
      type: type
    });

    mapRef.current.addInteraction(draw);

    // Çizim bittiğinde (Çift tıklandığında)
    draw.on('drawend', (e) => {
      mapRef.current.removeInteraction(draw);
      setInteractionsActive(true); // Çizim bittiğinde diğer araçları geri aç
      
      // Çizilen nesneyi App.jsx'e gönder (API kaydı için)
      if (onFeatureAdded) {
        onFeatureAdded(e.feature);
      }
    });
  };

  // SEÇİLİ NESNEYİ SİL
  const handleDeleteSelected = async () => {
    const selectedFeatures = selectInteraction.current.getFeatures();
    if (selectedFeatures.getLength() > 0) {
      if (window.confirm("Seçili nesneyi silmek istediğinize emin misiniz?")) {
        const { deleteGeometry } = await import('../api');
        
        // Asenkron olarak seçili öğeleri sil
        const featuresArray = selectedFeatures.getArray().slice(); // Kopya al
        for (const feature of featuresArray) {
          const id = feature.getId();
          if (id) {
            const success = await deleteGeometry(id);
            if (success) {
              vectorSource.current.removeFeature(feature);
            } else {
              alert("Veritabanından silinirken hata oluştu.");
            }
          } else {
            // Eğer daha API'ye kaydedilmemiş geçici bir nesneyse sadece haritadan sil
            vectorSource.current.removeFeature(feature);
          }
        }
        
        selectedFeatures.clear(); // Seçimi temizle
        if (onFeatureModified) onFeatureModified(); // Listeyi güncelle
      }
    } else {
      alert("Lütfen önce silmek istediğiniz nesneyi seçin.");
    }
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* ARAÇ ÇUBUĞU */}
      <div style={{ 
        position: "absolute", 
        top: 20, 
        left: 20, 
        zIndex: 1000, 
        display: "flex", 
        gap: "10px", 
        background: "rgba(15, 23, 42, 0.8)", 
        padding: "8px", 
        borderRadius: "14px",
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
      }}>
        {[
          { type: 'Point', label: 'NOKTA', icon: '📍' },
          { type: 'LineString', label: 'ÇİZGİ', icon: '📏' },
          { type: 'Polygon', label: 'POLİGON', icon: '⬢' }
        ].map((btn) => (
          <button 
            key={btn.type}
            onClick={() => startDraw(btn.type)}
            style={{
              padding: "10px 16px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            {btn.icon} {btn.label}
          </button>
        ))}

        <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", margin: "auto 5px", height: "24px" }}></div>
        
        <button 
          onClick={handleDeleteSelected} 
          disabled={!selectedId}
          style={{ 
            padding: "10px 16px",
            background: "#ef4444", 
            color: "#fff", 
            border: "none", 
            borderRadius: "10px", 
            cursor: selectedId ? "pointer" : "not-allowed",
            fontSize: "11px",
            fontWeight: "700",
            opacity: selectedId ? 1 : 0.4,
            transition: "all 0.3s ease",
            boxShadow: selectedId ? '0 4px 6px -1px rgba(239, 68, 68, 0.3)' : 'none'
          }}
          onMouseOver={(e) => selectedId && (e.target.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => selectedId && (e.target.style.transform = 'scale(1)')}
        >
          🗑️ SİL
        </button>
      </div>

      <div ref={mapElement} style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default MapComponent;

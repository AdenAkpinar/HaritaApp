import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Select } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';

function MapComponent({ vectorSource, selectedId, onFeatureAdded, onFeatureSelected, onFeatureModified }) {
  const mapElement = useRef();
  const mapRef = useRef();
  const selectInteraction = useRef(new Select());
  const modifyInteraction = useRef(new Modify({ features: selectInteraction.current.getFeatures() }));
  const [isEditMode, setIsEditMode] = useState(false);

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

    initialMap.addInteraction(selectInteraction.current);
    initialMap.addInteraction(modifyInteraction.current);
    modifyInteraction.current.setActive(false);

    selectInteraction.current.on('select', (e) => {
      const selected = e.selected[0];
      if (onFeatureSelected) {
        onFeatureSelected(selected ? selected.getId() : null);
      }
    });

    modifyInteraction.current.on('modifyend', (e) => {
      const modifiedFeatures = e.features.getArray();
      if (onFeatureModified) onFeatureModified(modifiedFeatures);
    });

    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(null);
    };
  }, [vectorSource, onFeatureAdded, onFeatureSelected, onFeatureModified]);

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

  const setInteractionsActive = (active) => {
    selectInteraction.current.setActive(active);
    modifyInteraction.current.setActive(active ? isEditMode : false);
  };

  useEffect(() => {
    if (modifyInteraction.current) {
      modifyInteraction.current.setActive(isEditMode);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (selectedId) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [selectedId]);

  const clearDrawInteractions = () => {
    mapRef.current.getInteractions().forEach(interaction => {
      if (interaction instanceof Draw) mapRef.current.removeInteraction(interaction);
    });
  };

  const startDraw = (type) => {
    clearDrawInteractions();
    setInteractionsActive(false);
    setIsEditMode(false);

    const draw = new Draw({
      source: vectorSource.current,
      type: type
    });

    mapRef.current.addInteraction(draw);

    draw.on('drawend', (e) => {
      mapRef.current.removeInteraction(draw);
      setInteractionsActive(true);
      
      if (onFeatureAdded) {
        onFeatureAdded(e.feature);
      }
    });
  };

  const handleDeleteSelected = async () => {
    const selectedFeatures = selectInteraction.current.getFeatures();
    if (selectedFeatures.getLength() > 0) {
      if (window.confirm("Seçili nesneyi silmek istediğinize emin misiniz?")) {
        const { deleteGeometry } = await import('../api');
        
        const featuresArray = selectedFeatures.getArray().slice();
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
            vectorSource.current.removeFeature(feature);
          }
        }
        
        selectedFeatures.clear();
        if (onFeatureModified) onFeatureModified();
      }
    } else {
      alert("Lütfen önce silmek istediğiniz nesneyi seçin.");
    }
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
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
          onClick={() => setIsEditMode(!isEditMode)} 
          style={{ 
            padding: "10px 16px",
            background: isEditMode ? "#10b981" : "rgba(255,255,255,0.05)", 
            color: "#fff", 
            border: isEditMode ? "1px solid #059669" : "none", 
            borderRadius: "10px", 
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: isEditMode ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
          }}
          onMouseOver={(e) => !isEditMode && (e.target.style.background = 'rgba(59, 130, 246, 0.2)')}
          onMouseOut={(e) => !isEditMode && (e.target.style.background = 'rgba(255,255,255,0.05)')}
        >
          ✏️ {isEditMode ? 'DÜZENLENİYOR...' : 'DÜZENLE'}
        </button>
        
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

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

  const vectorSource = useRef(new VectorSource());

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
        
        let displayName = rawName;
        if (!rawName || rawName === "Yeni Nesne") {
          displayName = (typeof id === 'number') ? `Nesne ${id}` : "Yeni Nesne";
        }

        return {
          id: id,
          name: displayName,
          type: geojson.geometry?.type || 'Unknown',
          coordinates: geojson.geometry?.coordinates || [],
          distance: f.get('distance'),
          duration: f.get('duration')
        };
      });
      setFeatures(allFeatures);
    } catch (err) {
      console.error("Liste yenilenirken hata:", err);
    }
  }, []);

  const loadFeaturesFromApi = useCallback(async () => {
    const data = await fetchGeometries();
    if (data && data.features) {
      vectorSource.current.clear();
      const olFeatures = geoJsonFormat.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      olFeatures.forEach(f => {
        const id = f.get('id');
        if (id) f.setId(id);
      });
      vectorSource.current.addFeatures(olFeatures);
      refreshFeatureList();
    }
  }, [refreshFeatureList]);

  useEffect(() => {
    if (user) loadFeaturesFromApi();
  }, [loadFeaturesFromApi, user]);

  const handleFeatureAdded = useCallback(async (feature) => {
    const geojson = geoJsonFormat.writeFeatureObject(feature, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326'
    });
    
    const properties = { ...feature.getProperties() };
    delete properties.geometry; 
    if (!properties.name) properties.name = "Yeni Nesne";
    geojson.properties = properties;

    const savedFeature = await createGeometry(geojson);
    
    const returnedId = (savedFeature && savedFeature.id) || (savedFeature && savedFeature.properties && savedFeature.properties.id);
    
    if (savedFeature && returnedId) {
        feature.setId(returnedId);
        feature.setProperties(savedFeature.properties || { name: "Yeni Nesne" });
        if (savedFeature.properties) {
          Object.keys(savedFeature.properties).forEach(key => {
            feature.set(key, savedFeature.properties[key]);
          });
        }
    } else {
        feature.setId(crypto.randomUUID());
        feature.setProperties({ name: "Yeni Nesne" });
    }

    refreshFeatureList();
    setSelectedId(feature.getId());
  }, [refreshFeatureList]);

  const handleFeatureModified = useCallback(async (modifiedFeatures) => {
    if (modifiedFeatures && Array.isArray(modifiedFeatures)) {
      for (const feature of modifiedFeatures) {
        const id = feature.getId();
        if (!id) continue;

        const geojson = geoJsonFormat.writeFeatureObject(feature, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });

        await updateGeometry(id, geojson);
      }
    }
    
    refreshFeatureList();
  }, [refreshFeatureList]);

  const handleNameChange = useCallback(async (id, newName) => {
    const feature = vectorSource.current.getFeatureById(id);
    if (!feature) return;

    feature.set('name', newName);

    const geojson = geoJsonFormat.writeFeatureObject(feature, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326'
    });

    await updateGeometry(id, geojson);
    refreshFeatureList();
  }, [refreshFeatureList]);

  const handleLoginSuccess = (data) => {
    setUser(data.username);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: '#0f172a' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        right: 370, 
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

      <div style={{ flex: 3, height: "100%" }}>
        <MapComponent
          vectorSource={vectorSource}
          selectedId={selectedId}
          onFeatureAdded={handleFeatureAdded}
          onFeatureSelected={setSelectedId}
          onFeatureModified={handleFeatureModified}
        />
      </div>

      <Sidebar
        features={features}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNameChange={handleNameChange}
      />

    </div>
  );
}

export default App;

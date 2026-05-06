import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Select } from 'ol/interaction';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { LineString, Point } from 'ol/geom';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';

function MapComponent({ vectorSource, selectedId, onFeatureAdded, onFeatureSelected, onFeatureModified }) {
  const mapElement = useRef();
  const mapRef = useRef();
  const selectInteraction = useRef(new Select());
  const modifyInteraction = useRef(new Modify({ features: selectInteraction.current.getFeatures() }));
  const [isEditMode, setIsEditMode] = useState(false);
  const tooltipElement = useRef();
  const [tooltipData, setTooltipData] = useState(null);
  const [showTooltipCoords, setShowTooltipCoords] = useState(false);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [routingFeatureIds, setRoutingFeatureIds] = useState([]);
  const routingModeRef = useRef(false);
  const routePointsRef = useRef([]);
  const routingFeatureIdsRef = useRef([]);

  useEffect(() => {
    routingModeRef.current = isRoutingMode;
  }, [isRoutingMode]);

  useEffect(() => {
    routePointsRef.current = routePoints;
  }, [routePoints]);

  useEffect(() => {
    routingFeatureIdsRef.current = routingFeatureIds;
  }, [routingFeatureIds]);

  // Varsayılan stil (Renk olayı kaldırıldı)
  const featureStyle = (feature) => {
    const isRoutingSelected = routingFeatureIdsRef.current.includes(feature.getId());
    
    const baseStyle = new Style({
      stroke: new Stroke({ 
        color: isRoutingSelected ? '#fbbf24' : '#3b82f6', 
        width: isRoutingSelected ? 6 : 4 
      }),
      fill: new Fill({ 
        color: isRoutingSelected ? 'rgba(251, 191, 36, 0.4)' : 'rgba(59, 130, 246, 0.2)' 
      }),
      image: new CircleStyle({
        radius: isRoutingSelected ? 10 : 6,
        fill: new Fill({ color: isRoutingSelected ? '#fbbf24' : '#3b82f6' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    });
    
    return baseStyle;
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ 
          source: vectorSource.current,
          style: featureStyle
        })
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

    const popupOverlay = new Overlay({
      element: tooltipElement.current,
      positioning: 'bottom-center',
      stopEvent: true, // Tıklanabilir olması için true yaptık
      offset: [0, -10],
    });
    initialMap.addOverlay(popupOverlay);

    initialMap.on('singleclick', async (evt) => {
      if (routingModeRef.current) {
        const pixel = initialMap.getEventPixel(evt.originalEvent);
        let featureFound = null;
        initialMap.forEachFeatureAtPixel(pixel, (f) => {
          if (f.get('tempMarker')) return false;
          featureFound = f;
          return true;
        });

        let coord;
        if (featureFound) {
          const featureId = featureFound.getId();
          if (featureId && routingFeatureIdsRef.current.includes(featureId)) return;
          if (featureId) setRoutingFeatureIds([...routingFeatureIdsRef.current, featureId]);

          let geom = featureFound.getGeometry();
          coord = geom.getType() === 'Point' 
            ? geom.getCoordinates() 
            : [(geom.getExtent()[0] + geom.getExtent()[2]) / 2, (geom.getExtent()[1] + geom.getExtent()[3]) / 2];
          
          featureFound.changed();
        } else {
          coord = evt.coordinate;
          // Boşluğa tıklanan yer için geçici bir görsel işaretçi ekle
          const marker = new Feature({
            geometry: new Point(coord),
            tempMarker: true
          });
          marker.setStyle(new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: '#fbbf24' }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          }));
          vectorSource.current.addFeature(marker);
        }

        const lonLat = toLonLat(coord);
        const newPoints = [...routePointsRef.current, lonLat];
        setRoutePoints(newPoints);

        if (newPoints.length >= 2) {
          await calculateRoute(newPoints);
          // Tüm geçici işaretçileri temizle
          const features = vectorSource.current.getFeatures();
          features.forEach(f => {
            if (f.get('tempMarker')) vectorSource.current.removeFeature(f);
          });
          setRoutingFeatureIds([]);
        }
        return;
      }

      const pixel = initialMap.getEventPixel(evt.originalEvent);
      let featureFound = null;
      
      initialMap.forEachFeatureAtPixel(pixel, (feature) => {
        featureFound = feature;
        return true;
      });

      if (featureFound) {
        const coordinate = evt.coordinate;
        popupOverlay.setPosition(coordinate);
        const rawName = featureFound.get('name');
        const id = featureFound.getId();
        const displayName = (rawName && rawName !== "Yeni Nesne") 
                            ? rawName 
                            : (typeof id === 'number' ? `Nesne ${id}` : "Yeni Nesne");

        setTooltipData({
          name: displayName,
          type: featureFound.getGeometry().getType(),
          coordinates: featureFound.getGeometry().getCoordinates()
        });
        setShowTooltipCoords(false); // Yeni nesne açıldığında kapalı başlasın
      } else {
        popupOverlay.setPosition(undefined);
        setTooltipData(null);
      }
    });

    initialMap.on('pointermove', (evt) => {
      if (evt.dragging) {
        return;
      }
      const pixel = initialMap.getEventPixel(evt.originalEvent);
      const hit = initialMap.hasFeatureAtPixel(pixel);
      initialMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
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
        
        // Seçilen nesneye odaklan (Sadece Merkeze Al, Zoom Değiştirme)
        const extent = feature.getGeometry().getExtent();
        const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
        
        mapRef.current.getView().animate({
          center: center,
          duration: 1000
        });
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

  const calculateRoute = async (points) => {
    try {
      const coordsString = points.map(p => `${p[0]},${p[1]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoords = route.geometry.coordinates;
        
        // OpenLayers için koordinatları dönüştür
        const olCoords = routeCoords.map(c => fromLonLat(c));
        
        const existingRoutes = vectorSource.current.getFeatures().filter(f => 
          f.get('name')?.startsWith('Güzergah')
        ).length;
        
        const routeFeature = new Feature({
          geometry: new LineString(olCoords),
          name: `Güzergah ${existingRoutes + 1}`,
          distance: route.distance,
          duration: route.duration
        });

        vectorSource.current.addFeature(routeFeature);
        
        if (onFeatureAdded) {
          onFeatureAdded(routeFeature);
        }
      }

      // Reset routing mode
      setIsRoutingMode(false);
      setRoutePoints([]);
      setRoutingFeatureIds([]);
      // Geçici işaretçileri temizle
      vectorSource.current.getFeatures().forEach(f => {
        if (f.get('tempMarker')) vectorSource.current.removeFeature(f);
      });
    } catch (error) {
      console.error("OSRM Hatası:", error);
      alert("Güzergah hesaplanırken bir hata oluştu.");
      setIsRoutingMode(false);
      setRoutePoints([]);
      setRoutingFeatureIds([]);
      vectorSource.current.getFeatures().forEach(f => {
        if (f.get('tempMarker')) vectorSource.current.removeFeature(f);
      });
    }
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
        if (onFeatureSelected) onFeatureSelected(null);
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
            onClick={() => {
              setIsRoutingMode(false);
              startDraw(btn.type);
            }}
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
        
        <button 
          onClick={() => {
            clearDrawInteractions();
            setIsRoutingMode(!isRoutingMode);
            setRoutePoints([]);
            setRoutingFeatureIds([]);
          }}
          style={{
            padding: "10px 16px",
            background: isRoutingMode ? "#3b82f6" : "rgba(255,255,255,0.05)",
            color: "#fff",
            border: isRoutingMode ? "1px solid #2563eb" : "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: isRoutingMode ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
          }}
          onMouseOver={(e) => !isRoutingMode && (e.target.style.background = 'rgba(59, 130, 246, 0.2)')}
          onMouseOut={(e) => !isRoutingMode && (e.target.style.background = 'rgba(255,255,255,0.05)')}
        >
          🛤️ {isRoutingMode ? 'NOKTA SEÇİN...' : 'GÜZERGAH'}
        </button>
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

      <div 
        ref={tooltipElement} 
        style={{
          display: tooltipData ? 'block' : 'none',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#fff',
          fontSize: '13px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
          minWidth: '150px'
        }}
      >
        {tooltipData && (
          <>
            <div style={{ fontWeight: '800', marginBottom: '4px', color: '#60a5fa', letterSpacing: '0.5px' }}>
              {tooltipData.name}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>
              TİP: <span style={{ color: '#10b981' }}>{tooltipData.type}</span>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltipCoords(!showTooltipCoords);
                }}
                style={{ 
                  fontSize: '11px', 
                  color: '#3b82f6', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontWeight: 'bold'
                }}
              >
                <span>Kordinatlar</span>
                <span style={{ transition: 'transform 0.3s ease', transform: showTooltipCoords ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {showTooltipCoords && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '10px', 
                  color: '#10b981', 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '8px', 
                  borderRadius: '6px' 
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(tooltipData.coordinates, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MapComponent;

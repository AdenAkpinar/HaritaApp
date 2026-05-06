import React, { useState, useEffect } from 'react';

function Sidebar({ features, selectedId, onSelect, onNameChange }) {
  const selectedFeature = features.find(f => f.id === selectedId);
  const [editingName, setEditingName] = useState("");
  const [activeTab, setActiveTab] = useState('objects');
  const [showCoords, setShowCoords] = useState(false);

  const objects = features.filter(f => f.distance == null);
  const routes = features.filter(f => f.distance != null);

  const [prevSelectedId, setPrevSelectedId] = useState(null);

  useEffect(() => {
    if (selectedFeature) {
      setEditingName(selectedFeature.name);
      
      // Sadece seçilen nesne DEĞİŞTİĞİNDE sekmeyi otomatik değiştir
      if (selectedFeature.id !== prevSelectedId) {
        setShowCoords(false);
        if (selectedFeature.distance != null) {
          setActiveTab('routes');
        } else {
          setActiveTab('objects');
        }
        setPrevSelectedId(selectedFeature.id);
      }
    } else {
      setPrevSelectedId(null);
    }
  }, [selectedFeature, prevSelectedId]);

  const handleNameSubmit = () => {
    if (selectedFeature && editingName !== selectedFeature.name) {
      if (onNameChange) onNameChange(selectedFeature.id, editingName);
    }
  };

  const renderList = (list, type) => (
    <div style={styles.listWrapper}>
      <h3 style={styles.sectionTitle}>
        {type === 'objects' ? 'Nesne Listesi' : 'Güzergah Listesi'} ({list.length})
      </h3>
      <div style={styles.listContainer}>
        {list.length === 0 ? (
          <p style={styles.emptyText}>Henüz bir {type === 'objects' ? 'nesne' : 'güzergah'} yok.</p>
        ) : (
          list.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelect(f.id)}
              style={{
                ...styles.card,
                ...(selectedId === f.id ? styles.selectedCard : {})
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>{type === 'objects' ? '📍' : '🛣️'}</span>
                <span style={styles.cardName}>{f.name}</span>
              </div>
              <div style={styles.cardDetails}>
                <span style={styles.typeBadge}>{f.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.title}>BİLGİ PANELİ</h2>
        <div style={styles.divider}></div>
      </div>

      <div style={styles.content}>
        <div style={styles.tabsContainer}>
          <div 
            style={{ ...styles.tab, ...(activeTab === 'objects' ? styles.activeTab : {}) }}
            onClick={() => {
              setActiveTab('objects');
              // Eğer şu an bir güzergah seçiliyse ve nesnelere geçiyorsak, seçimi temizle
              if (selectedFeature && selectedFeature.distance != null) {
                onSelect(null);
              }
            }}
          >
            Nesneler
          </div>
          <div 
            style={{ ...styles.tab, ...(activeTab === 'routes' ? styles.activeTab : {}) }}
            onClick={() => {
              setActiveTab('routes');
              // Eğer şu an bir nesne seçiliyse ve güzergahlara geçiyorsak, seçimi temizle
              if (selectedFeature && selectedFeature.distance == null) {
                onSelect(null);
              }
            }}
          >
            Güzergahlar
          </div>
        </div>

        <div style={styles.slidingContainerOuter}>
          <div style={{ 
            ...styles.slidingContainerInner, 
            transform: activeTab === 'objects' ? 'translateX(0)' : 'translateX(-50%)' 
          }}>
            {renderList(objects, 'objects')}
            {renderList(routes, 'routes')}
          </div>
        </div>

        {selectedFeature && (
          <div style={styles.detailsBox}>
            <h4 style={styles.detailsTitle}>Geometri Detayları</h4>
            
            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>İsim:</span>
              <input 
                type="text" 
                value={editingName} 
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                style={styles.nameInput}
              />
            </div>

            <div style={styles.detailsRow}>
              <span style={styles.detailsLabel}>Tip:</span>
              <span style={styles.typeBadge}>{selectedFeature.type}</span>
            </div>

            {selectedFeature.distance && (
              <div style={styles.detailsRow}>
                <span style={styles.detailsLabel}>Mesafe:</span>
                <span style={styles.valueText}>{(selectedFeature.distance / 1000).toFixed(2)} km</span>
              </div>
            )}

            {selectedFeature.duration && (
              <div style={styles.detailsRow}>
                <span style={styles.detailsLabel}>Süre:</span>
                <span style={styles.valueText}>{(selectedFeature.duration / 60).toFixed(1)} dk</span>
              </div>
            )}

            <div style={styles.coordinatesContainer}>
                <div 
                  style={styles.coordsHeader} 
                  onClick={() => setShowCoords(!showCoords)}
                >
                  <span style={styles.detailsLabel}>Koordinatlar</span>
                  <span style={{ 
                    ...styles.arrow, 
                    transform: showCoords ? 'rotate(180deg)' : 'rotate(0deg)' 
                  }}>▼</span>
                </div>
                
                {showCoords && (
                  <pre style={styles.pre}>
                    {JSON.stringify(selectedFeature.coordinates, null, 2)}
                  </pre>
                )}
            </div>
          </div>
        )}
      </div>

      {!selectedFeature && (
        <div style={styles.footer}>
          <p style={styles.footerText}>Detay görmek için bir nesne seçin.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    width: '350px',
    background: '#0f172a',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
    zIndex: 100,
    height: '100%'
  },
  header: {
    padding: '24px',
    textAlign: 'center'
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: 0,
    color: '#3b82f6'
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
    marginTop: '15px'
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  tabsContainer: {
    display: 'flex',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px'
  },
  tab: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    color: 'rgba(255,255,255,0.5)'
  },
  activeTab: {
    background: '#3b82f6',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  slidingContainerOuter: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: '30px'
  },
  slidingContainerInner: {
    display: 'flex',
    width: '200%',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  listWrapper: {
    width: '50%',
    padding: '0 5px'
  },
  sectionTitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '20px'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  selectedCard: {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid #3b82f6',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  cardIcon: { fontSize: '16px' },
  cardName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#fff'
  },
  cardDetails: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  typeBadge: {
    fontSize: '11px',
    background: 'rgba(59, 130, 246, 0.2)',
    padding: '3px 8px',
    borderRadius: '6px',
    color: '#3b82f6',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  detailsBox: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginTop: '20px'
  },
  detailsTitle: {
    margin: '0 0 15px 0',
    fontSize: '15px',
    color: '#fff',
    fontWeight: '700'
  },
  detailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  detailsLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)'
  },
  nameInput: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    width: '180px',
    outline: 'none',
    transition: 'border 0.3s ease'
  },
  coordinatesContainer: {
    marginTop: '15px'
  },
  coordsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 0',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: '10px'
  },
  arrow: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    transition: 'transform 0.3s ease'
  },
  pre: {
    fontSize: '10px',
    background: 'rgba(0,0,0,0.3)',
    padding: '10px',
    borderRadius: '8px',
    overflowX: 'auto',
    color: '#10b981',
    border: '1px solid rgba(255,255,255,0.05)',
    marginTop: '8px'
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '40px'
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(0,0,0,0.2)'
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center'
  },
  valueText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#10b981'
  }
};

export default Sidebar;

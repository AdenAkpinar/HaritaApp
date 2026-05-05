import React, { useState, useEffect } from 'react';

function Sidebar({ features, selectedId, onSelect, onNameChange }) {
  const selectedFeature = features.find(f => f.id === selectedId);

  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (selectedFeature) {
      setEditingName(selectedFeature.name);
    }
  }, [selectedFeature]);

  const handleNameSubmit = () => {
    if (selectedFeature && editingName !== selectedFeature.name) {
      if (onNameChange) onNameChange(selectedFeature.id, editingName);
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.title}>BİLGİ PANELİ</h2>
        <div style={styles.divider}></div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.sectionTitle}>Nesne Listesi ({features.length})</h3>
        
        <div style={styles.listContainer}>
          {features.length === 0 ? (
            <p style={styles.emptyText}>Henüz bir çizim yapılmadı.</p>
          ) : (
            features.map((f) => (
              <div
                key={f.id}
                onClick={() => onSelect(f.id)}
                style={{
                  ...styles.card,
                  ...(selectedId === f.id ? styles.selectedCard : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>📍</span>
                  <span style={styles.cardName}>{f.name}</span>
                </div>
                <div style={styles.cardDetails}>
                  <span style={styles.typeBadge}>{f.type}</span>
                </div>
              </div>
            ))
          )}
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
            <div style={styles.coordinatesContainer}>
                <div style={styles.detailsLabel}>Koordinatlar:</div>
                <pre style={styles.pre}>
                {JSON.stringify(selectedFeature.coordinates, null, 2)}
                </pre>
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
    overflowY: 'auto'
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
    gap: '12px',
    marginBottom: '30px'
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
    border: '1px solid rgba(255,255,255,0.1)'
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
  }
};

export default Sidebar;

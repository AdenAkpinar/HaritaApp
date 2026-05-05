import React, { useState } from 'react';
import { login, register } from '../api';

function Login({ onLoginSuccess }) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && password !== confirmPassword) {
            setError('Şifreler birbiriyle eşleşmiyor.');
            return;
        }

        setLoading(true);
        try {
            if (isRegister) {
                const success = await register(username, password);
                if (success) {
                    alert('Hesabınız başarıyla oluşturuldu! Sisteme giriş yapabilirsiniz.');
                    setIsRegister(false);
                    setConfirmPassword('');
                } else {
                    setError('Bu kullanıcı adı sistemde zaten kayıtlı.');
                }
            } else {
                const data = await login(username, password);
                if (data) {
                    onLoginSuccess(data);
                } else {
                    setError('Erişim reddedildi. Bilgilerinizi kontrol edin.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundOverlay}></div>
            
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.brandTitle}>CBS Paneli</h1>
                </div>

                <div style={styles.tabContainer}>
                    <button 
                        onClick={() => { setIsRegister(false); setError(''); }} 
                        style={{...styles.tab, ...( !isRegister ? styles.activeTab : {} )}}
                    >
                        Giriş Yap
                    </button>
                    <button 
                        onClick={() => { setIsRegister(true); setError(''); }} 
                        style={{...styles.tab, ...( isRegister ? styles.activeTabGreen : {} )}}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Kullanıcı adınızı seçin"
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Şifre Tekrar</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}
                    
                    {error && <div style={styles.errorBox}>{error}</div>}
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{
                            ...styles.submitButton, 
                            ...(isRegister ? styles.submitButtonGreen : {})
                        }}
                    >
                        {loading ? 'İşleniyor...' : (isRegister ? 'Hesabı Oluştur' : 'Giriş Yap')}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
    },
    backgroundOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.9) 100%)',
        zIndex: 1
    },
    card: {
        position: 'relative',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '48px',
        width: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
    },
    header: {
        marginBottom: '32px'
    },
    brandTitle: {
        color: '#fff',
        fontSize: '28px',
        fontWeight: '800',
        letterSpacing: '2px',
        margin: 0,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    brandSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        marginTop: '4px'
    },
    tabContainer: {
        display: 'flex',
        background: 'rgba(0,0,0,0.2)',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '32px'
    },
    tab: {
        flex: 1,
        padding: '10px',
        border: 'none',
        background: 'transparent',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
    },
    activeTab: {
        background: '#3b82f6',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
    },
    activeTabGreen: {
        background: '#10b981',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        textAlign: 'left'
    },
    label: {
        display: 'block',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '13px',
        marginBottom: '8px',
        marginLeft: '4px'
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: '15px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease',
        outline: 'none'
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#f87171',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '13px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    submitButton: {
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
        marginTop: '8px'
    },
    submitButtonGreen: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
    },
    footer: {
        marginTop: '32px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.5px'
    }
};

export default Login;

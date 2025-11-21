"use client";

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh',
      background: '#ea5c2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '64px 48px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#ea5c2a',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          margin: '0 auto 32px'
        }}>
          🍽️
        </div>
        
        <h1 style={{ 
          fontSize: '48px',
          fontWeight: '800',
          color: '#1e1e1e',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          FoodTrack
        </h1>
        
        <p style={{ 
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '40px',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Sign in with Google to analyze your Zomato order emails and track your food spending.
        </p>
        
        <a 
          href="/api/auth" 
          style={{ 
            padding: '16px 40px',
            background: '#1e1e1e',
            color: 'white',
            borderRadius: '16px',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(30, 30, 30, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(30, 30, 30, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(30, 30, 30, 0.3)';
          }}
        >
          Sign in with Google
        </a>
        
        <div style={{
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '500'
          }}>
            🔒 Your data is secure and private
          </p>
        </div>
      </div>
    </main>
  );
}
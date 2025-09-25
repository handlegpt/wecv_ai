import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'WeCV AI - AI驱动的智能简历构建器'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: 'linear-gradient(45deg, #fff, #e0e7ff)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            WeCV AI
          </div>
          <div
            style={{
              fontSize: '28px',
              marginBottom: '24px',
              opacity: 0.95,
            }}
          >
            AI-Powered Smart Resume Builder
          </div>
          <div
            style={{
              fontSize: '20px',
              opacity: 0.85,
              maxWidth: '700px',
              lineHeight: 1.3,
            }}
          >
            Free • Open Source • AI Polishing • Multi-language • Local Storage
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

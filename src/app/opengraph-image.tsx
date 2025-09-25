import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'WeCV AI - AI驱动的智能简历构建器'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '20px',
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            WeCV AI
          </div>
          <div
            style={{
              fontSize: '32px',
              marginBottom: '30px',
              opacity: 0.9,
            }}
          >
            AI驱动的智能简历构建器
          </div>
          <div
            style={{
              fontSize: '24px',
              opacity: 0.8,
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            免费开源 • 支持AI润色 • 多语言 • 数据本地存储 • 无需注册
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

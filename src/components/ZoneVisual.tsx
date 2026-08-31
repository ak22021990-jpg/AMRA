export type ZoneVariant = 'driving' | 'listening' | 'cognitive' | 'pattern' | 'grammar';

export default function ZoneVisual({ variant, active }: { variant: ZoneVariant; active?: boolean }) {
  switch (variant) {
    case 'driving':
      return (
        <div style={{ background: '#1a1a1a', height: '100%', position: 'relative', overflow: 'hidden' }}>
          {/* center dashed lane moving downward */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 8, transform: 'translateX(-50%)',
            backgroundImage: 'repeating-linear-gradient(to bottom, #f4f4f0 0px, #f4f4f0 20px, transparent 20px, transparent 40px)',
            animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite`,
          }} />
          {/* side lane markers */}
          <div style={{ position: 'absolute', left: '20%', top: 0, bottom: 0, width: 3, backgroundImage: 'repeating-linear-gradient(to bottom, #666 0px, #666 16px, transparent 16px, transparent 32px)', animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite` }} />
          <div style={{ position: 'absolute', right: '20%', top: 0, bottom: 0, width: 3, backgroundImage: 'repeating-linear-gradient(to bottom, #666 0px, #666 16px, transparent 16px, transparent 32px)', animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite` }} />
          {/* scan line sweeping across */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(0,85,255,0.25), transparent)', animation: 'zone-scan 2.5s linear infinite' }} />
        </div>
      );
    case 'listening':
      return (
        <div style={{ background: '#1a1a1a', height: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '0 14px', overflow: 'hidden' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, background: i % 3 === 0 ? '#0055ff' : '#f4f4f0', transformOrigin: 'center',
              height: '70%', transform: 'scaleY(0.3)',
              animation: `zone-bar-pulse ${active ? '0.5s' : '1s'} ease-in-out ${i * 0.12}s infinite`,
            }} />
          ))}
        </div>
      );
    case 'cognitive':
      return (
        <div style={{ background: '#1a1a1a', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* rings */}
          <div style={{ position: 'absolute', width: '70%', aspectRatio: '1', border: '1px solid #444', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '45%', aspectRatio: '1', border: '1px solid #444', borderRadius: '50%' }} />
          {/* outer orbit arm with node */}
          <div style={{ position: 'absolute', width: '70%', aspectRatio: '1', animation: `zone-orbit ${active ? '2s' : '4s'} linear infinite` }}>
            <div style={{ position: 'absolute', top: -4, left: '50%', width: 8, height: 8, background: '#0055ff', borderRadius: '50%' }} />
          </div>
          {/* inner orbit arm with node — reverse */}
          <div style={{ position: 'absolute', width: '45%', aspectRatio: '1', animation: `zone-orbit ${active ? '1.5s' : '3s'} linear infinite reverse` }}>
            <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, background: '#f4f4f0', borderRadius: '50%' }} />
          </div>
          {/* center core */}
          <div style={{ width: 10, height: 10, background: '#f4f4f0', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(0,85,255,0.3)' }} />
        </div>
      );
    case 'pattern':
      return (
        <div style={{ background: '#1a1a1a', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 3, padding: '14px' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              background: i % 2 === 0 ? '#f4f4f0' : '#0055ff', opacity: 0.15,
              animation: `zone-tile-blink ${active ? '0.8s' : '1.6s'} ease-in-out ${(i % 3) * 0.2 + Math.floor(i / 3) * 0.4}s infinite`,
            }} />
          ))}
        </div>
      );
    case 'grammar':
      return (
        <div style={{ background: '#1a1a1a', height: '100%', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center', overflow: 'hidden' }}>
          {[0.6, 0.85, 0.4, 0.7].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, height: 6 }}>
              <div style={{ width: `${w * 80}%`, height: '100%', background: i === 2 ? '#0055ff' : '#f4f4f0', opacity: 0.8 }} />
              {i === 2 && <div style={{ width: 3, height: '140%', background: '#fff', animation: 'zone-cursor-blink 0.8s step-end infinite' }} />}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

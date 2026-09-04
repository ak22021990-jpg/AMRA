export type ZoneVariant = 'driving' | 'listening' | 'cognitive' | 'pattern' | 'grammar';

export default function ZoneVisual({ variant, active }: { variant: ZoneVariant; active?: boolean }) {
  const bg = 'transparent';
  const accent = active ? 'var(--accent)' : 'var(--muted)';
  const node = active ? 'var(--fg)' : 'var(--muted)';
  // glow effect for active states
  const filter = active ? 'drop-shadow(0 0 8px var(--accent))' : 'none';

  switch (variant) {
    case 'driving':
      return (
        <div style={{ background: bg, height: '100%', position: 'relative', overflow: 'hidden', filter }}>
          {/* center dashed lane moving downward */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, transform: 'translateX(-50%)',
            backgroundImage: `repeating-linear-gradient(to bottom, ${accent} 0px, ${accent} 20px, transparent 20px, transparent 40px)`,
            animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite`,
          }} />
          {/* side lane markers */}
          <div style={{ position: 'absolute', left: '20%', top: 0, bottom: 0, width: 2, backgroundImage: `repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 16px, transparent 16px, transparent 32px)`, animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite` }} />
          <div style={{ position: 'absolute', right: '20%', top: 0, bottom: 0, width: 2, backgroundImage: `repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 16px, transparent 16px, transparent 32px)`, animation: `zone-road ${active ? '0.4s' : '0.8s'} linear infinite` }} />
          {/* scan line sweeping across */}
          {active && <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent)', animation: 'zone-scan 2.5s linear infinite' }} />}
        </div>
      );
    case 'listening':
      return (
        <div style={{ background: bg, height: '100%', display: 'flex', alignItems: 'center', gap: 4, padding: '0 14px', overflow: 'hidden', filter }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, background: i % 3 === 0 ? accent : 'var(--muted)', transformOrigin: 'center',
              height: '70%', transform: 'scaleY(0.3)', opacity: 0.5, borderRadius: 2,
              animation: `zone-bar-pulse ${active ? '0.5s' : '1s'} ease-in-out ${i * 0.12}s infinite`,
            }} />
          ))}
        </div>
      );
    case 'cognitive':
      return (
        <div style={{ background: bg, height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter }}>
          {/* rings */}
          <div style={{ position: 'absolute', width: '70%', aspectRatio: '1', border: `1px solid ${active ? 'rgba(56,189,248,0.3)' : 'var(--border)'}`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '45%', aspectRatio: '1', border: `1px solid ${active ? 'rgba(56,189,248,0.5)' : 'var(--border)'}`, borderRadius: '50%' }} />
          {/* outer orbit arm with node */}
          <div style={{ position: 'absolute', width: '70%', aspectRatio: '1', animation: `zone-orbit ${active ? '2s' : '4s'} linear infinite` }}>
            <div style={{ position: 'absolute', top: -4, left: '50%', width: 8, height: 8, background: accent, borderRadius: '50%', boxShadow: active ? '0 0 10px currentColor' : 'none' }} />
          </div>
          {/* inner orbit arm with node — reverse */}
          <div style={{ position: 'absolute', width: '45%', aspectRatio: '1', animation: `zone-orbit ${active ? '1.5s' : '3s'} linear infinite reverse` }}>
            <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, background: node, borderRadius: '50%' }} />
          </div>
          {/* center core */}
          <div style={{ width: 10, height: 10, background: node, borderRadius: '50%', boxShadow: active ? '0 0 0 4px rgba(56,189,248,0.3)' : 'none' }} />
        </div>
      );
    case 'pattern':
      return (
        <div style={{ background: bg, height: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 4, padding: '14px', filter }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              background: i % 2 === 0 ? accent : 'var(--muted)', opacity: 0.1, borderRadius: 3,
              color: i % 2 === 0 ? accent : 'var(--fg)',
              animation: `zone-tile-blink ${active ? '1s' : '2s'} ease-in-out ${(i % 3) * 0.2 + Math.floor(i / 3) * 0.4}s infinite`,
            }} />
          ))}
        </div>
      );
    case 'grammar':
      return (
        <div style={{ background: bg, height: '100%', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', overflow: 'hidden', filter }}>
          {[0.6, 0.85, 0.4, 0.7].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 6 }}>
              <div style={{ width: `${w * 80}%`, height: '100%', background: i === 2 ? accent : 'var(--muted)', opacity: 0.8, borderRadius: 2 }} />
              {i === 2 && active && <div style={{ width: 4, height: '180%', background: 'var(--fg)', animation: 'zone-cursor-blink 0.8s step-end infinite' }} />}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

const fs = require('fs');

const files = [
  'src/modules/driving/DrivingModule.tsx',
  'src/modules/listening/ListeningModule.tsx',
  'src/modules/cognitive/CognitiveModule.tsx',
  'src/modules/pattern/PatternModule.tsx',
  'src/modules/grammar/GrammarModule.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Inject the aurora glow right after the start of the card div for the intro screen
  content = content.replace(
    /(<div className="card grain" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>)/,
    '$1\n        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: -150, right: -150, pointerEvents: "none" }} />\n        <div style={{ position: "absolute", inset: 0, background: "var(--aurora-gradient)", opacity: 0.03, pointerEvents: "none" }} />'
  );
  // Add relative and overflow hidden if not there
  content = content.replace(
    /className="card grain" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}/,
    'className="card grain" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", overflow: "hidden" }}'
  );
  fs.writeFileSync(f, content);
  console.log('Decorated module intro:', f);
});

// Also decorate ResultsReport
let rr = fs.readFileSync('src/pages/ResultsReport.tsx', 'utf8');
rr = rr.replace(
  /(<div className="score-hero grain" style={{ marginTop: 32, borderRadius: 20 }}>)/,
  '$1\n          <div style={{ position: "absolute", inset: 0, background: "var(--aurora-gradient)", opacity: 0.05, pointerEvents: "none" }} />'
);
fs.writeFileSync('src/pages/ResultsReport.tsx', rr);

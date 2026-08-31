const fs = require('fs');

const files = [
  'src/pages/ResultsReport.tsx',
  'src/modules/driving/DrivingModule.tsx',
  'src/modules/listening/ListeningModule.tsx',
  'src/modules/cognitive/CognitiveModule.tsx',
  'src/modules/pattern/PatternModule.tsx',
  'src/modules/grammar/GrammarModule.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/background: '?(?:#f2f4f7|#f8fafc|#f9fafb)'?/g, "background: 'var(--surface-subtle)'");
  content = content.replace(/color: '?(?:#475467|#344054)'?/g, "color: 'var(--ink)'");
  content = content.replace(/color: '?(?:#d0d5dd)'?/g, "color: 'var(--muted-light)'");
  content = content.replace(/border: '1px solid #eaecf0'/g, "border: '1px solid var(--line)'");
  
  if (f.includes('ResultsReport')) {
      content = content.replace(/className="card"/g, 'className="card grain"');
      content = content.replace(/className="score-hero"/g, 'className="score-hero grain"');
  } else {
      content = content.replace(/className="card" style={{ maxWidth: 640/g, 'className="card grain" style={{ maxWidth: 640');
  }
  fs.writeFileSync(f, content);
  console.log('Processed', f);
});
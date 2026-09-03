import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResultsReport from './pages/ResultsReport';
import DrivingModule from './modules/driving/DrivingModule';
import ListeningModule from './modules/listening/ListeningModule';
import CognitiveModule from './modules/cognitive/CognitiveModule';
import PatternModule from './modules/pattern/PatternModule';
import GrammarModule from './modules/grammar/GrammarModule';
import TestPage from './pages/TestPage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useConfetti } from './hooks/useConfetti';

function NotFound() {
  return (
    <div style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 850, letterSpacing: '-0.06em', color: 'var(--muted)' }}>404</div>
      <h2 style={{ marginTop: 16 }}>Page not found</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The assessment module you are looking for does not exist.</p>
      <Link to="/" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Back to Dashboard</Link>
      <div style={{ marginTop: 12 }}>
        <Link to="/test" style={{ color: 'var(--muted)', fontSize: 12, textDecoration: 'none' }}>UI Component Test</Link>
      </div>
    </div>
  );
}

export default function App() {
  const prefersReduced = useReducedMotion();
  const fireConfetti = useConfetti();

  return (
    <>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/driving" element={<DrivingModule />} />
            <Route path="/listening" element={<ListeningModule />} />
            <Route path="/cognitive" element={<CognitiveModule />} />
            <Route path="/pattern" element={<PatternModule />} />
            <Route path="/grammar" element={<GrammarModule />} />
            <Route path="/results" element={<ResultsReport />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <button
          onClick={fireConfetti}
          style={{ padding: '12px 24px', background: '#00A3FF', color: 'white', borderRadius: '9999px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Test Confetti
        </button>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Reduced motion: {prefersReduced ? 'Yes' : 'No'}
        </div>
      </div>
    </>
  );
}

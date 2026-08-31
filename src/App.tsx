import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResultsReport from './pages/ResultsReport';
import DrivingModule from './modules/driving/DrivingModule';
import ListeningModule from './modules/listening/ListeningModule';
import CognitiveModule from './modules/cognitive/CognitiveModule';
import PatternModule from './modules/pattern/PatternModule';
import GrammarModule from './modules/grammar/GrammarModule';

function NotFound() {
  return (
    <div style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 850, letterSpacing: '-0.06em', color: 'var(--muted)' }}>404</div>
      <h2 style={{ marginTop: 16 }}>Page not found</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The assessment module you are looking for does not exist.</p>
      <Link to="/" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Back to Dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/driving" element={<DrivingModule />} />
          <Route path="/listening" element={<ListeningModule />} />
          <Route path="/cognitive" element={<CognitiveModule />} />
          <Route path="/pattern" element={<PatternModule />} />
          <Route path="/grammar" element={<GrammarModule />} />
          <Route path="/results" element={<ResultsReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

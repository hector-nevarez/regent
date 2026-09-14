import { useState, useEffect } from 'react'

type Health = { ok: boolean; db: boolean; env: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then(setHealth)
    .catch((e: Error) => setError(e.message));
  }, []);

  return(
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Regent - Phase 0</h1>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
      {!health && !error && <p>Checking...</p>}
    </main>
  );
}
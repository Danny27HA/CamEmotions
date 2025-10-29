// src/App.jsx
import { useEffect, useRef, useState } from 'react';
import { startCamera, captureToCanvas, canvasToDataURL } from './camera';
import { loadModels, detectEmotion, toSentiment } from './emotion';
import { saveRecord, listRecordsDesc } from './db';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      await loadModels(); // carga modelos TFJS
      await startCamera(videoRef.current); // inicia cámara
      setReady(true);
      const items = await listRecordsDesc();
      setHistory(items);
    })();
  }, []);

  async function onCaptureAnalyze() {
    try {
      setBusy(true);
      const canvas = captureToCanvas(videoRef.current, canvasRef.current);
      const dataURL = canvasToDataURL(canvas);
      const result = await detectEmotion(canvas);
      if (!result) {
        setLast({ error: 'No se detectó rostro, intenta otra toma.' });
        return;
      }
      const { label, score } = result;
      const sentiment = toSentiment(label);

      const rec = {
        id: uuidv4(),
        timestamp: Date.now(),
        imageDataURL: dataURL,
        label: sentiment,              // positivo/negativo/neutro
        rawLabel: label,               // happy/sad/...
        score: Number(score.toFixed(3))
      };
      await saveRecord(rec);
      setLast(rec);
      setHistory((prev) => [rec, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: 16, fontFamily: 'system-ui, Segoe UI, sans-serif' }}>
      <h1>Analizador de Sentimiento por Rostro (Local)</h1>
      <p style={{ marginTop: -8, color: '#444' }}>
        Cámara → Capturar → Analizar → Guardar automático (IndexedDB). Historial anti-cronológico.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: 12, border: '1px solid #ddd' }} />
          <button onClick={onCaptureAnalyze} disabled={!ready || busy} style={{ marginTop: 12, padding: '10px 16px' }}>
            {busy ? 'Analizando…' : 'Capturar y Analizar'}
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {last && (
            <div style={{ marginTop: 12, padding: 12, border: '1px solid #eee', borderRadius: 12 }}>
              {last.error ? (
                <b>{last.error}</b>
              ) : (
                <>
                  <img src={last.imageDataURL} alt="última" style={{ width: '100%', borderRadius: 8 }} />
                  <div style={{ marginTop: 8 }}>
                    <b>Resultado:</b> {last.label} <span style={{ color: '#666' }}>(raw: {last.rawLabel}, score: {last.score})</span>
                  </div>
                  <small style={{ color: '#666' }}>
                    {new Date(last.timestamp).toLocaleString()}
                  </small>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <h3>Historial (nuevo → viejo)</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 12, border: '1px solid #eee', borderRadius: 12, padding: 8 }}>
                <img src={h.imageDataURL} alt="hist" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <div><b>{h.label}</b> <span style={{ color: '#666' }}>(raw: {h.rawLabel}, score: {h.score})</span></div>
                  <small style={{ color: '#666' }}>{new Date(h.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
            {history.length === 0 && <small style={{ color: '#666' }}>Aún no hay registros.</small>}
          </div>
        </div>
      </div>

      <hr style={{ margin: '24px 0' }} />
      <details>
        <summary>Notas éticas / límites</summary>
        <ul>
          <li>Solicita <b>consentimiento</b> antes de capturar el rostro.</li>
          <li>Las “emociones” por rostro son <b>aproximaciones</b> y pueden fallar con gafas, iluminación, etc.</li>
          <li>Todo se procesa y guarda <b>localmente</b> (no se sube a la nube).</li>
        </ul>
      </details>
    </div>
  );
}
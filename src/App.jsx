// src/App.jsx
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { startCamera, switchCamera, captureToCanvas, canvasToDataURL } from './camera';
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

  // Inicializa modelos y cámara al cargar
  useEffect(() => {
    (async () => {
      await loadModels();
      await startCamera(videoRef.current);
      setReady(true);
      const items = await listRecordsDesc();
      setHistory(items);
    })();
  }, []);

  // Captura y analiza emoción
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
        label: sentiment,
        rawLabel: label,
        score: Number(score.toFixed(3)),
      };

      await saveRecord(rec);
      setLast(rec);
      setHistory((prev) => [rec, ...prev]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <h1>🎭 Analizador de Emociones</h1>
      <p>Captura una foto y descubre el estado emocional detectado por la IA.</p>

      <div className="camera-section">
        <video ref={videoRef} autoPlay muted playsInline />
        <div className="controls">
          <button onClick={onCaptureAnalyze} disabled={!ready || busy}>
            {busy ? 'Analizando...' : '📸 Capturar y Analizar'}
          </button>
          <button onClick={() => switchCamera(videoRef.current)}>
            🔄 Cambiar cámara
          </button>
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {last && (
        <div className="result-card">
          <img src={last.imageDataURL} alt="resultado" />
          <div className="result-text">
            <h3>{last.label}</h3>
            <p>({last.rawLabel}, confianza: {last.score})</p>
          </div>
        </div>
      )}

      <h2>🕒 Historial</h2>
      <div className="history">
        {history.map((h) => (
          <div className="history-item" key={h.id}>
            <img src={h.imageDataURL} alt="historial" />
            <div>
              <b>{h.label}</b>
              <p>{new Date(h.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
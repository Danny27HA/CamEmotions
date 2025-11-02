// src/App.jsx
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { startCamera, switchCamera, captureToCanvas, canvasToDataURL } from './camera';
import { loadModels, detectEmotion, toSentiment } from './emotion';
import { saveRecord, listRecordsDesc, clearRecords } from './db';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);
  const [objectURL, setObjectURL] = useState(null); // guardamos la URL de imagen importada

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

  // Captura desde la cámara y analiza
  async function onCaptureAnalyze() {
    try {
      setBusy(true);
      const canvas = captureToCanvas(videoRef.current, canvasRef.current);
      await processAndSaveCanvas(canvas);
    } finally {
      setBusy(false);
    }
  }

  // Analiza imagen cargada desde archivo
  async function onUploadAnalyze(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Revocar URL anterior si existe
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
      setObjectURL(null);
    }

    const img = new Image();
    const newURL = URL.createObjectURL(file);
    setObjectURL(newURL);
    img.src = newURL;

    await new Promise((res) => (img.onload = res));

    // Redimensiona antes de analizar (máx 500x500)
    const maxDim = 500;
    const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    await processAndSaveCanvas(canvas);
    fileInputRef.current.value = ''; // limpia input
  }

  // Procesa un canvas (ya sea de cámara o imagen subida)
  async function processAndSaveCanvas(canvas) {
    const dataURL = canvasToDataURL(canvas);
    const result = await detectEmotion(canvas);

    if (!result) {
      setLast({ error: 'No se detectó rostro en la imagen.' });
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
  }

  // Borra todo el historial e imagen actual
  async function onClearHistory() {
    if (!window.confirm('¿Deseas borrar todo el historial de análisis?')) return;

    // Revocar URL temporal (imagen importada)
    if (objectURL) {
      URL.revokeObjectURL(objectURL);
      setObjectURL(null);
    }

    await clearRecords();
    setHistory([]);
    setLast(null);
  }

  return (
    <div className="app-container">
      <div className="card">
        <header className="header">
          <h1>Analizador de Emociones</h1>
          <p>Captura o sube una imagen para analizar su estado emocional</p>
        </header>

        <div className="camera-wrapper">
          <video ref={videoRef} autoPlay muted playsInline />
        </div>

        <div className="buttons">
          <button className="btn primary" onClick={onCaptureAnalyze} disabled={!ready || busy}>
            {busy ? 'Analizando...' : 'Capturar y Analizar'}
          </button>

          <button className="btn secondary" onClick={() => switchCamera(videoRef.current)}>
            Cambiar cámara
          </button>

          <button className="btn secondary" onClick={() => fileInputRef.current.click()}>
            Subir imagen
          </button>

          <button className="btn danger" onClick={onClearHistory}>
            Borrar historial
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={onUploadAnalyze}
          />
        </div>

        {last && (
          <div className="result-card">
            {last.error ? (
              <p>{last.error}</p>
            ) : (
              <>
                <img src={last.imageDataURL} alt="resultado" className="result-image" />
                <div className="result-text">
                  <h3>{last.label}</h3>
                  <p>{last.rawLabel} — confianza: {last.score}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="emotion-panel">
          <h2>Historial</h2>
          {history.length === 0 ? (
            <p>No hay registros previos</p>
          ) : (
            <div className="history-grid">
              {history.map((h) => (
                <div className="history-item" key={h.id}>
                  <img src={h.imageDataURL} alt="historial" />
                  <div className="history-info">
                    <b>{h.label}</b>
                    <p>{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer>
        <p>Desarrollado con React y Face API</p>
      </footer>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

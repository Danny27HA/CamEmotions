// src/emotion.js
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

export async function loadModels() {
  // backends: tfjs-webgl por defecto en navegador
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
}

export async function detectEmotion(input) {
  // input = HTMLCanvasElement o HTMLVideoElement o HTMLImageElement
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 });
  const detection = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks()
    .withFaceExpressions();

  if (!detection) return null;

  // expressions: { angry, disgusted, fearful, happy, neutral, sad, surprised }
  const expr = detection.expressions;
  const entries = Object.entries(expr);
  entries.sort((a, b) => b[1] - a[1]);
  const [label, score] = entries[0]; // top-1

  return { label, score };
}

export function toSentiment(label) {
  switch (label) {
    case 'happy':
      return 'Está contento 😊';
    case 'sad':
      return 'Está triste 😢';
    case 'angry':
      return 'Está enojado 😠';
    case 'disgusted':
      return 'Tiene disgusto o desagrado 😒';
    case 'fearful':
      return 'Está asustado o nervioso 😨';
    case 'surprised':
      return 'Está sorprendido 😲';
    case 'neutral':
      return 'Se ve neutral o tranquilo 😐';
    default:
      return 'Estado desconocido 🤔';
  }
}

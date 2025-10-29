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
  const negative = ['angry', 'disgusted', 'fearful', 'sad'];
  if (label === 'happy') return 'positivo';
  if (negative.includes(label)) return 'negativo';
  return 'neutro'; // neutral / surprised
}

// src/camera.js
export async function startCamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

export function captureToCanvas(videoEl, canvasEl, maxSize = 512) {
  const ratio = videoEl.videoWidth / videoEl.videoHeight;
  let w = videoEl.videoWidth;
  let h = videoEl.videoHeight;
  if (w > maxSize) { w = maxSize; h = Math.round(w / ratio); }
  canvasEl.width = w;
  canvasEl.height = h;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvasEl;
}

export function canvasToDataURL(canvasEl) {
  return canvasEl.toDataURL('image/jpeg', 0.92);
}

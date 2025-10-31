let currentFacingMode = 'user'; // 'user' = frontal, 'environment' = trasera
let currentStream = null;

export async function startCamera(videoEl, facingMode = 'user') {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
  }

  const constraints = {
    video: { facingMode },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = stream;
  await videoEl.play();

  currentStream = stream;
  currentFacingMode = facingMode;

  return stream;
}

export async function switchCamera(videoEl) {
  const newMode = currentFacingMode === 'user' ? 'environment' : 'user';
  await startCamera(videoEl, newMode);
}

export function captureToCanvas(videoEl, canvasEl, maxSize = 512) {
  const ratio = videoEl.videoWidth / videoEl.videoHeight;
  let w = videoEl.videoWidth;
  let h = videoEl.videoHeight;
  if (w > maxSize) {
    w = maxSize;
    h = Math.round(w / ratio);
  }
  canvasEl.width = w;
  canvasEl.height = h;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  return canvasEl;
}

export function canvasToDataURL(canvasEl) {
  return canvasEl.toDataURL('image/jpeg', 0.92);
}

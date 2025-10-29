# 🎭 CamEmotions
Aplicación web que analiza emociones en tiempo real a través de la cámara usando **IA con TensorFlow.js** y **Face-API**.  
Detecta expresiones faciales (feliz, triste, enojado, sorprendido, etc.) y las clasifica en un mensaje descriptivo.  
Cada captura se guarda localmente junto con su resultado y se muestra en un historial ordenado de forma anti-cronológica.

---

## 🧠 Características principales

- 🧍‍♂️ Detección automática de rostros con **TinyFaceDetector**  
- 😊 Clasificación de emociones con **FaceExpressionNet**  
- 💾 Guarda cada foto y resultado localmente usando **IndexedDB (localforage)**  
- 🕒 Historial en orden de más reciente a más antiguo  
- 🔒 Todo funciona **localmente**, sin conexión ni envío de datos a la nube  
- 🌐 Funciona directamente en el navegador (no requiere instalación especial)

---

## ⚙️ Requisitos

- **Node.js** versión 18 o superior  
  👉 [https://nodejs.org/](https://nodejs.org/)  
- **npm** (incluido con Node.js)
- Una cámara funcional (integrada o externa)
- Navegador compatible con WebGL (Chrome, Edge, Firefox)

---

## 🚀 Instalación y ejecución

### 1 Clonar el repositorio
Abre una terminal (Git Bash o VS Code) y ejecuta:

```bash
git clone https://github.com/Danny27HA/CamEmotions.git
cd CamEmotions
```
### 2 Instalar dependencias
```bash
npm install
```
Esto instalará todas las librerías necesarias:
@vladmandic/face-api

@tensorflow/tfjs
@tensorflow/tfjs-backend-webgl
localforage
uuid
react
vite

### 3 Verificar modelos
Asegúrate de tener los modelos dentro de:

public/models/  Estos archivos incluyen:

tiny_face_detector_model-weights_manifest.json
face_landmark_68_model-weights_manifest.json
face_expression_model-weights_manifest.json
y sus respectivos .bin.

### 4 Ejecutar en modo desarrollo
```bash
npm run dev
```
La terminal mostrará algo como:

VITE v7.x.x  ready in 800 ms
➜  Local: http://localhost:5173/


Abre ese enlace en tu navegador y permite el acceso a la cámara.

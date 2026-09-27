# AI Sign Language Translator

A web UI for translating sign language into text and speech in real time.

## How it works

The camera feed is analysed in the browser with [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker),
which finds 21 points on your hand. A small rule-based recogniser (`src/lib/gestures.ts`) turns
those points into one of six signs. Holding a sign steady for a moment adds its phrase to the
output in the chosen language:

| Sign | Phrase |
| ---- | ------ |
| ✋ Open palm | Hello! |
| 👍 Thumbs up | Yes. |
| ✊ Fist | No. |
| ✌️ Victory | Thank you. |
| ☝️ Pointing | I need help. |
| 🤟 I love you | I love you. |

The hand model (about 8 MB) is downloaded from Google's model server the first time the camera
starts. Video never leaves the device. Full ASL, ISL or BSL vocabularies would need a trained
sign-language model on top of the hand landmarks.

## Tech stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- MediaPipe Tasks Vision

## Getting started

Requires Node.js and npm.

```sh
npm install
npm run dev
```

The dev server runs at http://localhost:8080. Browsers only allow camera access on `localhost`
or `https://` pages.

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the dev server             |
| `npm run build`     | Build for production into `dist` |
| `npm run preview`   | Preview the production build     |
| `npm run lint`      | Run ESLint                       |
| `npm test`          | Run the tests                    |

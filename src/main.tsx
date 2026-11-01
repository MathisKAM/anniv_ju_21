import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import './styles/tokens.css'
import './styles/app.css'
import './styles/birthday.css'
import './styles/letter.css'
import './styles/restaurant.css'
import './styles/gift.css'
import './styles/final.css'
import './styles/football.css'
import './styles/solar.css'
import './styles/scene.css'
import './styles/field.css'
import './styles/table.css'
import './styles/answers.css'
import './styles/lab.css'
import './styles/venus.css'
import './styles/arcade.css'
import './styles/trophies.css'
import './styles/memory.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}))
}

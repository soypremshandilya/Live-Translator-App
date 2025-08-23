import ReactDOM from 'react-dom/client'
import App from './App'
import { VoicesProvider } from './Utils/Voices'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<VoicesProvider><App /></VoicesProvider>)

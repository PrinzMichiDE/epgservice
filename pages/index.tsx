import { useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')

  const handleGrab = async () => {
    try {
      const response = await fetch('/api/cron-grab')
      const data = await response.text()
      setMessage(data)
    } catch (error) {
      setMessage('Fehler beim Ausführen des Grab-Skripts')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>EPG Grabber Frontend</h1>
      <button onClick={handleGrab}>Grab-Skript manuell starten</button>
      {message && <p>{message}</p>}
    </div>
  )
} 
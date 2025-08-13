import { useState } from 'react'
import Layout from './components/Layout.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  )
}

export default App;

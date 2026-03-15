import './App.css'
import ChatPage from "./pages/ChatPage.tsx";
import {useEffect, useState} from "react";

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

    return (
    <ChatPage theme={theme} onToggleTheme={toggleTheme}></ChatPage>
  )
}

export default App

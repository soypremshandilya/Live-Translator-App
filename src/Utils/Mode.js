import { useEffect, useState } from "react"

export default function useMode() {

    const localMode = localStorage.getItem('mode') ? JSON.parse(localStorage.getItem('mode')) :
        window.matchMedia('(prefers-color-scheme: light)').matches

    const [mode, setMode] = useState(localMode)

    useEffect(() => {
        let check = window.matchMedia('(prefers-color-scheme: light)')
        function change() {
            setMode(check.matches)
        }
        check.addEventListener('change', change)
        return () => check.removeEventListener('change', change)
    }, [])

    document.querySelector('meta[name="theme-color"]').content = mode ? '#ededed' : '#121212'

    if (localStorage.getItem('mode')) window.AndroidInterface?.setTheme(mode ? 'light' : 'dark')

    return { mode, setMode }
}

import React, { createContext, useEffect, useMemo, useState } from 'react'

const useVoices = createContext()

export function VoicesProvider({ children }) {

    const [lang1, setLang1] = useState(localStorage.getItem('lang1') || 'en')
    const [lang2, setLang2] = useState(localStorage.getItem('lang2') || 'hi')
    const [voices, setVoices] = useState([])
    const [selectedVoice1, setSelectedVoice1] = useState(null)
    const [selectedVoice2, setSelectedVoice2] = useState(null)

    const voices1 = useMemo(() => voices.filter(({ lang }) => lang.slice(0, 2) === lang1), [lang1, voices])
    const voices2 = useMemo(() => voices.filter(({ lang }) => lang.slice(0, 2) === lang2), [lang2, voices])

    useEffect(() => {
        const voices = window.speechSynthesis?.getVoices()
        if (Array.isArray(voices) && voices.length) setVoices(voices)
        else window.speechSynthesis?.onvoiceschanged = () => setVoices(window.speechSynthesis?.getVoices())
        return () => window.speechSynthesis?.onvoiceschanged = null
    }, [])

    useEffect(() => {
        if (voices1.length) setSelectedVoice1(voices1[0])
        if (voices2.length) setSelectedVoice2(voices2[0])
        if (localStorage.getItem('lang1') !== lang1) localStorage.setItem('lang1', lang1)
        if (localStorage.getItem('lang2') !== lang2) localStorage.setItem('lang2', lang2)
    }, [lang1, lang2])

    return (
        <useVoices.Provider value={{
            lang1, setLang1,
            lang2, setLang2,
            voices,
            voices1, voices2,
            selectedVoice1, setSelectedVoice1,
            selectedVoice2, setSelectedVoice2
        }}>{children}
        </useVoices.Provider>
    )
}

export default useVoices
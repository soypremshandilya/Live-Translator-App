import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import handleTranslate from '../Utils/Conn'
import useVoices from '../Utils/Voices'
import { languages } from '../Db/Languages'
import DropDown from '../Components/DropDown/DropDown'
import Textbox from '../Components/Textbox/Textbox'
import { TiMicrophone } from "react-icons/ti"
import { FaStop } from "react-icons/fa6"
import { GoArrowSwitch } from "react-icons/go"
import './VoicePage.css'

export default function VoicePage() {

    const [texts, setTexts] = useState([])
    const [mic1, setMic1] = useState(false)
    const [mic2, setMic2] = useState(false)
    const textsRef = useRef(null)
    const timeoutRef = useRef(null)
    const { lang1, setLang1, lang2, setLang2, voices, selectedVoice1, selectedVoice2 } = useContext(useVoices)
    const controller = new AbortController()

    useEffect(() => {
        const placeHolder1 = languages.find(({ code }) => code === lang1).placeholder
        const placeHolder2 = languages.find(({ code }) => code === lang2).placeholder
        setTexts([{ text1: placeHolder1, text2: placeHolder2 }])
    }, [lang1, lang2])

    useEffect(() => {
        textsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [texts])

    const speechRecognition = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, [])
    const recognition = useMemo(() => (new speechRecognition()), [])

    function handleRecord1() {
        if (mic2) stop()
        else {
            recognition.lang = lang1
            recognition.start()

            recognition.onstart = () => setMic1(true)
            recognition.onspeechend = () => recognition.stop()
            recognition.onaudioend = () => timeoutRef.current = setTimeout(() => setMic1(false), 1000)

            recognition.onresult = event => {
                clearTimeout(timeoutRef.current)
                const current = event.resultIndex
                const transcript = event.results[current][0].transcript
                handleTranslate(transcript, lang2, controller).then(resText => {
                    setTexts(prevTexts => [...prevTexts, { text1: transcript, text2: resText }])
                    handleSpeak(resText, lang2, selectedVoice2).onend = () => setTimeout(() => {
                        setMic1(false)
                        handleRecord2()
                    }, 500)
                }).catch(error => {
                    if (error.name === 'AbortError') console.log('Aborted')
                    else {
                        stop()
                        throw error
                    }
                })
            }
        }
    }

    function handleRecord2() {
        if (mic1) stop()
        else {
            recognition.lang = lang2
            recognition.start()

            recognition.onstart = () => setMic2(true)
            recognition.onspeechend = () => recognition.stop()
            recognition.onaudioend = () => timeoutRef.current = setTimeout(() => setMic2(false), 1000)

            recognition.onresult = event => {
                clearTimeout(timeoutRef.current)
                const current = event.resultIndex
                const transcript = event.results[current][0].transcript
                handleTranslate(transcript, lang1, controller).then(resText => {
                    setTexts(prevTexts => [...prevTexts, { text1: resText, text2: transcript }])
                    handleSpeak(resText, lang1, selectedVoice1).onend = () => setTimeout(() => {
                        setMic2(false)
                        handleRecord1()
                    }, 500)
                }).catch(error => {
                    if (error.name === 'AbortError') console.log('Aborted')
                    else {
                        stop()
                        throw error
                    }
                })
            }
        }
    }

    function handleSpeak(text, lang, selectedVoice) {
        if (!text) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        if (selectedVoice) utterance.voice = selectedVoice
        window.speechSynthesis.speak(utterance)
        return utterance
    }

    function stop() {
        recognition.abort()
        controller.abort()
        window.speechSynthesis.cancel()
        setMic1(false)
        setMic2(false)
    }

    function switchLang() {
        const temp = lang1
        setLang1(lang2)
        setLang2(temp)
    }

    const availableLanguages = new Set(voices.map(({ lang }) => lang.slice(0, 2)))
    const filteredLangs = languages.filter(({ code }) => availableLanguages.has(code))
    const languageOptions = filteredLangs.map(({ code, name }) => ({ text: name, value: code }))

    const transcripts = texts.map(({ text1, text2 }, idx) => <Textbox key={idx} text1={text1} text2={text2}
        lang1={lang1} lang2={lang2} selectedVoice1={selectedVoice1} selectedVoice2={selectedVoice2}
        handleSpeak={handleSpeak} />)

    return (
        <div className="voice-page-container">
            <div className='texts-container'>
                {transcripts}
                <span className='scroll-to-bottom' ref={textsRef} />
            </div>
            <div className='bottom-container'>
                <DropDown items={languageOptions} selected={lang1} setSelected={setLang1} name='lang1' />
                <button type='button' className='switch-btn' onClick={switchLang}>{<GoArrowSwitch />}</button>
                <DropDown items={languageOptions} selected={lang2} setSelected={setLang2} name='lang2' />
                {mic1 ? <button type='button' className='cancel' onClick={stop}>{<FaStop />}</button>
                    : <button type='button' className='record-btn' onClick={handleRecord1}>{<TiMicrophone size='1.5rem' />}</button>}
                {mic2 ? <button type='button' className='cancel' onClick={stop}>{<FaStop />}</button>
                    : <button type='button' className='record-btn' onClick={handleRecord2}>{<TiMicrophone size='1.5rem' />}</button>}
            </div>
        </div>
    )
}

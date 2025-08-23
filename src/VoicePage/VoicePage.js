import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import handleTranslate from '../Utils/Conn'
import useVoices from '../Utils/Voices'
import { languages } from '../Db/Languages'
import DropDown from '../Components/DropDown/DropDown'
import Textbox from '../Components/Textbox/Textbox'
import { TiMicrophone } from "react-icons/ti"
import { BsFillPatchExclamationFill } from "react-icons/bs"
import { FaStop } from "react-icons/fa6"
import { GoArrowSwitch } from "react-icons/go"
import './VoicePage.css'

export default function VoicePage() {

    const [texts, setTexts] = useState([])
    const [mic1, setMic1] = useState(false)
    const [mic2, setMic2] = useState(false)
    const [audioCircle, setAudioCircle] = useState(1)
    const [processing, setProcessing] = useState(false)
    const textsRef = useRef(null)
    const timeoutRef = useRef(null)
    const streamRef = useRef(null)
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

            recognition.onstart = () => {
                setMic1(true)
                visualizer()
            }
            recognition.onspeechend = () => recognition.stop()
            recognition.onaudioend = () => {
                timeoutRef.current = setTimeout(() => setMic1(false), 1000)
                streamRef.current?.getTracks().forEach(track => track.stop())
                streamRef.current = null
                setAudioCircle(1)
            }

            recognition.onresult = event => {
                clearTimeout(timeoutRef.current)
                setProcessing(true)
                const current = event.resultIndex
                const transcript = event.results[current][0].transcript
                handleTranslate(transcript, lang2, controller).then(resText => {
                    setTexts(prevTexts => [...prevTexts, { text1: transcript, text2: resText }])
                    handleSpeak(resText, lang2, selectedVoice2).onend = () => setTimeout(() => {
                        setMic1(false)
                        setProcessing(false)
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

            recognition.onstart = () => {
                setMic2(true)
                visualizer()
            }
            recognition.onspeechend = () => recognition.stop()
            recognition.onaudioend = () => {
                timeoutRef.current = setTimeout(() => setMic2(false), 1000)
                streamRef.current?.getTracks().forEach(track => track.stop())
                streamRef.current = null
                setAudioCircle(1)
            }

            recognition.onresult = event => {
                clearTimeout(timeoutRef.current)
                setProcessing(true)
                const current = event.resultIndex
                const transcript = event.results[current][0].transcript
                handleTranslate(transcript, lang1, controller).then(resText => {
                    setTexts(prevTexts => [...prevTexts, { text1: resText, text2: transcript }])
                    handleSpeak(resText, lang1, selectedVoice1).onend = () => setTimeout(() => {
                        setMic2(false)
                        setProcessing(false)
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

    async function visualizer() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const audioContext = new AudioContext()
        const audioSource = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        audioSource.connect(analyser)

        function visualize() {
            if (!streamRef.current) return
            requestAnimationFrame(visualize)
            analyser.getByteTimeDomainData(dataArray)
            const sum = dataArray.reduce((acc, value) => acc + ((value / 128 - 1) ** 2), 0)
            const rms = Math.sqrt(sum / bufferLength)
            const logRMS = Math.log10(rms + 1)
            const scale = 1 + logRMS * 25
            setAudioCircle(scale)
        }
        visualize()
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
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setAudioCircle(1)
        setMic1(false)
        setMic2(false)
        setProcessing(false)
        clearTimeout(timeoutRef.current)
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
                <DropDown items={languageOptions} selected={lang1} setSelected={setLang1} name='lang1'
                    classname='voice-lang' />
                <button type='button' className='switch-btn' onClick={switchLang}>{<GoArrowSwitch />}</button>
                <DropDown items={languageOptions} selected={lang2} setSelected={setLang2} name='lang2'
                    classname='voice-lang' />
                {mic1 ?
                    <div className='stop-div voice' style={{ '--scale': audioCircle }}>
                        <BsFillPatchExclamationFill />
                        <button type='button' className={`cancel${processing ? ' processing' : ''}`} onClick={stop}>
                            {<FaStop />}
                        </button>
                    </div>
                    : <button type='button' className='record-btn' onClick={handleRecord1}>
                        {<TiMicrophone size='1.5rem' />}
                    </button>}
                {mic2 ?
                    <div className='stop-div voice last' style={{ '--scale': audioCircle }}>
                        <BsFillPatchExclamationFill />
                        <button type='button' className={`cancel${processing ? ' processing' : ''}`} onClick={stop}>
                            {<FaStop />}
                        </button>
                    </div>
                    : <button type='button' className='record-btn last' onClick={handleRecord2}>
                        {<TiMicrophone size='1.5rem' />}
                    </button>}
            </div>
        </div>
    )
}

import React, { useContext, useEffect, useRef, useState } from 'react'
import handleTranslate from '../Utils/Conn'
import useVoices from '../Utils/Voices'
import { languages } from '../Db/Languages'
import DropDown from '../Components/DropDown/DropDown'
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { MdOutlineContentCopy } from "react-icons/md"
import { GoArrowSwitch } from "react-icons/go"
import { FaStop } from 'react-icons/fa6'
import './TextPage.css'

export default function TextPage() {

    const languageOptions = languages.map(({ code, name }) => ({ text: name, value: code }))
    const [text1, setText1] = useState('')
    const [text2, setText2] = useState('')
    const [speaking1, setSpeaking1] = useState(false)
    const [speaking2, setSpeaking2] = useState(false)
    const { lang1, setLang1, lang2, setLang2, selectedVoice1, selectedVoice2 } = useContext(useVoices)
    const translatedRef = useRef(null)
    const controller = new AbortController()

    useEffect(() => {
        if (text1) {
            translatedRef.current.classList.add('loading')
            handleTranslate(text1, lang2, controller).then(resText =>
                setText2(resText)
            ).then(() => translatedRef.current.classList.remove('loading'))
                .catch(error => {
                    if (error.name !== 'AbortError') {
                        translatedRef.current.classList.remove('loading')
                        throw error
                    }
                })
        }
        else {
            translatedRef.current.classList.remove('loading')
            setText2('')
        }
        return () => controller.abort()
    }, [text1, lang1, lang2])

    function handleSpeak(text, lang, selectedVoice, setSpeaking) {
        if (!text) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        if (selectedVoice) utterance.voice = selectedVoice
        window.speechSynthesis.speak(utterance)
        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
    }

    function stopSpeak(setSpeaking) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
    }

    function handleCopy(event, text) {
        if (text) {
            navigator.clipboard.writeText(text)
            event.target.classList.add('copied')
            setTimeout(() => event.target.classList.remove('copied'), 2000)
        }
    }

    function switchLang() {
        const temp = lang1
        setLang1(lang2)
        setLang2(temp)
        const tempText = text1
        setText1(text2)
        setText2(tempText)
    }

    return (
        <div className='text-page-container'>
            <div className='text-div'>
                <textarea value={text1} onChange={e => setText1(e.target.value)} placeholder='Enter text here' />
                <MdOutlineContentCopy onClick={e => handleCopy(e, text1)} />
                {speaking1 ? <span onClick={() => stopSpeak(setSpeaking1)}><FaStop /></span>
                    : <HiOutlineSpeakerWave onClick={() => handleSpeak(text1, lang1, selectedVoice1, setSpeaking1)} />}
            </div>
            <div className='text-div' ref={translatedRef}>
                <textarea value={text2} placeholder='Translated text will appear here' disabled />
                <MdOutlineContentCopy onClick={e => handleCopy(e, text2)} />
                {speaking2 ? <span onClick={() => stopSpeak(setSpeaking2)}><FaStop /></span>
                    : <HiOutlineSpeakerWave onClick={() => handleSpeak(text2, lang2, selectedVoice2, setSpeaking2)} />}
            </div>
            <div className='language-div'>
                <DropDown items={languageOptions} selected={lang1} setSelected={setLang1} name='lang1' />
                <button type='button' className='switch-btn' onClick={switchLang}>{<GoArrowSwitch />}</button>
                <DropDown items={languageOptions} selected={lang2} setSelected={setLang2} name='lang2' />
            </div>
        </div>
    )
}

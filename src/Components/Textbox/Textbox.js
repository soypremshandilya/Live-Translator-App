import { useState } from 'react'
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { FaStop } from 'react-icons/fa6'
import './Textbox.css'

export default function Textbox({ text1, text2, lang1, lang2, selectedVoice1, selectedVoice2, handleSpeak }) {

    const [speaking1, setSpeaking1] = useState(false)
    const [speaking2, setSpeaking2] = useState(false)

    function handleSpeakText(text, lang, selectedVoice, setSpeaking) {
        if (!text) return
        const utterance = handleSpeak(text, lang, selectedVoice)
        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
    }

    function stopSpeak(setSpeaking) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
    }

    return (
        <div className='textbox-div'>
            {speaking1 ?
                <p onClick={() => stopSpeak(setSpeaking1)}>
                    {text1}<span><FaStop /></span>
                </p> :
                <p onClick={() => handleSpeakText(text1, lang1, selectedVoice1, setSpeaking1)}>
                    {text1}<HiOutlineSpeakerWave />
                </p>}
            <hr />
            {speaking2 ?
                <p onClick={() => stopSpeak(setSpeaking2)}>
                    {text2}<span><FaStop /></span>
                </p> :
                <p onClick={() => handleSpeakText(text2, lang2, selectedVoice2, setSpeaking2)}>
                    {text2}<HiOutlineSpeakerWave />
                </p>}
        </div>
    )
}

import React, { useContext, useEffect, useState } from 'react'
import handleTranslate, { handleUpload } from '../Utils/Conn'
import imageCompression from 'browser-image-compression'
import useVoices from '../Utils/Voices'
import { languages } from '../Db/Languages'
import DropDown from '../Components/DropDown/DropDown'
import { BiImages } from "react-icons/bi"
import { BsFillPatchExclamationFill } from "react-icons/bs"
import { FaStop } from "react-icons/fa6"
import { HiOutlineSpeakerWave } from "react-icons/hi2"
import { MdOutlineContentCopy } from "react-icons/md"
import './ImagePage.css'

export default function ImagePage() {
    const [file, setFile] = useState(null)
    const [translatedText, setTranslatedText] = useState('')
    const [processing, setProcessing] = useState(false)
    const [speaking, setSpeaking] = useState(false)
    const { lang2, setLang2, selectedVoice2 } = useContext(useVoices)
    const controller = new AbortController()

    function handleFileChange(event) {
        setFile(event.target.files[0])
    }

    useEffect(() => {
        if (file) {
            setProcessing(true)
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, signal: controller.signal }
            imageCompression(file, options).then(compressedFile => handleUpload(compressedFile, controller)
                .then(text => {
                    handleTranslate(text, lang2, controller).then(resText => {
                        setTranslatedText(resText)
                        setProcessing(false)
                    }).catch(error => {
                        if (error.name === 'AbortError') console.log('Aborted')
                        else throw error
                    })
                }).catch(error => {
                    if (error.name === 'AbortError') console.log('Aborted')
                    else throw error
                })
            ).catch(error => {
                if (error.name === 'AbortError') console.log('Aborted')
                else throw error
            })
        }
        return () => controller.abort()
    }, [file, lang2])

    const languageOptions = languages.map(({ code, name }) => ({ text: name, value: code }))

    function stopProcessing() {
        setFile(null)
        controller.abort()
        setProcessing(false)
    }

    function handleSpeak() {
        if (!translatedText) return
        const utterance = new SpeechSynthesisUtterance(translatedText)
        utterance.lang = lang2
        if (selectedVoice2) utterance.voice = selectedVoice2
        window.speechSynthesis.speak(utterance)
        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
    }

    function stopSpeak() {
        window.speechSynthesis.cancel()
        setSpeaking(false)
    }

    function handleCopy(event) {
        event.target.classList.add('copied')
        navigator.clipboard.writeText(translatedText)
        setTimeout(() => event.target.classList.remove('copied'), 2000)
    }

    return (
        <div className='image-page-container'>
            {processing ?
                <div className='stop-div'>
                    <BsFillPatchExclamationFill />
                    <button type='button' className='stop-btn' onClick={stopProcessing}><FaStop /></button>
                </div> :
                <label>
                    <BiImages />
                    <input type="file" onChange={handleFileChange} accept='image/jpeg, image/png' />
                </label>}
            <DropDown items={languageOptions} selected={lang2} setSelected={setLang2} name='lang' classname='image-lang' />
            <div className='translate-textbox'>
                <p>{translatedText}</p>
                <MdOutlineContentCopy onClick={handleCopy} />
                {speaking ? <span onClick={stopSpeak}><FaStop /></span> : <HiOutlineSpeakerWave onClick={handleSpeak} />}
            </div>
        </div>
    )
}

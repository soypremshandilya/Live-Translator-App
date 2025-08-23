import { useContext, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import useVoices from '../Utils/Voices'
import BottomSheet from '../Components/BottomSheet/BottomSheet'
import { RiSpeakLine } from "react-icons/ri"
import './Navbar.css'

export default function Navbar({ mode, setMode }) {

    const sheetRef = useRef([])
    const { lang1, lang2, voices1, voices2, setSelectedVoice1, setSelectedVoice2 } = useContext(useVoices)

    function openSheet() {
        sheetRef.current[1].classList.remove('close')
    }

    return (
        <>
            <div className='navbar-container'>
                <div className='navbar'>
                    <NavLink to='text' className={({ isActive }) => isActive ? 'active' : ''}><div>Text</div></NavLink>
                    <NavLink to='/' className={({ isActive }) => isActive ? 'active' : ''}><div>Voice</div></NavLink>
                    <NavLink to='image' className={({ isActive }) => isActive ? 'active' : ''}><div>Image</div></NavLink>
                </div>
                <span className='voice-sheet-btn' ref={el => sheetRef.current[0] = el} onClick={openSheet}>
                    {<RiSpeakLine />}
                </span>
            </div>
            <Outlet />
            <BottomSheet lang1={lang1} lang2={lang2} voices1={voices1} voices2={voices2} setSelected1={setSelectedVoice1} setSelected2={setSelectedVoice2} refEl={sheetRef} mode={mode} setMode={setMode} />
        </>
    )
}

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import './DropDown.css'

export default function DropDown({ items, selected, setSelected, name, classname }) {

    const ref = useRef([])

    function handleChange(event) {
        setSelected(event.target.value)
        openClose()
    }

    function openClose() {
        ref.current[1].classList.toggle('open')
    }

    useEffect(() => {
        function checkDropDown(event) {
            if (!ref.current[0]?.contains(event.target) && !ref.current[1]?.contains(event.target) &&
                ref.current[1]?.classList.contains('open')) openClose()
        }
        window.addEventListener('click', checkDropDown)
        return () => window.removeEventListener('click', checkDropDown)
    }, [])

    const dropDownElems = items.map((item, idx) => <DropDownItem key={idx} text={item?.text} name={name}
        handleChange={handleChange} selected={selected} value={item?.value} />)

    const selectedText = useMemo(() => items.find(item => item?.value === selected)?.text, [selected, items])

    useLayoutEffect(() => {
        const height = ref.current[2].clientHeight
        ref.current[1].style.setProperty('--height-value', `${height}px`)
    }, [items])

    return (
        <div className={`dropdown-container ${classname ? classname : ''}`}>
            <button type='button' className='dropdown-btn' onClick={openClose} ref={el => ref.current[0] = el}>
                {selectedText}
            </button>
            <div ref={el => ref.current[1] = el} className='dropdown'>
                <div className='dropdown-wrapper' ref={el => ref.current[2] = el}>
                    {dropDownElems}
                </div>
            </div>
        </div>
    )
}

function DropDownItem({ text, name, handleChange, selected, value }) {
    return (
        <label>
            <p>{text}</p>
            <input type='radio' name={name} value={value} data-checked={value === selected ? 'checked' : ''}
                onChange={handleChange} />
        </label>
    )
}
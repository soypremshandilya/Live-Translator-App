//Main File
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import useMode from './Utils/Mode'
import Navbar from './Navbar/Navbar'
import VoicePage from './VoicePage/VoicePage'
import TextPage from './TextPage/TextPage'
import ImagePage from './ImagePage/ImagePage'
import NotFound from './NotFoundPage/NotFoundPage'
import ErrorElem from './ErrorPage/ErrorPage'
import ErrorBoundary from './ErrorPage/ErrorBoundary'

export default function App() {

    const { mode, setMode } = useMode()

    return (
        <div id='theme' data-mode={mode ? 'light' : 'dark'}>
            <ErrorBoundary>
                <Router>
                    <Routes>
                        <Route path='/' element={<Navbar mode={mode} setMode={setMode} />} errorElement={<ErrorElem />}>
                            <Route index element={<VoicePage />} />
                            <Route path='text' element={<TextPage />} />
                            <Route path='image' element={<ImagePage />} />
                        </Route>
                        <Route path='*' element={<NotFound />} errorElement={<ErrorElem />} />
                    </Routes>
                </Router>
            </ErrorBoundary>
        </div>
    )
}

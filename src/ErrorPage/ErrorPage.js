import { useRouteError } from 'react-router-dom'
import './ErrorPage.css'

export default function ErrorElem() {

    const error = useRouteError()
    console.error(error)

    return (
        <div className='error-div'>
            <h1>Oops, something went wrong!</h1>
            <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
    )
}
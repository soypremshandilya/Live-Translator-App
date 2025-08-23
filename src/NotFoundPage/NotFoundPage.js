import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFound() {

    return (
        <div className='notfound-div'>
            <h1>Sorry, the page you were looking for was not found.</h1>
            <Link to={'/'}>Return to Home</Link>
        </div>
    )
}
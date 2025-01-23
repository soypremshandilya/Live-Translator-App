import React, { Component } from 'react'
import './ErrorPage.css'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo)
    }


    render() {
        if (this.state.hasError) {
            return (
                <div className='error-div'>
                    <h1>Oops, something went wrong!</h1>
                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                </div>
            )
        }

        return this.props.children
    }
}
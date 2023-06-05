import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Window = () => {
    const { designType } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState(null)

    useEffect(() => {

        const getDesignTypes = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`http://127.0.0.1:8000/osdag-web/${designType}`, {
                    method: 'GET'
                });
                const jsonData = await response.json();
                console.log(JSON.stringify(jsonData))
                setResults(jsonData.result);
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                console.log('Error fetching data:', error);
            }
        }

        getDesignTypes()
    }, [designType])

    if (!results && !isLoading) return <div>Module Under Development</div>


    return (
        <div>
            {isLoading && <div>Loading...</div>}
            <h1>{designType}</h1>
        </div>
    )
}

export default Window
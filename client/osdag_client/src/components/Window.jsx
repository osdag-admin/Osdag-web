import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Window = () => {
    const { designType } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [subDesignTypes, setSubDesignTypes] = useState(null)
    const [activeTab, setActiveTab] = useState(1)
    const [subActiveTab, setSubActiveTab] = useState(1)

    const getSubDesignTypes = async (item) => {
        setIsLoading(true)
        try {
            const response = await fetch(`http://127.0.0.1:8000/osdag-web/${designType}/${item.name.toLowerCase().replaceAll("_", '-')}`, {
                method: 'GET'
            });
            const jsonData = await response.json();
            console.log(jsonData.result)
            setSubDesignTypes(jsonData.result);
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.log('Error fetching data:', error);
        }
    }

    useEffect(() => {

        const getDesignTypes = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`http://127.0.0.1:8000/osdag-web/${designType}`, {
                    method: 'GET'
                });
                const jsonData = await response.json();
                console.log(jsonData.result)
                setResults(jsonData.result);
                if (jsonData.result.has_subtypes === true) {
                    getSubDesignTypes(jsonData.result.data[0])
                }
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                setResults(null)
                console.log('Error fetching data:', error);
            }
        }

        getDesignTypes()
    }, [designType])

    useEffect(() => {
        if (!results) return;
        getSubDesignTypes(results.data[activeTab - 1])
    }, [activeTab])


    if (!results && !isLoading) return <div>Module Under Development</div>


    return (
        <div>
            {isLoading && <div>Loading...</div>}
            <div className='container'>
                <div className='bloc-tabs'>
                    {results && results.has_subtypes && results.data.map((item, index) => {
                        return (
                            <button
                                key={item.id}
                                className={activeTab === item.id ? "tab-btn tabs active-tabs" : "tab-btn tabs"}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.name}
                            </button>
                        )
                    })}
                </div>
                <div className='bloc-tabs'>
                    {subDesignTypes && subDesignTypes.has_subtypes && subDesignTypes.data.map((item, index) => {
                        return (
                            <button
                                key={item.id}
                                className={subActiveTab === item.id ? "tab-btn tabs active-tabs" : "tab-btn tabs"}
                                onClick={() => setSubActiveTab(item.id)}
                            >
                                {item.name}
                            </button>
                        )
                    })}
                </div>
                {results && !results.has_subtypes &&
                    <div className='content-tabs'>
                        {results.data.map((item, index) => {
                            return (
                                <div
                                // className={activeTab === item.id ? "content  active-content" : "content"}
                                >
                                    <hr />
                                    <div className='conn-grid-container'>
                                        <div className='conn-grid-item'>
                                            <input type="radio" value="Fin_Plate" name="shear-conn"></input>
                                            <b>{item.name}</b><br />
                                            {/* <img src={sc1} /> */}
                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                        <center><div className='conn-btn'><button>Start</button></div></center>
                    </div>
                }

            </div>
        </div>
    )
}

export default Window
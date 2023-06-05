import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Window = () => {
    const { designType } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [subDesignTypes, setSubDesignTypes] = useState(null)
    const [leafLevelDesignType, setLeafLevelDesignType] = useState(null)
    const [activeTab, setActiveTab] = useState(1)
    const [subActiveTab, setSubActiveTab] = useState(1)
    // const [leafActiveTab, setLeafActiveTab] = useState(1)
    const [errorMsg, setErrorMsg] = useState(null)

    const getLeafLevelDesignType = async (prev_item, item) => {
        setIsLoading(true)
        try {
            console.log(designType)
            const response = await fetch(`http://127.0.0.1:8000/osdag-web/${designType}/${prev_item.name.toLowerCase().replaceAll("_", '-')}/${item.name.toLowerCase().replaceAll("_", '-')}`, {
                method: 'GET'
            });
            const jsonData = await response.json();
            console.log(jsonData.result)
            setLeafLevelDesignType(jsonData.result);
            setIsLoading(false)
            setErrorMsg(null)
        } catch (error) {
            setIsLoading(false)
            setLeafLevelDesignType(null)
            setErrorMsg("Module Under Development")
            console.log('Error fetching data:', error);
        }
    }

    const getSubDesignTypes = async (item) => {
        setLeafLevelDesignType(null)
        setIsLoading(true)
        try {
            const response = await fetch(`http://127.0.0.1:8000/osdag-web/${designType}/${item.name.toLowerCase().replaceAll("_", '-')}`, {
                method: 'GET'
            });
            const jsonData = await response.json();
            console.log(jsonData.result)
            setSubDesignTypes(jsonData.result);
            if (jsonData.result.has_subtypes === true) {
                getLeafLevelDesignType(item, jsonData.result.data[0])
            }
            setIsLoading(false)
            setErrorMsg(null)
        } catch (error) {
            setIsLoading(false)
            setSubDesignTypes(null)
            setErrorMsg("Module Under Development")
            console.log('Error fetching data:', error);
        }
    }

    useEffect(() => {
        setResults(null)
        setSubDesignTypes(null)
        setLeafLevelDesignType(null)
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
                    setActiveTab(1)
                }
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                setResults(null)
                setErrorMsg("Module Under Development")
                setErrorMsg(null)
                console.log('Error fetching data:', error);
            }
        }

        getDesignTypes()
    }, [designType])

    useEffect(() => {
        if (!results && !subDesignTypes) return;
        getLeafLevelDesignType(results.data[activeTab - 1], subDesignTypes.data[subActiveTab - 1])
    }, [subActiveTab])

    useEffect(() => {
        if (!results) return;
        getSubDesignTypes(results.data[activeTab - 1])
    }, [activeTab])


    if (!results && !isLoading) return <div>Module Under Development</div>


    return (
        <div>
            <div className='container'>
                <div className='bloc-tabs'>
                    {results && results.has_subtypes && results.data.map((item) => {
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
                    {subDesignTypes && subDesignTypes.has_subtypes && subDesignTypes.data.map((item) => {
                        return (
                            <button
                                key={item.id}
                                className={subActiveTab === item.id ? "tab-btn tabs active-subtabs" : "tab-btn tabs"}
                                onClick={() => setSubActiveTab(item.id)}
                            >
                                {item.name}
                            </button>
                        )
                    })}
                </div>
                <div className='design-types-cont'>
                    {results && !results.has_subtypes &&
                        <div className='content-tabs'>
                            {results.data.map((item) => {
                                return (
                                    <div key={item.id}
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
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
                    {subDesignTypes && !subDesignTypes.has_subtypes &&
                        <div className='content-tabs'>
                            {subDesignTypes.data.map((item) => {
                                return (
                                    <div key={item.id}
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
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
                    {leafLevelDesignType && !leafLevelDesignType.has_subtypes &&
                        <div className='content-tabs'>
                            {leafLevelDesignType.data.map((item) => {
                                return (
                                    <div key={item.id}
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
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
            {errorMsg && <div>{errorMsg}</div>}
        </div>
    )
}

export default Window
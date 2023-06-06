import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import bolted_to_end from '../assets/TensionMember/bolted_to_end.png'
import welded_to_end from '../assets/TensionMember/welded_to_end.png'
import sc_fin_plate from '../assets/ShearConnection/sc_fin_plate.png'
import sc_end_plate from '../assets/ShearConnection/sc_end_plate.png'
import sc_cleat_angle from '../assets/ShearConnection/sc_cleat_angle.png'
import sc_seated_angle from '../assets/ShearConnection/sc_seated_angle.png'
import mc_btb_cpb from '../assets/MomentConnection/mc_btb_cpb.png'
import mc_btb_cpw from '../assets/MomentConnection/mc_btb_cpw.png'
import mc_btb_ep from '../assets/MomentConnection/mc_btb_ep.png'
import mc_ctc_cpb from '../assets/MomentConnection/mc_ctc_cpb.png'
import mc_ctc_cpw from '../assets/MomentConnection/mc_ctc_cpw.png'
import mc_ctc_ep from '../assets/MomentConnection/mc_ctc_ep.png'
import mc_btc_ep from '../assets/MomentConnection/mc_btc_ep.png'
import base_plate from '../assets/BasePlate/base_plate.png'

const image_map = {
    bolted_to_end,
    welded_to_end,
    sc_cleat_angle,
    sc_end_plate,
    sc_fin_plate,
    sc_seated_angle,
    mc_btb_cpb,
    mc_btb_cpw,
    mc_btb_ep,
    mc_ctc_cpb,
    mc_ctc_cpw,
    mc_ctc_ep,
    mc_btc_ep,
    base_plate
}

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
                        <>
                        <div className='content-tabs'>
                            {results.data.map((item) => {
                                return ( // Tension Member
                                    <div key={item.id}
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
                                        <div className='conn-grid-container'>
                                            <div className='conn-grid-item'>
                                                <input type="radio" value={item.name} name="shear-conn"></input>
                                                <b>{item.name.replaceAll("_"," ")}</b><br />
                                                <img src={image_map[item.image_name]} alt={item.name} />
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                            
                        </div>
                        <center><div className=''><button className='start-btn'>Start</button></div></center>
                        </>
                    }
                    {subDesignTypes && !subDesignTypes.has_subtypes &&
                    <>
                        <div className='content-tabs'>
                            {subDesignTypes.data.map((item) => {
                                return ( // Shear Connection
                                    <div key={item.id} 
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
                                        <div className='conn-grid-container'>
                                        
                                            <div className='conn-grid-item'>
                                                <input type="radio" value={item.name} name="shear-conn"></input>
                                                <b>{item.name.replaceAll("_"," ")}</b><br />
                                                <img src={image_map[item.image_name]} alt={item.name} />
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                            
                        </div>
                        <center><div className=''><button className='start-btn'>Start</button></div></center>
                        </>
                    }
                    {leafLevelDesignType && !leafLevelDesignType.has_subtypes &&
                    <>
                        <div className='content-tabs'>
                            {leafLevelDesignType.data.map((item) => {
                                return (// Momwnt Connection
                                    <div key={item.id}
                                    // className={activeTab === item.id ? "content  active-content" : "content"}
                                    >
                                        <div className='conn-grid-container'>
                                            <div className='conn-grid-item'>
                                                <input type="radio" value={item.name} name="shear-conn"></input>
                                                <b>{item.name.replaceAll("_"," ")}</b><br />
                                                <img src={image_map[item.image_name]} alt={item.name} />
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                            
                        </div>
                        <center>
                                <div className=''>
                                    <button className='start-btn'>Start</button>
                                </div>
                            </center>
                        </>
                    }
                </div>
            </div>
            {errorMsg && <div>{errorMsg}</div>}
        </div>
    )
}

export default Window
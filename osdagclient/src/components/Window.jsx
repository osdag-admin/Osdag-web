import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { GlobalContext } from '../context/GlobalState'
import { ModuleContext } from '../context/ModuleState'

// importing images
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
    const navigate = useNavigate();
    const { designType } = useParams();
    const [activeTab, setActiveTab] = useState(1)
    const [subActiveTab, setSubActiveTab] = useState(1)
    const [selectedDesign, setSelectedDesign] = useState(null)

    const { results, getDesignTypes, getSubDesignTypes, subDesignTypes, leafLevelDesignType, getLeafLevelDesignType, error_message } = useContext(GlobalContext)
    const { setTheCookie , cookieSetter } = useContext(ModuleContext)

    // Radio selected ,Background change
const [selectedItemBack, setSelectedItemBack] = useState(null); 
    const wrapper = () => {
        getDesignTypes(designType)
    }

    useEffect(() => {
        if (!results) return;
        if (results.has_subtypes === true) {
            const { name } = results.data[0]
            getSubDesignTypes(designType, name)
            setActiveTab(1)
        }
    }, [results])

    useEffect(() => {
        if (!subDesignTypes) return;

        if (subDesignTypes.has_subtypes === true) {
            const { name: prev_item } = results.data[activeTab - 1]
            const { name } = subDesignTypes.data[0]
            getLeafLevelDesignType(designType, prev_item, name)
            setSubActiveTab(1)
        }

    }, [subDesignTypes])

    useEffect(() => {
        wrapper()
    }, [designType])

    useEffect(() => {
        if (!results || !subDesignTypes) return;

        if (subDesignTypes.has_subtypes === true) {
            const { name: prev_item } = results.data[activeTab - 1]
            const { name } = subDesignTypes.data[subActiveTab - 1]
            getLeafLevelDesignType(designType, prev_item, name)
        }

    }, [subActiveTab])

    useEffect(() => {
        if (!results) return;
        const { name } = results.data[activeTab - 1]
        getSubDesignTypes(designType, name)
    }, [activeTab])

    if (!results) return <div>Module Under Development</div>


    return (
        <div>
            <div className='container'>
            <div className='bloc-tabs'>
                {results && results.has_subtypes && results.data.map((item) => {
                return (
                    <button
                    key={item.id}
                    className={activeTab === item.id ? "tab-btn tabs active-tabs" : "tab-btn tabs"}
                    onClick={() => {
                        setActiveTab(item.id);// set the value of current active tab
                        setSelectedItemBack(null); // Refresh the value of selectedItemBack
                    }}
                    >
                    {item.name.replaceAll("_", " ")}
                    </button>
                );
                })}
            </div>
            <div className='bloc-tabs'>
                {subDesignTypes && subDesignTypes.has_subtypes && (
                <>
                    {subDesignTypes.data.map((item) => {
                    return (
                        <button
                        key={item.id}
                        className={subActiveTab === item.id ? "tab-btn tabs active-subtabs" : "tab-btn tabs"}
                        onClick={() => {
                            setSubActiveTab(item.id);// set the value of current active tab
                            setSelectedItemBack(null); // Refresh the value of selectedItemBack
                        }}
                        >
                        {item.name.replaceAll("_", " ")}
                        </button>
                    );
                    })}
                </>
                )}
            </div>
                <div className='design-types-cont'>
                    {results && !results.has_subtypes &&
                        <>
                        {/* Tension Member Items */}
                            <div className='content-tabs'>
                                {results.data.map((item) => {
                                    return (
                                        <div key={item.id}>
                                            <div className='conn-grid-container'>
                                            <div className={`conn-grid-item ${selectedItemBack === item.name ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    value={item.name}
                                                    name="shear-conn"
                                                    onClick={() => {
                                                    setSelectedDesign(item.name.toLowerCase());
                                                    setSelectedItemBack(item.name);
                                                    }}
                                                />
                                                <b>{item.name.replaceAll("_", " ")}</b><br />
                                                <img
                                                    src={image_map[item.image_name]}
                                                    alt={item.name}
                                                    onClick={() => {
                                                    const radioInput = document.querySelector(
                                                        `input[type="radio"][value="${item.name}"]`
                                                    );
                                                    if (radioInput) {
                                                        radioInput.checked = true;
                                                        setSelectedDesign(item.name.toLowerCase());
                                                        setSelectedItemBack(item.name);
                                                    }
                                                    }}
                                                />
                                            </div>
                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                            <center><div className=''><button className='start-btn' onClick={() => { }}>Start</button></div></center>
                        </>
                    }
                    {subDesignTypes && !subDesignTypes.has_subtypes &&
                        <>
                        {/* Share Connection base plate and truss connection items */}
                            <div className='content-tabs'>
                                {subDesignTypes.data.map((item) => {
                                    return (
                                        <div key={item.id}>
                                            <div className='conn-grid-container'>

                                            <div className={`conn-grid-item ${selectedItemBack === item.name ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    value={item.name}
                                                    name="shear-conn"
                                                    onClick={() => {
                                                    setSelectedDesign(item.name.toLowerCase());
                                                    setSelectedItemBack(item.name);
                                                    }}
                                                />
                                                <b>{item.name.replaceAll("_", " ")}</b><br />
                                                <img
                                                    src={image_map[item.image_name]}
                                                    alt={item.name}
                                                    onClick={() => {
                                                    const radioInput = document.querySelector(
                                                        `input[type="radio"][value="${item.name}"]`
                                                    );
                                                    if (radioInput) {
                                                        radioInput.checked = true;
                                                        setSelectedDesign(item.name.toLowerCase());
                                                        setSelectedItemBack(item.name);
                                                    }
                                                    }}
                                                />
                                            </div>
                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                            <center><div className=''><button className='start-btn' onClick={() => {
                                if (selectedDesign === 'fin_plate') navigate(`/design/${designType}/${selectedDesign}`)
                            }}>Start</button></div></center>
                        </>
                    }
                    {leafLevelDesignType && !leafLevelDesignType.has_subtypes &&
                        <>
                        {/* Moment Connection */}
                            <div className='content-tabs'>
                                {leafLevelDesignType.data.map((item) => {
                                    return (
                                        <div key={item.id}>
                                            
                                            <div className='conn-grid-container'>
                                            <div className={`conn-grid-item ${selectedItemBack === item.name ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    value={item.name}
                                                    name="shear-conn"
                                                    onClick={() => {
                                                    setSelectedDesign(item.name.toLowerCase());
                                                    setSelectedItemBack(item.name);
                                                    }}
                                                />
                                                <b>{item.name.replaceAll("_", " ")}</b><br />
                                                <img
                                                    src={image_map[item.image_name]}
                                                    alt={item.name}
                                                    onClick={() => {
                                                    const radioInput = document.querySelector(
                                                        `input[type="radio"][value="${item.name}"]`
                                                    );
                                                    if (radioInput) {
                                                        radioInput.checked = true;
                                                        setSelectedDesign(item.name.toLowerCase());
                                                        setSelectedItemBack(item.name);
                                                    }
                                                    }}
                                                />
                                            </div>
                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                            <center>
                                <div className=''>
                                    <button className='start-btn' onClick={() => { }}>Start</button>
                                </div>
                            </center>
                        </>
                    }
                </div>
                <div className='error-cont'>
                    {error_message && <div>{error_message}</div>}
                </div>
            </div>
        </div>
    )
}

export default Window
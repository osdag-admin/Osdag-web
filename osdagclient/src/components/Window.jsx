import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// importing thunks
import { getDesignTypes, getSubDesignTypes, getLeafLevelDesignType } from '../features/thunks/ModuleThunk'

// redux imports
import { useDispatch, useSelector } from 'react-redux'

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

let renderedOnce = false;

const Window = () => {
    const navigate = useNavigate();
    const { designType } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(1)
    const [subActiveTab, setSubActiveTab] = useState(1)
    const [errorMsg, setErrorMsg] = useState(null)

    const dispatch = useDispatch()
    const results = useSelector(state => state.getDesignTypes.results)
    const subDesignTypes = useSelector(state => state.getSubDesignTypes.subDesignTypes)
    const leafLevelDesignType = useSelector(state => state.getLeafLevelDesignType.leafLevelDesignType)

    const wrapper = () => {
        dispatch({ type: 'RESET_RESULTS', payload: null })
        dispatch(getDesignTypes(designType))
    }

    useEffect(() => {
        if (!results) return;
        if (results.has_subtypes === true) {
            const { name } = results.data[0]
            dispatch(getSubDesignTypes({ designType, name }))
            setActiveTab(1)
        }
    }, [results])

    useEffect(() => {
        if (!subDesignTypes) return;

        if (subDesignTypes.has_subtypes === true) {
            const { name: prev_item } = results.data[activeTab - 1]
            const { name } = subDesignTypes.data[0]
            dispatch(getLeafLevelDesignType({ designType, prev_item, name }))
            setSubActiveTab(1)
        }

    }, [subDesignTypes])

    useEffect(() => {
        wrapper()
    }, [designType])

    useEffect(() => {
        if (!results || !subDesignTypes) return;

        console.log(results, subDesignTypes)
        const { name: prev_item } = results.data[activeTab - 1]
        const { name } = subDesignTypes.data[subActiveTab - 1]
        dispatch(getLeafLevelDesignType({ designType, prev_item, name }))

    }, [subActiveTab])

    useEffect(() => {
        if (!results) return;
        const { name } = results.data[activeTab - 1]
        dispatch(getSubDesignTypes({ designType, name }))
    }, [activeTab])

    if (renderedOnce === false) {
        dispatch(getDesignTypes(designType))
        renderedOnce = true
    }


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
                    {subDesignTypes && subDesignTypes.has_subtypes &&
                        <>
                            {subDesignTypes.data.map((item) => {
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
                        </>
                    }
                </div>
                <div className='design-types-cont'>
                    {results && !results.has_subtypes &&
                        <>
                            <div className='content-tabs'>
                                {results.data.map((item) => {
                                    return (
                                        <div key={item.id}>
                                            <div className='conn-grid-container'>
                                                <div className='conn-grid-item'>
                                                    <input type="radio" value={item.name} name="shear-conn"></input>
                                                    <b>{item.name.replaceAll("_", " ")}</b><br />
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
                                    return (
                                        <div key={item.id}>
                                            <div className='conn-grid-container'>

                                                <div className='conn-grid-item'>
                                                    <input type="radio" value={item.name} name="shear-conn"></input>
                                                    <b>{item.name.replaceAll("_", " ")}</b><br />
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
                                    return (
                                        <div key={item.id}>
                                            <div className='conn-grid-container'>
                                                <div className='conn-grid-item'>
                                                    <input type="radio" value={item.name} name="shear-conn"></input>
                                                    <b>{item.name.replaceAll("_", " ")}</b><br />
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
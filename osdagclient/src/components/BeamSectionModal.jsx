import React, { useContext, useState, useEffect } from 'react'
import { ModuleContext } from '../context/ModuleState'
import { Input, Select } from 'antd'
import ISection from '../assets/ISection.png'
import CustomSectionModal from './CustomSectionModal'

const readOnlyFontStyle = {
    color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '600'
}

const BeamSectionModal = ({supportedSectionData, designPrefInputs, setDesignPrefInputs }) => {

    const { materialList, updateSourceAndMechType, getMaterialDetails, supported_material_details } = useContext(ModuleContext)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const material = materialList.filter(value => value.Grade === designPrefInputs.supported_material)
        getMaterialDetails({data: material[0], type: 'supported'})
    }, [])

    return (
        <>
            <div className='col-beam-cont'>
                <div>
                    <div className='input-cont'>
                        <h5>Designation</h5>
                        <Input
                            type="text"
                            name="Designation"
                            className='input-design-pref'
                            value={supportedSectionData.Designation}
                            disabled
                            style={readOnlyFontStyle}
                        />
                    </div>
                    <div className='sub-container'>
                        <h4>Mechanical Properties</h4>
                        <div className='input-cont'>
                            <h5>Material</h5>
                            <div>
                                <Select style={{ width: '200px', height: '25px', fontSize: '12px' }}
                                    value={designPrefInputs.supported_material}
                                    onSelect={(value) => {
                                        if(value == -1){
                                            setShowModal(true)
                                            return;
                                        }
                                        const material = materialList.find(item => item.id === value)
                                        setDesignPrefInputs({ ...designPrefInputs, supported_material: material.Grade }),
                                        updateSourceAndMechType(2, material.Grade)
                                        getMaterialDetails({data: material, type: 'supported'})
                                    }}
                                >
                                    {materialList.map((item, index) => (
                                        <Option key={index} value={item.id}>{item.Grade}</Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className='input-cont'>
                            <h5>Ultimate Strength, Fu (MPa)</h5>
                            <Input
                                type="text"
                                name="ultimate-strength"
                                className='input-design-pref'
                                value={supported_material_details[0] ? supported_material_details[0].Ultimate_Tensile_Stress : 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Yield Strength, Fy (MPa)</h5>
                            <Input
                                type="text"
                                name="yield-strength"
                                className='input-design-pref'
                                value={supported_material_details[0] ? supported_material_details[0].Yield_Stress_greater_than_40 : 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Modulus of Elasticity, E (GPa)</h5>
                            <Input
                                type="text"
                                name="modulus-elasticity"
                                className='input-design-pref'
                                value={200}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Modulus of Rigidity, G (GPa)</h5>
                            <Input
                                type="text"
                                name="modulus-rigidity"
                                className='input-design-pref'
                                value={76.9}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Poisson's Ratio, v</h5>
                            <Input
                                type="text"
                                name="poisson-ratio"
                                className='input-design-pref'
                                value={0.3}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Thermal Expansion Coefficient (x10^(-8) / C)</h5>
                            <Input
                                type="text"
                                name="thermal-coefficient"
                                className='input-design-pref'
                                value={12}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Type</h5>
                            <div>
                                <Select style={{ width: '200px', height: '25px', fontSize: '12px' }}
                                    value={supportedSectionData.Type ? supportedSectionData.Type : "Rolled"}
                                    disabled
                                >
                                    {['Rolled', 'Welded'].map((item, index) => (
                                        <Option key={index} value={item}>{item}</Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className='input-cont'>
                            <h5>Source</h5>
                            <Input
                                type="text"
                                name="source"
                                className='input-design-pref'
                                value={supportedSectionData.Source || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                    </div>
                </div>
                {/*  */}
                <div>
                    <div className='sub-container'>
                        <h4>Dimensions</h4>
                        <div className='input-cont'>
                            <h5>Depth, D (mm)*</h5>
                            <Input
                                type="text"
                                name="depth"
                                className='input-design-pref'
                                value={supportedSectionData.D || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Flange Width, B (mm)*</h5>
                            <Input
                                type="text"
                                name="flange-widht"
                                className='input-design-pref'
                                value={supportedSectionData.B || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Flange Thickness, T (mm)*</h5>
                            <Input
                                type="text"
                                name="flange-thickness"
                                className='input-design-pref'
                                value={supportedSectionData.T || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Web Thickness, t (mm)*</h5>
                            <Input
                                type="text"
                                name="web-thickness"
                                className='input-design-pref'
                                value={supportedSectionData.tw || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Flange Slope, a (deg.)*</h5>
                            <Input
                                type="text"
                                name="flange-slope"
                                className='input-design-pref'
                                value={supportedSectionData.FlangeSlope || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Root Radius, R1 (mm)*</h5>
                            <Input
                                type="text"
                                name="depth"
                                className='input-design-pref'
                                value={supportedSectionData.R1 || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Toe Radius, R2 (mm)*</h5>
                            <Input
                                type="text"
                                name="tow-radius"
                                className='input-design-pref'
                                value={supportedSectionData.R2 || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                    </div>
                    <div className="sub-container">
                        <h4>Section Properties</h4>
                        <div className='input-cont'>
                            <h5>Mass, M (Kg/m)</h5>
                            <Input
                                type="text"
                                name="mass"
                                className='input-design-pref'
                                value={supportedSectionData.Mass || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Sectional Area, a (cm2)</h5>
                            <Input
                                type="text"
                                name="sectional-area"
                                className='input-design-pref'
                                value={supportedSectionData.Area || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>2nd Moment of Area, Iz (cm4)</h5>
                            <Input
                                type="text"
                                name="2nd-moment-area-Iz"
                                className='input-design-pref'
                                value={supportedSectionData.Iz || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>2nd Moment of Area, Iy (cm4)</h5>
                            <Input
                                type="text"
                                name="2nd-moment-area-Iy"
                                className='input-design-pref'
                                value={supportedSectionData.Iy || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Radius of Gyration, Rz (cm4)</h5>
                            <Input
                                type="text"
                                name="radius-gyration-Rz"
                                className='input-design-pref'
                                value={supportedSectionData.rz || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Radius of Gyration, Ry (cm4)</h5>
                            <Input
                                type="text"
                                name="radius-gyration-Ry"
                                className='input-design-pref'
                                value={supportedSectionData.ry || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Elastic Modulus, Zz (cm3)</h5>
                            <Input
                                type="text"
                                name="elastic-modulus"
                                className='input-design-pref'
                                value={supportedSectionData.Zz || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                    </div>
                </div>
                {/*  */}

                <div>
                    <div className='sub-container'>
                        <img src={ISection} alt="image" />
                    </div>
                    <div className='sub-container'>
                        <h4>Section Properties</h4>
                        <div className='input-cont'>
                            <h5>Plastic Modulus, Zpz (cm3)</h5>
                            <Input
                                type="text"
                                name="plastic-modulus-pz"
                                className='input-design-pref'
                                value={supportedSectionData.Zpz || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Plastic Modulus, Zpv (cm3)</h5>
                            <Input
                                type="text"
                                name="plastic-modulus-pv"
                                className='input-design-pref'
                                value={supportedSectionData.Zpy || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Torsion Constant, It (cm4)</h5>
                            <Input
                                type="text"
                                name="torsion-constant"
                                className='input-design-pref'
                                value={supportedSectionData.It || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                        <div className='input-cont'>
                            <h5>Warping Constant, Iw (cm6)</h5>
                            <Input
                                type="text"
                                name="warping-constant"
                                className='input-design-pref'
                                value={supportedSectionData.Iw || 0}
                                disabled
                                style={readOnlyFontStyle}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <CustomSectionModal 
                showModal={showModal}
                setShowModal={setShowModal}
                setInputValues={setDesignPrefInputs}
                inputValues={designPrefInputs}
                type='supported'
            />
        </>
    )
}

export default BeamSectionModal
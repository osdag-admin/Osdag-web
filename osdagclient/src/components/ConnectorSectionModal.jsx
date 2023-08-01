import { useContext, useEffect } from 'react'
import { ModuleContext } from '../context/ModuleState'
import { Input, Select } from 'antd'

const readOnlyFontStyle = {
    color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '600'
}

const ConnectorSectionModal = ({ inputs, setInputs }) => {

    const { materialList, conn_material_details, getMaterialDetails } = useContext(ModuleContext)

    useEffect(() => {
        getMaterialDetails({material: inputs.connector_material, type: "connector"})
    }, [])

    const handleMaterialChange = value => {
        setInputs({ ...inputs, connector_material: value })
        getMaterialDetails({material: value, type: "connector"})
    }
    

    return (
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <div className='input-cont'>
                        <h5>Material</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.connector_material}
                                onSelect={(value) => handleMaterialChange(value)}
                            >
                                {materialList.map((item, index) => {
                                    if(item == "Custom") return;
                                    return (
                                        <Option key={index} value={item}>{item}</Option>
                                    )
                                })}
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                        <h5>Ultimate Strength, Fu (Mpa)</h5>
                        <Input
                            type="text"
                            name="ultimate-strength"
                            className='input-design-pref'
                            value={conn_material_details[0] ? conn_material_details[0].Ultimate_Tensile_Stress : 0}
                            disabled
                            style={readOnlyFontStyle}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>Yield  Strength, Fy (Mpa) (0-20mm)</h5>
                        <Input
                            type="text"
                            name="yield-strength"
                            className='input-design-pref'
                            value={conn_material_details[0] ? conn_material_details[0].Yield_Stress_less_than_20 : 0}
                            disabled
                            style={readOnlyFontStyle}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>Yield  Strength, Fy (Mpa) (20-40mm)</h5>
                        <Input
                            type="text"
                            name="modulus-elasticity"
                            className='input-design-pref'
                            value={conn_material_details[0] ? conn_material_details[0].Yield_Stress_between_20_and_neg40 : 0}
                            disabled
                            style={readOnlyFontStyle}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>{`Yield  Strength, Fy (Mpa) (>40mm)`}</h5>
                        <Input
                            type="text"
                            name="modulus-rigidity"
                            className='input-design-pref'
                            value={conn_material_details[0] ? conn_material_details[0].Yield_Stress_greater_than_40 : 0}
                            disabled
                            style={readOnlyFontStyle}
                        />
                    </div>
                    </div>
            </div>
            {/*  */}
       
            {/*  */}

            
        </div>
    )
}

export default ConnectorSectionModal
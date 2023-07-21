import { useContext } from 'react'
import { ModuleContext } from '../context/ModuleState'
import { Input, Select } from 'antd'

const ConnectorSectionModal = ({ inputs, setInputs }) => {

    const { materialList } = useContext(ModuleContext)

    return (
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <div className='input-cont'>
                        <h5>Material</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.connector_material}
                                onSelect={(value) => setInputs({ ...inputs, connector_material: value })}
                            >
                                {materialList.map((item, index) => (
                                    <Option key={index} value={item}>{item}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                        <h5>Ultimate Strength, Fu (Mpa)</h5>
                        <Input
                            type="text"
                            name="ultimate-strength"
                            className='input-design-pref'
                            value={'0'}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>Yield  Strength, Fy (Mpa) (0-20mm)</h5>
                        <Input
                            type="text"
                            name="yield-strength"
                            className='input-design-pref'
                            value={'0'}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>Yield  Strength, Fy (Mpa) (20-40mm)</h5>
                        <Input
                            type="text"
                            name="modulus-elasticity"
                            className='input-design-pref'
                            value={'0'}
                        />
                    </div>
                    <div className='input-cont'>
                        <h5>{`Yield  Strength, Fy (Mpa) (>40mm)`}</h5>
                        <Input
                            type="text"
                            name="modulus-rigidity"
                            className='input-design-pref'
                            value={'0'}
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
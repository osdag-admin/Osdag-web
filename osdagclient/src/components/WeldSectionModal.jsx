import { useContext } from 'react'
import { ModuleContext } from '../context/ModuleState'
import { Select,Input } from 'antd'

const WeldSectionModal = ({ inputs, setInputs }) => {

    const { materialList } = useContext(ModuleContext)

    return (
<>
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <h4>Inputs</h4>
                    <div className='input-cont'>
                        <h5>Type of Weld Fabrication</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                            defaultValue={'PreTensioned'}
                            >
                                    <Option value="ShopWeld">ShopWeld</Option>
                                    <Option value="FieldWeld">Field Weld</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                    <h5>Material Grade Overwrite, Fu (MPa) </h5>
                        <div>
                        <Input
                            type="text"
                            name="source"
                            className='input-design-pref'
                            value={'0'}
                        />
                        </div>
                    </div>
                </div>
            </div>
            {/*  */}
            <div>
                <div className="sub-container">
                    <h4>Discription</h4>
                    <Input.TextArea rows={25} cols={150} />
                </div>
            </div>
           

        </div>
           
            </>
    )
}

export default WeldSectionModal
import { useContext } from 'react'
import { ModuleContext } from '../context/ModuleState'
import { Select,Input } from 'antd'

const DetailingSectionModal = ({ inputs, setInputs }) => {

    const { materialList } = useContext(ModuleContext)

    return (
<>
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <h4>Inputs</h4>
                    <div className='input-cont'>
                        <h5>Edge Preparation Method</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                            defaultValue={'HandFlame'}
                            >
                                    <Option value="HandFlame">Sheared or hand flame cut</Option>
                                    <Option value="MachineFlame">Rolled, machine-flame cut , sawn and planed</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                    <h5>Gap Between Beam And Support (mm) </h5>
                        <div>
                        <Input
                            type="text"
                            name="source"
                            className='input-design-pref'
                            value={'0'}
                        />
                        </div>
                    </div>
                    <div className='input-cont'>
                        <h5>Are the Member Exposed to Corrosive influences?</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                            defaultValue={'No'}
                            >
                                    <Option value="No">No</Option>
                                    <Option value="Yes">Yes</Option>
                            </Select>
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

export default DetailingSectionModal
import { Select,Input } from 'antd'

const BoltSectionModal = ({ inputs, setInputs }) => {

    return (
<>
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <h4>Inputs</h4>
                    <div className='input-cont'>
                        <h5>Type</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.bolt_tension_type}
                                onSelect={value => setInputs({...inputs, bolt_tension_type: value})}
                            >
                                    <Option value="PreTensioned">Pre-tensioned</Option>
                                    <Option value="NonPreTensioned">Non Pre-tensioned</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                    <h5>Hole Type</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.bolt_hole_type}
                                onSelect={value => setInputs({...inputs, bolt_hole_type: value})}
                            >
                                    <Option value="Standard">Standard</Option>
                                    <Option value="OverSized">Over-Sized</Option>
                            </Select>
                        </div>
                    </div>
                    <h4>HSFG Bolt</h4>
                    <div className='input-cont'>
                    <h5>
                        Slip factor, (mu<span style={{ verticalAlign: 'sub', fontSize: 'smaller' }}>f</span>)
                    </h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.bolt_slip_factor}
                                onSelect={value => setInputs({...inputs, bolt_slip_factor: value})}
                            >
                                    <Option value="Standard">0.5</Option>
                                    <Option value="Standard">0.3</Option>
                                    <Option value="Standard">0.2</Option>
                                    <Option value="Standard">0.25</Option>
                                    <Option value="Standard">0.1</Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
            {/*  */}
            <div>
                <div className="sub-container">
                    <h4>Discription</h4>
                    <Input.TextArea rows={20} cols={150} />
                </div>
            </div>
           

        </div>
            <div><b>Note: If slip is permitted under the design load design the bolt as a bearing bolt select corresponding bolt grade.</b></div> 
            </>
    )
}

export default BoltSectionModal
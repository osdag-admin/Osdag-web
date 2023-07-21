import { Select,Input } from 'antd'

const DesignSectionModal = ({ inputs, setInputs }) => {

    return (
<>
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <h4>Inputs</h4>
                    <div className='input-cont'>
                        <h5>Design Method</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.design_method}
                                onSelect={value => setInputs({...inputs, design_method: value})}
                            >
                                    <Option value="LimitedSD">Limited State Design</Option>
                                    <Option value="LimitedCD" disabled> Limited State (capacity based) Design</Option>
                                    <Option value="WStressedD" disabled>Working Stressed Design</Option>
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

export default DesignSectionModal
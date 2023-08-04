import { Select,Input } from 'antd'

const DesignSectionModal = ({designPrefInputs, setDesignPrefInputs }) => {

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
                                value={designPrefInputs.design_method}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, design_method: value})}
                            >
                                    <Option value="Limited State Design">Limited State Design</Option>
                                    <Option value="Limited State (capacity based) Design" disabled>Limited State (capacity based) Design</Option>
                                    <Option value="Working Stressed Design" disabled>Working Stressed Design</Option>
                            </Select>
                        </div>
                    </div>
                    
                </div>
            </div>
            {/*  */}
            {/* <div>
                <div className="sub-container">
                    <h4>Discription</h4>
                    <Input.TextArea rows={25} cols={150} />
                </div>
            </div> */}
           

        </div>
           
            </>
    )
}

export default DesignSectionModal
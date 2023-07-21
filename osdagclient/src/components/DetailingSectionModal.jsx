import { Select,Input } from 'antd'

const DetailingSectionModal = ({ inputs, setInputs }) => {

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
                                value={inputs.detailing_edge_type}
                                onSelect={value => setInputs({...inputs, detailing_edge_type: value})}
                            >
                                    <Option value="Sheared or hand flame cut">Sheared or hand flame cut</Option>
                                    <Option value="Rolled, machine-flame cut, sawn and planed">Rolled, machine-flame cut, sawn and planed</Option>
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
                            value={inputs.detailing_gap}
                            onChange={e => setInputs({...inputs, detailing_gap: e.target.value})}
                        />
                        </div>
                    </div>
                    <div className='input-cont'>
                        <h5>Are the Member Exposed to Corrosive influences?</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={inputs.detailing_corr_status}
                                onSelect={value => setInputs({...inputs, detailing_corr_status: value})}
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
import { Select,Input } from 'antd'

const DetailingSectionModal = ({ designPrefInputs, setDesignPrefInputs }) => {
const Detailing_text =`The minimum edge and end distances from the centre of any hole to the nearest edge of a plate shall not be less than 1.7 times the hole diameter in case of [sheared or hand flame cut edges] and 1.5 times the hole diameter in case of [Rolled, machine-flame cut, sawn and planed edges] (IS 800 - cl. 10. 2. 4. 2)

This gap should include the tolerance value of 5mm or 1.5mm. So if the assumed clearance is 5mm, then the gap should be = 10mm (= 5mm {clearance} + 5mm {tolerance} or if the assumed clearance is 1.5mm, then the gap should be = 3mm (= 1.5mm {clearance} + 1.5mm {tolerance}. These are the default gap values based on the site practice for convenience of erection and IS 7215,Clause 2.3.1. The gap value can also be zero based on the nature of connection where clearance is not required.

Specifying whether the members are exposed to corrosive influences, here, only affects the calculation of the maximum edge distance as per cl. 10.2.4.3`
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
                                value={designPrefInputs.detailing_edge_type}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, detailing_edge_type: value})}
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
                            value={designPrefInputs.detailing_gap}
                            onChange={e => setDesignPrefInputs({...designPrefInputs, detailing_gap: e.target.value})}
                        />
                        </div>
                    </div>
                    <div className='input-cont'>
                        <h5>Are the Member Exposed to Corrosive influences?</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={designPrefInputs.detailing_corr_status}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, detailing_corr_status: value})}
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
                    <Input.TextArea rows={25} cols={150} value={Detailing_text} readOnly />
                </div>
            </div>
           

        </div>
           
            </>
    )
}

export default DetailingSectionModal
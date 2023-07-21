import { Select,Input } from 'antd'

const WeldSectionModal = ({ inputs, setInputs }) => {

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
                                value={inputs.weld_fab}
                                onSelect={value => setInputs({...inputs, weld_fab: value})}
                            >
                                    <Option value="Shop Weld">Shop Weld</Option>
                                    <Option value="Field Weld">Field Weld</Option>
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
                            value={inputs.weld_material_grade}
                            onChange={e => setInputs({...inputs, weld_material_grade: e.target.value})}
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
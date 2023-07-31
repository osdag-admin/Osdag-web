import React, {useState} from 'react'
import { Modal, Input, Button } from 'antd'

const CustomSectionModal = ({ showModal, setShowModal }) => {

    const [inputs, setInputs] = useState({
        grade: "Cus__",
        fy_20: '',
        fy_20_40: '',
        fy_40: '',
        fu: ''
    })

    return (
        <Modal
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={300}
        >
            <div>
                <div>
                    <h4>Custom Material</h4>
                </div>
                <div>
                    <div className='input-cont' style={{margin: "10px 0px"}}>
                        <h5>Grade</h5>
                        <Input
                            type="text"
                            name="Grade"
                            className='input-design-pref'
                            value={`Cus_${inputs.fy_20 || '_'}_${inputs.fy_20_40 || '_'}_${inputs.fy_40 || '_'}_${inputs.fu || '_'}`}
                            disabled
                            style={{color: 'black', fontWeight: 600, fontSize: '12px'}}
                        />
                    </div>
                    <div className='input-cont' style={{margin: "5px 0px"}}>
                        <h5>Fy_20</h5>
                        <Input
                            type="text"
                            name="Fy-20"
                            className='input-design-pref'
                            value={inputs.fy_20}
                            onChange={e => {
                                setInputs({...inputs, fy_20: e.target.value})
                            }}
                        />
                    </div>
                    <div className='input-cont' style={{margin: "5px 0px"}}>
                        <h5>Fy_20_40</h5>
                        <Input
                            type="text"
                            name="Fy_20_40"
                            className='input-design-pref'
                            value={inputs.fy_20_40}
                            onChange={e => setInputs({...inputs, fy_20_40: e.target.value})}
                        />
                    </div>
                    <div className='input-cont' style={{margin: "5px 0px"}}>
                        <h5>Fy_40</h5>
                        <Input
                            type="text"
                            name="Fy_40"
                            className='input-design-pref'
                            value={inputs.fy_40}
                            onChange={e => setInputs({...inputs, fy_40: e.target.value})}
                        />
                    </div>
                    <div className='input-cont' style={{margin: "5px 0px"}}>
                        <h5>Fu</h5>
                        <Input
                            type="text"
                            name="Fu"
                            className='input-design-pref'
                            value={inputs.fu}
                            onChange={e => setInputs({...inputs, fu: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <Button type='button' className='primary-btn'>Add</Button>
                </div>
            </div>
        </Modal>
    )
}

export default CustomSectionModal
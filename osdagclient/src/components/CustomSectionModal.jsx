import React, { useState, useEffect, useContext } from 'react'
import { Modal, Input, Button } from 'antd'
import { ModuleContext } from '../context/ModuleState'

const CustomSectionModal = ({ showModal, setShowModal, setInputValues, inputValues, type = "supported" }) => {

    const { getMaterialDetails, getColumnBeamMaterialList, currentModuleName, updateMaterialListFromCaches, materialList, addCustomMaterialToDB } = useContext(ModuleContext)
    const [inputs, setInputs] = useState({
        fy_20: '',
        fy_20_40: '',
        fy_40: '',
        fu: ''
    })
    const [grade, setGrade] = useState("Cus____")

    const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));

    useEffect(() => {

        let arr = ("Cus____").split("_")
        if (inputs.fy_20 !== '')
            arr[1] = inputs.fy_20
        if (inputs.fy_20_40 !== '')
            arr[2] = inputs.fy_20_40
        if (inputs.fy_40 !== '')
            arr[3] = inputs.fy_40
        if (inputs.fu !== '')
            arr[4] = inputs.fu

        setGrade(arr.join("_"))

    }, [inputs])

    const handleSubmit = (inCache = True) => {
        if (!inputs.fy_20 || !inputs.fy_20_40 || !inputs.fy_40 || !inputs.fu) {
            alert("Please fill the missing parameters.");
            return;
        }

        if(!validateInput(inputs)){
            return;
        }

        if (inCache) {
            const key = "osdag-custom-materials"
            const customSectionData = {
                id: Math.round(Math.random()*1000),
                Grade: grade,
                Yield_Stress_less_than_20: parseInt(inputs.fy_20),
                Yield_Stress_between_20_and_neg40: parseInt(inputs.fy_20_40),
                Yield_Stress_greater_than_40: parseInt(inputs.fy_40),
                Ultimate_Tensile_Stress: parseInt(inputs.fu),
                Elongation: null,
            }

            const prevData = JSON.parse(localStorage.getItem("osdag-custom-materials"))

            let presentItemsInCaches = null;
            if(prevData) presentItemsInCaches = prevData.filter(item => item.Grade === grade) 
            presentItemsInCaches = materialList.filter(item => item.Grade === grade) 

            if(presentItemsInCaches && presentItemsInCaches.length > 0){
                alert("The material is already presend");
                setShowModal(false)
                setGrade("Cus____");
                setInputs({
                    fy_20: '',
                    fy_20_40: '',
                    fy_40: '',
                    fu: ''
                })
                return;
            }

            let newData = []
            if(prevData) newData = [...prevData, customSectionData];
            else newData = [customSectionData]

            localStorage.setItem(key, JSON.stringify(newData));
            alert("Data added successfuly");
            if (type == 'supported') {
                setInputValues({ ...inputValues, supported_material: grade })
            }
            else if (type == 'supporting') {
                setInputValues({ ...inputValues, supporting_material: grade })
            }
            else if (type == 'connector') {
                setInputValues({ ...inputValues, connector_material: grade })
            }

            getMaterialDetails({ material: grade, type: type, data: customSectionData})
            updateMaterialListFromCaches()
        }
        else {
            handleCustomMat()
           
        }

        setShowModal(false)
        setGrade("Cus____");
        setInputs({
            fy_20: '',
            fy_20_40: '',
            fy_40: '',
            fu: ''
        })
    }

    const handleCustomMat = async () => {
        const data = await addCustomMaterialToDB(grade, inputs, 'Column-Flange-Beam-Web', type)
        if (data.success === true) {
            if (type == 'supported') {
                setInputValues({ ...inputValues, supported_material: grade })
            }
            else if (type == 'supporting') {
                setInputValues({ ...inputValues, supporting_material: grade })
            }
            else if (type == 'connector') {
                setInputValues({ ...inputValues, connector_material: grade })
            }
        }
        alert(data.message)
        updateMaterialListFromCaches()
    }

    // utility function
    const validateInput = fields => {
        const mp = ['fy_20', 'fy_20_40', 'fy_40', 'fu'];
        const arr = [fields.fy_20, fields.fy_20_40, fields.fy_40, fields.fu];

        for(let i=0; i<arr.length; i++){
            if(165 <= parseInt(arr[i]) &&  parseInt(arr[i]) <= 1500)
                continue;
            else{
                alert(`${mp[i]} is not in valid range`);
                return false;
            }
        }

        return true;
    }


    return (
        <Modal
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={400}
        >
            <div>
                <div>
                    <h4>Custom Material</h4>
                </div>
                <div>
                    <div className='input-cont' style={{ margin: "10px 0px" }}>
                        <h5>Grade</h5>
                        <Input
                            type="text"
                            name="Grade"
                            className='input-design-pref'
                            value={grade}
                            disabled
                            style={{ color: 'black', fontWeight: 600, fontSize: '12px' }}
                        />
                    </div>
                    <div className='input-cont' style={{ margin: "5px 0px" }}>
                        <h5>Fy_20</h5>
                        <Input
                            type="text"
                            name="Fy-20"
                            onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                            className='input-design-pref'
                            placeholder='Range: 165-1500'
                            value={inputs.fy_20}
                            onChange={e => {
                                setInputs({ ...inputs, fy_20: e.target.value })
                            }}
                        />
                    </div>
                    <div className='input-cont' style={{ margin: "5px 0px" }}>
                        <h5>Fy_20_40</h5>
                        <Input
                            type="text"
                            name="Fy_20_40"
                            onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                            className='input-design-pref'
                            value={inputs.fy_20_40}
                            placeholder='Range: 165-1500'
                            onChange={e => setInputs({ ...inputs, fy_20_40: e.target.value })}
                        />
                    </div>
                    <div className='input-cont' style={{ margin: "5px 0px" }}>
                        <h5>Fy_40</h5>
                        <Input
                            type="text"
                            name="Fy_40"
                            onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                            className='input-design-pref'
                            value={inputs.fy_40}
                            placeholder='Range: 165-1500'
                            onChange={e => setInputs({ ...inputs, fy_40: e.target.value })}
                        />
                    </div>
                    <div className='input-cont' style={{ margin: "5px 0px" }}>
                        <h5>Fu</h5>
                        <Input
                            type="text"
                            name="Fu"
                            onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                            className='input-design-pref'
                            value={inputs.fu}
                            placeholder='Range: 165-1500'
                            onChange={e => setInputs({ ...inputs, fu: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', columnGap: "4px" }}>
                    <Button type='button' className='primary-btn' onClick={() => handleSubmit(true)}>Add to Caches</Button>
                    <Button type='button' className='primary-btn' style={!isLoggedIn ? { background: "gray" }: {}} onClick={() => handleSubmit(false)} disabled={!isLoggedIn}>Add to Database</Button>
                </div>
            </div>
        </Modal>
    )
}

export default CustomSectionModal
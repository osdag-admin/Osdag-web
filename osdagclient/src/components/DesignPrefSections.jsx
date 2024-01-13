import React, {useState, useContext} from 'react'
import { ModuleContext } from '../context/ModuleState'
import ColumnSectionModal from './ColumnSectionModal'
import BeamSectionModal from './BeamSectionModal'
import ConnectorSectionModal from './ConnectorSectionModal'
import BoltSectionModal from './BoltSectionModal'
import WeldSectionModal from './WeldSectionModal'
import DetailingSectionModal from './DetailingSectionModal'
import DesignSectionModal from './DesignSectionModal'
import { Button , Modal} from 'antd';

const tabs = [
    {
        name: 'Column Section*',
        id: 0
    },{
        name: 'Beam Section*',
        id: 1
    },{
        name: 'Connector',
        id: 2
    },{
        name: 'Bolt',
        id: 3,
    },{
        name: 'Weld',
        id: 4
    },{
        name: 'Detailing',
        id: 5
    },{
        name: 'Design',
        id: 6
    }
]

const DesignPrefSections = ({inputs, setInputs, selectedOption, setDesignPrefModalStatus, setConfirmationModal, confirmationModal}) => {

    const [activeTab, setActiveTab] = useState(0)
    const {designPrefData, design_pref_defaults} = useContext(ModuleContext) 
    const [designPrefInputs, setDesignPrefInputs] = useState({
        supported_material: inputs.supported_material,
        supporting_material: inputs.supporting_material,
        connector_material: inputs.connector_material,
        bolt_tension_type: inputs.bolt_tension_type,
        bolt_hole_type: inputs.bolt_hole_type,
        bolt_slip_factor: inputs.bolt_slip_factor,
        weld_fab: inputs.weld_fab,
        weld_material_grade: inputs.weld_material_grade,
        detailing_edge_type: inputs.detailing_edge_type,
        detailing_gap: inputs.detailing_gap,
        detailing_corr_status: inputs.detailing_corr_status,
        design_method: inputs.design_method
    })

    const saveCoreInputs = () => {
        setInputs({...inputs, ...designPrefInputs})
        setDesignPrefModalStatus(false)
        setConfirmationModal(false)
    }

    const resetInputs = () => {
        setDesignPrefInputs(design_pref_defaults)
        setInputs({...inputs, ...design_pref_defaults})
        setConfirmationModal(false)
        setDesignPrefModalStatus(false)
    }

  return (
    <div >
        <div>
            <h4>Design Preference</h4>
        </div>
        <div className='bloc-tabs' style={{marginTop: '10px'}}>
            {tabs.map(item => {
                return (
                    <button 
                   
                        key={item.id}
                        className={activeTab == item.id ? "tab-btn tabs-design-pref active-tabs" : "tab-btn tabs-design-pref"}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {(selectedOption === "Beam-Beam" && (item.name === "Column Section*" || item.name == "Beam Section*")) ? 
                            (item.name === 'Column Section*' ? "Primary Beam*" : "Secondary Beam*")
                        : item.name}
                    </button>
                )
            })}
        </div>
        <div className='design-pref-cont'>
            {activeTab == 0 &&
                <ColumnSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs} 
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}
                    supportingSectionData={designPrefData.supporting_section_results.length > 0 ? designPrefData.supporting_section_results[0] : designPrefData.supporting_section_results}
                />
            }
            {activeTab == 1 &&
                // <h2>Beam Section</h2>
                <BeamSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs} 
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}
                    supportedSectionData={designPrefData.supported_section_results.length > 0 ? designPrefData.supported_section_results[0] : designPrefData.supported_section_results}
                />
            }
            {activeTab == 2 &&
                <ConnectorSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs}
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}   
                />
            }
            {activeTab == 3 && 
                <BoltSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs}
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}
                />
            }
            {activeTab == 4 && 
                <WeldSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs}
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}
                />
            }
            {activeTab == 5 && 
                <DetailingSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs}
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}    
                />
            }
            {activeTab == 6 && 
                <DesignSectionModal 
                    inputs={inputs} 
                    setInputs={setInputs}
                    designPrefInputs={designPrefInputs}
                    setDesignPrefInputs={setDesignPrefInputs}    
                />
            }
        </div>

        {/*{ activeTab ==  0 || activeTab ==  1 
        ?  
        <div className='DesignPrefFooter DesignPrefFooter-btn'>
            
            <Button type="button" onClick={() => null}>Add</Button>
            <Button type="button" onClick={() => null}>Clear</Button>  
            <Button type="button" onClick={() => null}>import xlxs file </Button>
            <Button type="button" onClick={() => null}>Download xlxs file </Button>            
        </div> 
        : 
        null 
        }*/}
        <div className='subDesignPrefFooter subDesignPrefFooter-btn'>
            
            <Button type="button" onClick={() => setConfirmationModal(true)}>Default</Button>
            
            <Button type="button" onClick={() => saveCoreInputs()}>Save and Close</Button>            
        </div> 
        <Modal 
            title="Alert!" 
            open={confirmationModal} 
            onOk={resetInputs} 
            onCancel={saveCoreInputs}
            cancelText="Save and Continue"
            okText="Discard Changes"
            closable={false}
            maskClosable={false}
        >
            This action will discard your changes.
        </Modal>
    </div>
  )
}

export default DesignPrefSections
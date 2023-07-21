import React, {useState} from 'react'
import ColumnSectionModal from './ColumnSectionModal'
import BeamSectionModal from './BeamSectionModal'
import ConnectorSectionModal from './ConnectorSectionModal'
import BoltSectionModal from './BoltSectionModal'
import WeldSectionModal from './WeldSectionModal'
import DetailingSectionModal from './DetailingSectionModal'
import DesignSectionModal from './DesignSectionModal'
import { Button , Input} from 'antd';

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

const DesignPrefSections = ({inputs, setInputs}) => {

    const [activeTab, setActiveTab] = useState(0)

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
                        {item.name}
                    </button>
                )
            })}
        </div>
        <div className='design-pref-cont'>
            {activeTab == 0 &&
                <ColumnSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 1 &&
                // <h2>Beam Section</h2>
                <BeamSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 2 &&
                <ConnectorSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 3 && 
                <BoltSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 4 && 
                <WeldSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 5 && 
                <DetailingSectionModal inputs={inputs} setInputs={setInputs}/>
            }
            {activeTab == 6 && 
                <DesignSectionModal inputs={inputs} setInputs={setInputs}/>
            }
        </div>

        { activeTab ==  0 || activeTab ==  1 
        ?  
        <div className='DesignPrefFooter DesignPrefFooter-btn'>
            
            <Button type="button" onClick={() => null}>Add</Button>
            <Button type="button" onClick={() => null}>Clear</Button>  
            <Button type="button" onClick={() => null}>import xlxs file </Button>
            <Button type="button" onClick={() => null}>Download xlxs file </Button>            
        </div> 
        : 
        null 
        }
        <div className='subDesignPrefFooter subDesignPrefFooter-btn'>
            
            <Button type="button" onClick={() => null}>Default</Button>
            
            <Button type="button" onClick={() => null}>Save </Button>            
        </div> 
        
    </div>
  )
}

export default DesignPrefSections
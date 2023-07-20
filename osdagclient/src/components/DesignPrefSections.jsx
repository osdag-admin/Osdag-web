import React, {useState} from 'react'
import ColumnSectionModal from './ColumnSectionModal'

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
                <h2>Beam Section</h2>
            }
            {activeTab == 2 &&
                <h2>Connector</h2>
            }
            {activeTab == 3 && 
                <h2>Bolt</h2>
            }
            {activeTab == 4 && 
                <h2>Weld</h2>
            }
            {activeTab == 5 && 
                <h2>Detailing</h2>
            }
            {activeTab == 6 && 
                <h2>Design</h2>
            }
        </div>
    </div>
  )
}

export default DesignPrefSections
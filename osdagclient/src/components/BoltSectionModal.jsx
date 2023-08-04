import { Select,Input } from 'antd'

const BoltSectionModal = ({ designPrefInputs, setDesignPrefInputs }) => {
    const Bolt_discription = `
IS 800 Table 20 Typical Average Values for Coefficient of Friction (µf)

Treatment of Surfaces     µ_f
i) Surfaces not treated   0.2
ii) Surfaces blasted with short or grit with any loose rust removed, no pitting   0.5
iii) Surfaces blasted with short or grit and hot-dip galvanized   0.1
iv) Surfaces blasted with short or grit and spray - metallized with zinc (thickness 50-70 µm)     0.25
v) Surfaces blasted with shot or grit and painted with ethylzinc silicate coat (thickness 30-60 µm)   0.3
vi) Sand blasted surface, after light rusting     0.52
vii) Surfaces blasted with shot or grit and painted with ethylzinc silicate coat (thickness 60-80 µm)     0.3
viii) Surfaces blasted with shot or grit and painted with alcalizinc silicate coat (thickness 60-80 µm)   0.3
ix) Surfaces blasted with shot or grit and spray metallized with aluminium (thickness >50 µm)     0.5
x) Clean mill scale   0.33
xi) Sand blasted surface      0.48
xii) Red lead painted surface     0.1
`;

    return (
<>
        <div className='Connector-col-beam-cont'>
            <div>
                <div className='sub-container'>
                    <h4>Inputs</h4>
                    <div className='input-cont'>
                        <h5>Type</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={designPrefInputs.bolt_tension_type}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, bolt_tension_type: value})}
                            >
                                    <Option value="Pretensioned">Pre-tensioned</Option>
                                    <Option value="Non pre-tensioned">Non Pre-tensioned</Option>
                            </Select>
                        </div>
                    </div>
                    <div className='input-cont'>
                    <h5>Hole Type</h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={designPrefInputs.bolt_hole_type}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, bolt_hole_type: value})}
                            >
                                    <Option value="Standard">Standard</Option>
                                    <Option value="0ver-Sized">Over-Sized</Option>
                            </Select>
                        </div>
                    </div>
                    <h4>HSFG Bolt</h4>
                    <div className='input-cont'>
                    <h5>
                        Slip factor, (mu<span style={{ verticalAlign: 'sub', fontSize: 'smaller' }}>f</span>)
                    </h5>
                        <div>
                            <Select style={{ width: '200px', height: '25px',fontSize: '12px' }}
                                value={designPrefInputs.bolt_slip_factor}
                                onSelect={value => setDesignPrefInputs({...designPrefInputs, bolt_slip_factor: value})}
                            >
                                    <Option value="0.5">0.5</Option>
                                    <Option value="0.3">0.3</Option>
                                    <Option value="o.2">0.2</Option>
                                    <Option value="o.25">0.25</Option>
                                    <Option value="0.1">0.1</Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
            {/*  */}
            <div>
                <div className="sub-container">
                    <h4>Discription</h4>
                    <Input.TextArea  rows={20} cols={150} value={Bolt_discription} readOnly/>
                </div>
            </div>
           

        </div>
            <div><b>Note: If slip is permitted under the design load design the bolt as a bearing bolt select corresponding bolt grade.</b></div> 
            </>
    )
}

export default BoltSectionModal
import React from 'react'
import { useState } from 'react';
import { Input, Modal } from 'antd';

const placeholderOutput = {
	Bolt: [
		{
			label: "Diameter (mm)",
			val: 0
		},
		{
			label: "Property Class",
			val: 0
		},
		{
			label: "shear Capacity (KN)",
			val: 0
		},
		{
			label: "Bolt Force (KN)",
			val: 0
		},
		{
			label: "Bolt Column (nos)",
			val: 0	
		},
		{
			label: "Bolt Rows (nos)",
			val: 0
		}
	],
	Plate: [
		{
			label: "Thickness (mm)",
			val: 0
		},
		{
			label: "Height (mm)",
			val: 0
		},
		{
			label: "Length (mm)",
			val: 0
		}
	],
	Weld: [
		{
			label: "Size (mm)",
			val: 0
		},
		{
			label: "Strength (N/mm2)",
			val: 0
		},
		{
			label: "Stress (N/mm)",
			val: 0
		}
	]
}


const platePopUpFields = ['Shear Yielding Capacity (kN)', 'Rupture Capacity (kN)', 'Block Shear Capacity (kN)', 'Tension Yielding Capacity (kN)', 'Tension Rupture Capacity (kN)', 'Axial Block Shear Capacity (kN)', 'Moment Demand (kNm)', 'Moment Capacity (kNm)']
const boltPopUpFields = ['Pitch Distance (mm)', 'End Distance (mm)', 'Edge Distance (mm)']

const OutputDock = ({ output }) => {

	const [spacingModel, setSpacingModel] = useState(false);
	const [capacityModel, setCapacityModel] = useState(false);
	
		const handleDialogSpacing = (value) => {
			if (value === 'Spacing') {
			  setSpacingModel(true);
			} else if (value === 'Capacity') {
			  setCapacityModel(true);
			} else {
			  setSpacingModel(false);
			  setCapacityModel(false);
			}
		  };

	// console.log(output)

	return (
		<div>
			<h5>Output Dock</h5>
			<div className='subMainBody scroll-data'>
				{output ? Object.keys(output).map((key, index) => {
					return (
						<div key={index}>
							<h3>{key}</h3>
							<div >
								{Object.values(output[key]).map((elm, index1) => {
									if(key == "Plate" && platePopUpFields.includes(elm.label))
										return (<></>)
									else if(key == "Bolt" && boltPopUpFields.includes(elm.label))
										return (<></>)
									return (
										<div key={index1} className='component-grid'>
											<div>
												<h4>{elm.label}</h4>
											</div>
											<div>
												<Input
													type="text"
													style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
													name={`${key}_${elm.lable}`}
													value={elm.val}
													disabled
												/>
											</div>
											{(key !== "Weld" && index1 == (Object.values(output[key])?.length-1)) &&
											<>
											<div>
												<h4>{key == "Bolt" ? "Spacing" : "Capacity"}</h4>
											</div>
											<div>
												<Input className='btn' type="button" value={key == "Bolt" ? "Spacing" : "Capacity"} />
											</div> 
											</>}
										</div>
									);
								})}
							</div>
						</div>
					);
				}) :
					<div>
						{Object.keys(placeholderOutput).map((key, index) => {
							return (
								<div key={index}>
									<h3>{key}</h3>
									<div >
										{Object.values(placeholderOutput[key]).map((elm, index1) => {
											if(key == "Plate" && platePopUpFields.includes(elm.label))
												return (<></>)
											else if(key == "Bolt" && boltPopUpFields.includes(elm.label))
												return (<></>)
											return (
												<div key={index1} className='component-grid' style={{userSelect: 'none'}}>
													<div>
														<h4>{elm.label}</h4>
													</div>
													<div>
														<Input
															type="text"
															style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
															name={`${key}_${elm.lable}`}
															value={' '}
															disabled
														/>
													</div>
													{(key !== "Weld" && index1 == (Object.values(placeholderOutput[key])?.length-1)) &&
													<>
													<div>
														<h4>{key == "Bolt" ? "Spacing" : "Capacity"}</h4>
													</div>
													<div>
														<Input
															className='btn'
															type="button"
															value={key === "Bolt" ? "Spacing" : "Capacity"}
															onClick={() => handleDialogSpacing(key === "Bolt" ? "Spacing" : "Capacity")}
														/>

													</div> 
													</>}
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>}
			</div>

				{/* Spacing  */}
				<Modal
				visible={spacingModel}
				onCancel={() => setSpacingModel(false)}
				footer={null}
				>
				<h1> Spacing Dialog Content</h1>
				</Modal>
				{/* Capacity */}
				<Modal
					visible={capacityModel}
					onCancel={() => setCapacityModel(false)}
					footer={null}
				>
					<h1>Capacity Dialog Content</h1>
				</Modal>
		</div>
	)
}

export default OutputDock
import React from 'react'
import { useState } from 'react';
import { Input, Modal } from 'antd';
import spacingIMG from '../assets/spacing_3.png'
import capacityIMG1 from '../assets/L_shear1.png'
import capacityIMG2 from '../assets/L.png'
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

	// console.log('output : ' , output, output && Object.keys(output).length)
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
				{(output && Object.keys(output).length) ? Object.keys(output).map((key, index) => {
					return (
						<>
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
													<Input className='btn' 
													type="button" 
													value={key == "Bolt" ? "Spacing" : "Capacity"} 
													onClick={() => handleDialogSpacing(key === "Bolt" ? "Spacing" : "Capacity")}/>
												</div> 
												</>}
											</div>
										);
									})}
								</div>
							</div>
							{
								(key === "Bolt") &&
								<div style={{marginTop: '7px', marginBottom: '7px'}}>
									<h4>Section Details</h4>
									<div className='component-grid'>
										<div>
											<h4>Capacity</h4>
										</div>
										<div>
											<Input className='btn' 
											type="button" 
											value={"Capacity"} 
											onClick={() => handleDialogSpacing("Capacity")}/>
										</div> 
									</div>
								</div>
							}
						</>);
				}) :
					<div>
						{Object.keys(placeholderOutput).map((key, index) => {
							return (
								<>
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
																// onClick={() => handleDialogSpacing(key === "Bolt" ? "Spacing" : "Capacity")}
																disabled
															/>

														</div> 
														</>}
													</div>
												);
											})}
										</div>
									</div>
									{
								(key === "Plate") &&
								<div style={{marginTop: '7px', marginBottom: '7px'}}>
									<h4>Section Details</h4>
									<div className='component-grid'>
										<div>
											<h4>Capacity</h4>
										</div>
										<div>
											<Input className='btn' 
											type="button" 
											value={"Capacity"} 
											disabled
											/>
										</div> 
									</div>
								</div>
							}
								</>);
						})}
					</div>}
			</div>

				{/* Spacing  */}
				<Modal
				visible={spacingModel}
				onCancel={() => setSpacingModel(false)}
				footer={null}
				width= {'100vh'}
				>
					<>
						<div
						style={{
							textAlign: 'center',
							// backgroundColor: 'black',
							// color: 'white',
							// padding: '10px'
						}}
						>
						<h3>Spacing Details</h3>
						</div>

						<div>
						<p 
							style={{ 
								padding: '20px',
								
							}}>
							Note: Representative image for Spacing Details -3 x 3  pattern considered </p>
							{/* <Input
								className='btn'
								type="button"
								value={"Close"}
								onClick={() => setSpacingModel(false)}
								style={{
									maxWidth: '10vh',
									maxHight: 'vh',
									marginLeft: "50vh"
								}}
								/> */}
						</div>
						<div className='spacing-main-body'>
							<div className='spacing-left-body'>
								<div>
									<h4>Pitch Distance (mm)</h4>
								</div>
								<div>
									<Input
										type="text"
										style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
										readOnly={true}
										value= {(output && output.Bolt && output?.Bolt[output?.Bolt.findIndex(val => val.label == "Pitch Distance (mm)")]?.val) || "0"}
									/>
								</div>
								<div>
									<h4>End Distance (mm)</h4>
								</div>
								<div>
									<Input
										type="text"
										style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
										readOnly={true}
										value= {(output && output.Bolt && output?.Bolt[output?.Bolt.findIndex(val => val.label == "End Distance (mm)")]?.val) || "0"}
									/>
								</div>
								<div>
									<h4>Gauge Distance (mm)</h4>
								</div>
								<div>
									<Input
										type="text"
										style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
										readOnly={true}
										value= {(output && output.Bolt && output?.Bolt[output?.Bolt.findIndex(val => val.label == "Gauge Distance (mm)")]?.val) || "0"}
									/>
								</div>
								<div>
									<h4>Edge Distance (mm)</h4>
								</div>
								<div>
									<Input
										type="text"
										style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
										readOnly={true}
										value= {(output && output.Bolt && output?.Bolt[output?.Bolt.findIndex(val => val.label == "Edge Distance (mm)")]?.val) || "0"}
									/>
								</div>


							
							</div>
							<div className='spacing-right-body'> 
								<img src={spacingIMG} alt='SpacingImage'/>
							</div>

						</div>
{/*  */}
					</>
				</Modal>
				{/* Capacity */}
				<Modal
					visible={capacityModel}
					onCancel={() => setCapacityModel(false)}
					footer={null}
					width= {'120vh'}
					style={{ maxHeight: '800px', overflow: 'auto' }}
				>
					<>
						<div
						style={{
							textAlign: 'center',
							// backgroundColor: 'black',
							// color: 'white',
							// padding: '10px'
							
						}}
						>
						<h3>Capacity Details</h3>
						</div>

						<div>
						<p 
							style={{ 
								padding: '20px',
								
							}}>
							Note: Representative image for Failure Pattern (Half Pate) - 2 x 3 Bolt pattern considered </p>
							{/* <Input
								className='btn'
								type="button"
								value={"Close"}
								onClick={() => setSpacingModel(false)}
								style={{
									maxWidth: '10vh',
									maxHight: 'vh',
									marginLeft: "50vh"
								}}
								/> */}
						</div>
						<div className='Capacity-main-body'>
								
							<div >
								<div className='Capacity-sub-body-title'> 
									<h4>Failure due Shear in Plate</h4>
								</div>
								<div className='Capacity-sub-body'>
								<div className='Capacity-left-body'> 
									<div>
										<h4>Shear Yielding Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Shear Yielding Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									<div>
										<h4>Rupture Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Rupture Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									<div>
										<h4>Block Shear Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Block Shear Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									
															
								</div>
								<div className='Capacity-right-body'> 
									<img src={capacityIMG1} alt='capacityIMG1'/>
									
									<h5>Block Shear Pattern</h5>
								</div>
								</div>
							</div>
							{/* section 2 */}
							<div >
								<div className='Capacity-sub-body-title'> 
									<h4>Failure due Tension in Plate</h4>
								</div>
								<div className='Capacity-sub-body'>
								<div className='Capacity-left-body'> 
									<div>
										<h4>Tension Yielding Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Tension Yielding Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									<div>
										<h4>Tension Rupture Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Tension Rupture Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									<div>
										<h4>Axial Block Shear Capacity (kN)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Axial Block Shear Capacity (kN)")]?.val) || "0"}
										/>
									</div>
									
															
								</div>
								<div className='Capacity-right-body'> 
									<img src={capacityIMG2} alt='capacityIMG2'/>
									
									<h5>Block Shear Pattern</h5>
								</div>
								</div>
							</div>
							{/* Section 3 */}
							<div >
								<div className='Capacity-sub-body-title'> 
									<h4>Section 3</h4>
								</div>
								<div className='Capacity-sub-body'>
								<div className='Capacity-left-body'> 
									<div>
										<h4>Moment Demand (kNm)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500', marginBottom: '20px' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Moment Demand (kNm)")]?.val) || "0"}
										/>
									</div>
									<div>
										<h4>Moment Capacity (kNm)</h4>
									</div>
									<div>
										<Input
											type="text"
											style={{ color: 'rgb(0 0 0 / 67%)', fontSize: '12px', fontWeight: '500' }}
											readOnly={true}
											value= {(output && output.Plate && output?.Plate[output?.Plate.findIndex(val => val.label == "Moment Capacity (kNm)")]?.val) || "0"}
										/>
									</div>
									
															
								</div>
								<div className='Capacity-right-body'> 
									{/* <img src={capacityIMG2} alt='capacityIMG2'/>
									
									<h5>Block Shear Pattern</h5> */}
								</div>
								</div>
							</div>
						</div>

{/*  */}
					</>
				</Modal>
		</div>
	)
}

export default OutputDock
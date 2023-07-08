import React from 'react'
import { Input } from 'antd';

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


const OutputDock = ({ output }) => {

	console.log(output)

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
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>}
			</div>
		</div>
	)
}

export default OutputDock
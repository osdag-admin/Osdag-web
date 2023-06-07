import '../../App.css'
import img1 from '../../assets/ShearConnection/sc_fin_plate.png'
// import { useEffect, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Select,Input} from 'antd'


function FinePlate() {

  const logData = [
    {
      "logID": 401,
      "log": "This is log entry 1."
    },
    {
      "logID": 202,
      "log": "This is log entry 2."
    },
    {
      "logID": 301,
      "log": "This is log entry 3."
    },
    {
      "logID": 404,
      "log": "This is log entry 4."
    },
    {
      "logID": 504,
      "log": "This is log entry 5."
    }
  ];

  const column = [
    {
      "columnID": 81,
      "col_name": "HB+197"
    },
    {
      "columnID": 92,
      "col_name": "HB+561"
    },
    {
      "columnID": 73,
      "col_name": "HB+804"
    },
    {
      "columnID": 49,
      "col_name": "HB+921"
    },
    {
      "columnID": 27,
      "col_name": "HB+156"
    },
    {
      "columnID": 35,
      "col_name": "HB+488"
    },
    {
      "columnID": 62,
      "col_name": "HB+279"
    }
  ];

  const beamData = [
    {
      "beamID": 58,
      "beam_name": "JB487"
    },
    {
      "beamID": 91,
      "beam_name": "JB104"
    },
    {
      "beamID": 27,
      "beam_name": "JB827"
    },
    {
      "beamID": 72,
      "beam_name": "JB655"
    },
    {
      "beamID": 39,
      "beam_name": "JB291"
    },
    {
      "beamID": 15,
      "beam_name": "JB737"
    },
    {
      "beamID": 64,
      "beam_name": "JB923"
    }
  ];
  
  const material = [
    {"MaterialID": "Fe 290",
      "Material_data": "Fe 290"
    },
    {"MaterialID": "Fe 410 W",
      "Material_data": "Fe 410 W"
    },
    {"MaterialID": "Fe 410 W",
      "Material_data": "Fe 410 W"
    },
    {"MaterialID": "Fe 410 W",
      "Material_data": "Fe 410 W"
    },
    {"MaterialID": "Fe 440",
      "Material_data": "Fe 440"
    }
  ];

  console.log(beamData);
    
  console.log(material);
  
  console.log(column);
  

  return (

    <>
    <div>
      <div className='module_nav'>

          <div>File</div>
          <div>Edit</div>
          <div>Graphics</div>
          <div>Database</div>
          <div>Help</div>
      </div>
    
    {/* Main Body of code  */}
    <div className='superMainBody'>
      {/* Left */}
      <div className='subMainBody'> 
          <h3>Connecting Members</h3>       
          <div className='component-grid'>
            <div><h4>Connectivity</h4></div>
            
            <div><Select style={ {width:'200px'}}>
                <option value={"CFBW"}>Column Flange-Beam Web</option>
                <option value={"CWBW"}>Column web-Beam Web</option>
                <option value={"BB"}>Beam-Beam</option>             
                </Select>
            </div>
            
            <div>{/*Blank*/}</div>
            
            <div>
              <img src={img1} alt="Component" height='100px' width='100px' />
            </div>

            <div><h4>Primary Beam</h4></div>
            <div><Select style={ {width:'200px'}}>
                <option value={"CFBW"}>Select Section</option>
                <option value={"CFBW"}>JB 150</option>
                <option value={"CFBW"}>JB 175</option>
                <option value={"CFBW"}>JB 200</option>
                <option value={"CFBW"}>JB 225</option>
                </Select>
            </div>
          </div>
      </div>

      {/* Middle */}
      <div className='superMainBody_mid'>
      <img src={img1} alt="Demo" height='300px' width='300px' /> 
      <br/>
      <div>

      <ul>
{/* Code 1++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      {/* {data.map((item) => (
        <p key={item.DesignId}>Save name :{item.DesignName}
        <br/>
        File Name: {item.PhotoFileName}
        </p>   
      ))} */}

{/* Solution ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      
<select name="Cars" size="5" >  
      {logData.map((item) => (
         <option key={item.logID} value={item.logID}> Save Name : {item.logID}{" : "}
          File Name: {item.log}  </option>   
      ))}
  
</select>

      </ul>

      </div>
      
      
      </div>

      {/* Right */}
      <div className='component-grid    '> 
  
      <div><label>Property Classes :</label></div>
      <div><Input type="text" name="fileName" disabled/></div>
  

    {/* <Input type="button" value="Submit" onClick={savedata}/> */}
    
    {/* <input type="button" value="Submit" onClick={refreshList}/> */}
      </div>
    </div>

    {/* <ToastContainer /> */}
    </div>
    </>
  )
}

export default FinePlate
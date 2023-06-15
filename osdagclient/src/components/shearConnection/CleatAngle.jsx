import '../../App.css'
import img1 from '../../assets/ShearConnection/1.png'
import img2 from '../../assets/centerModule.png'
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Select,Input} from 'antd'


function CleatAngle() {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/design');
      const jsonData = await response.json();
      console.log(JSON.stringify(jsonData))
      setData(jsonData);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  // const imageUpload = (e) => {
  //   e.preventDefault();
  //     console.log('Uploading image')
  //   const formData = new FormData();
  //   formData.append("file", e.target.files,e.target.files.name)
  //   fetch('http://127.0.0.1:8000/design/savefile',{
  //       method: "POST",
  //       body: formData
  //     }).then(res=>res.json())
  // }

const savedata = async () => { 

      if(values.DesignName=="" && values.PhotoFileName=="")
      {
        toast.warn('Please Enter Data !! ', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
          return;
      }
      
      
      // Will create URLS for each model 
      fetch('http://127.0.0.1:8000/design',{
        method: 'POST',
        headers: { 'Accept': 'application/json',
                    'Content-Type': 'application/json'
        },
        body:JSON.stringify({
          DesignName:values.DesignName,
          PhotoFileName:values.PhotoFilename
        })
      })
      .then(res=>res.json())
      fetchData();
      toast.success('Data Saved Successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });

      //   const fileDataInput  = new FormData();
      //   fileDataInput.append("file",e.target.files[0],e.target.files[0].name)
      
      // fetch('http://127.0.0.1:8000/design/savefile',{
      //   method: "POST",
      //   body: fileDataInput
      // }).then(res=>res.json())
      
      setValues.DesignId("");
      setValues.PhotoFileName("");


}


  // const design=[];

  const [values, setValues] = useState({
    DesignName: "",
    PhotoFilename: "",
  });
    console.log(values.DesignName, values.PhotoFilename);

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
          <h1>Connecting Members(Cheat Angle)</h1>
          
          <div className='childMainBody'>
          <h4>Connectivity</h4>
          </div>

          <div>
          <Select style={ {width:'200px'}}>
                <option value={"CFBW"}>Column Flange-Beam Web</option>
                <option value={"CWBW"}>Column web-Beam Web</option>
                <option value={"BB"}>Beam-Beam</option>             
          </Select>
          </div>
          
          <div>
          <img src={img1} alt="Component" height='100px' width='100px' />
          </div>
          {/* 1 */}

          <div className='childMainBody'>
          <h4>Primary Beam</h4>
          <Select style={ {width:'200px'}}>
                <option value={"CFBW"}>Select Section</option>
                <option value={"CFBW"}>JB 150</option>
                <option value={"CFBW"}>JB 175</option>
                <option value={"CFBW"}>JB 200</option>
                <option value={"CFBW"}>JB 225</option>
                           
          </Select>
          </div>
          {/* 2 */}
  
          <div className='childMainBody'>
          <h4>Secondary Beam</h4>
          <Select style={ {width:'200px'}}>
                <option value={"CFBW"}>Select Section</option>
                <option value={"CFBW"}>JB 150</option>
                <option value={"CFBW"}>JB 175</option>
                <option value={"CFBW"}>JB 200</option>
                <option value={"CFBW"}>JB 225</option>          
          </Select>
          </div>
          {/* 3 */}

          <div className='childMainBody'>
          <h4>Material</h4>
          <Select style={ {width:'200px'}}>
                <option value={"CFBW"}>{`E 165 (Fe 290)`}</option>
                <option value={"CWBW"}>{`E 250 (Fe 410 W)`}A</option>
                <option value={"BB"}>{`E 250 (Fe 410 W)`}B</option> 
                <option value={"BB"}>{`E 250 (Fe 410 W)`}C</option>
                <option value={"BB"}>{`E 300 (Fe 440)`}</option>
          </Select>
          </div>

      </div>

      {/* Middle */}
      <div className='superMainBody_mid'>
      <img src={img2} alt="Demo" height='400px' width='400px' /> 
      <br/>
      <div>

      <ul>
      {/* {design.map((ds) => (
        <li key={ds}>
          {ds.DesignName}
          {ds.PhotoFilename}
        </li>
      ))} */}

{/* Code 1++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      {/* {data.map((item) => (
        <p key={item.DesignId}>Save name :{item.DesignName}
        <br/>
        File Name: {item.PhotoFileName}
        </p>   
      ))} */}

{/* Solution ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      
<select name="Cars" size="5" >  
      {data.map((item) => (
         <option key={item.DesignId} value={item.DesignName}> Save Name : {item.DesignName}{" || "}
          File Name: {item.PhotoFileName}  </option>  
        // <p key={item.DesignId}>Save name :{item.DesignName}
        // <br/>
        // File Name: {item.PhotoFileName}
        // </p>   
      ))}
  
</select>

      </ul>

      </div>
      
      
      </div>

      {/* Right */}
      <div className='superMainBody_right'> 
      
      <div>
      <label>Enter File Name :</label>
      <Input type="text" name="fileName" value={values.DesignName} onChange={(event) =>
            setValues((prev) => ({ ...prev, DesignName: event.target.value }))
          }/>
      </div>

      <div>
     
      <input type="file" name="fileName" value={values.PhotoFilename} onChange={(event) =>
            setValues((prev) => ({ ...prev, PhotoFilename: event.target.value }))
          }/>



      </div>


      <div>
      <label>Property Classes :</label>
      <Input type="text" name="fileName" disabled/>
      </div>
      <div>
      <label>Shared Capacity :</label>
      <Input type="text" name="fileName" disabled/>
      </div>
      
      <div>
      <label>Bering Capacity :</label>
      <Input type="text" name="fileName" disabled/>
      </div>

      <div>
      <label>Bolt ColumnsNo :</label>
      <Input type="text" name="fileName" disabled/>
      </div>

    <Input type="button" value="Submit" onClick={savedata}/>
    
    {/* <input type="button" value="Submit" onClick={refreshList}/> */}
      </div>
    </div>

    <ToastContainer />
    </div>
    </>
  )
}

export default CleatAngle
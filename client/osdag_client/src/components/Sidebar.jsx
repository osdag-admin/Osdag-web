import '../app.css'
import Osdag_logo from "../assets/logo-osdag.png"
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import SidebarJSON from '../urls/Sidebar.json'
function Sidebar() {


  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/osdag-web/', {
        method: 'GET'
      });
      const jsonData = await response.json();
      console.log(JSON.stringify(jsonData))
      setData(jsonData.result);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };


  function handleSelectChange(event) {
    const selectedOptionValue = event.target.value;
    if (selectedOptionValue === "1") {
      window.location.href = "https://osdag.fossee.in/resources/videos";
    }
    else if (selectedOptionValue === "2") {
      window.location.href = "https://www.youtube.com/channel/UCnSZ7EjhDwNi3eCPcSKpgJg";
    }
    else if (selectedOptionValue === "3") {
      window.location.href = "file:///D:/Osdag_windows_installer_v2021.02.a.a12f/Osdag_windows_installer_v2021.02.a.a12f/Osdag/ResourceFiles/html_page/_build/html/index.html";
    }
    else if (selectedOptionValue === "4") {
      window.location.href = "https://osdag.fossee.in/forum";
    }
  }

  const navigate = useNavigate();
  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar-item-logo">
          <center> <img src={Osdag_logo} alt="Logo" height="50px" onClick={() => navigate("/")} /></center>
        </div>
        {
          data && data.data.map((item, index) => {
            return (
              <>
                <div key={index} className="sidebar-item" >
                  <button onClick={() => {
                    navigate(item.name.toLowerCase().replaceAll("_", ""))
                  }}>{item.name}</button>
                </div>
              </>
            )
          })
        }
      </div>
      <div className="sidebar-setting">
        <select onChange={handleSelectChange}>
          <option value={"1"}>Help</option>
          <option value={"2"}>Video Tutorials</option>
          <option value={"3"}>Design Examples</option>
          <option value={"4"}>Ask Us a Question</option>
          <option value={"5"}>Check for Update</option>
        </select>
      </div>
    </>
  )
}

export default Sidebar
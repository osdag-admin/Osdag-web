import '../App.css'
import Osdag from "../assets/osdag-title.png"
import IIT from "../assets/iit.png"
import Fossee from "../assets/fossee.png"
function Mainwindow() {
    return (
      <> 
        <div className='osdag-main-title'>
          <div>
            <img height="200px" width="800px" src={Osdag}/>
          </div>
          <div className='osdag-main-title-element'>
            <div><img height="100px" width="100px" src={IIT}/></div>
            <div><img height="150px" width="400px" src={Fossee}/></div>
          </div>

        </div>  
      </>
    )
  }
  
  export default Mainwindow
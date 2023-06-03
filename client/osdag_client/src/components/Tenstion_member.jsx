import TMbeg from "../assets/TensionMember/1.png";
import TMweg from "../assets/TensionMember/2.png";

import '../App.css'
function Tenstion_member() {
    return (
      <>
      <div className="content-tabs">
      <center><h2> Tension Member</h2></center>
          <hr />
            <div className='conn-grid-container'>
              <div className='conn-grid-item'><input type="radio" value="Fin_Plate" name="shear-conn"></input><b>Bolted to End Gusst</b><br/><img src={TMbeg}/></div> 
              <div className='conn-grid-item'><input type="radio" value="Cheat_Angle" name="shear-conn" /><b>Welded to End Gusst</b><br/> <img src={TMweg}/></div>
            </div>
            <center><div className='conn-btn'><button>Start</button></div></center>
      </div>
      </>
    )
  }
  
  export default Tenstion_member
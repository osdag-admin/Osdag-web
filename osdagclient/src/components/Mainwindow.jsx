import '../App.css'
import Osdag from "../assets/osdag-title.png"
import IIT from "../assets/iit.png"
import Fossee from "../assets/fossee.png"
function Mainwindow() {
  return (
    <div className='home-cont'>
      <img className='osdag-logo' alt='osdag-logo' height="200px" width="800px" src={Osdag} />
      <img className='iit-logo' alt='iitb logo' height="100px" width="250px" src={IIT} />
      <img className='fossee-logo' alt='fossee-logo' height="150px" width="400px" src={Fossee} />
    </div>
  )
}

export default Mainwindow
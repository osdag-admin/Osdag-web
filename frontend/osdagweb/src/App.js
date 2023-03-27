import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Homepage from "./homepage/homepage";
import Connection from "./connection/Connection";
import TensionMember from './tension/TensionMember';
import Others from './others/Others';
import FinPlatee from './connectionPages/FinPlate2/FinPlatee';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/connection" element={<Connection/>}/>
        <Route path="/tension" element={<TensionMember/>}/>
        <Route path="/underdev" element={<Others/>}/>
        <Route path="/finplate" element={<FinPlatee/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

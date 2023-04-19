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
import FinPlate from './connectionPages/finPlate/FinPlate';
import BasePlate from './connection_subpages/BasePlate';
import Bolted from './tensionPages/BoltedToEndGusset/Bolted';

//BrowserRouter is a component provided by the React Router library that allows for declarative routing in a React application.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/connection" element={<Connection/>}/>
        <Route path="/tension" element={<TensionMember/>}/>
        <Route path="/underdev" element={<Others/>}/>
        <Route path="/finplate" element={<FinPlate/>}/>
        <Route path="/baseplate" element={<BasePlate/>}/>
        <Route path="/bolted-ten" element={<Bolted/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

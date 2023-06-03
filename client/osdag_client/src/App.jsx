import './App.css'
import Sidebar from './components/Sidebar'
import  Mainwindow  from './components/Mainwindow'
import Connection from './components/Connection';
import NotAvilable from './components/NotAvilable.jsx'
import Tenstion_member from './components/Tenstion_member.jsx'
import FinePlate from './components/shearConnection/FinePlate';
import { createBrowserRouter, createRoutesFromElements, Route, Outlet,RouterProvider } from 'react-router-dom';

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
            <Route index element={<Mainwindow/>}/>
            <Route path ="/connection" element={<Connection/>}/>
            <Route path ="/tenstionMember" element={<Tenstion_member/>}/>
            <Route path ="/notAvailable" element={<NotAvilable/>}/>

            {/* Share Connection  */}
            <Route path ="/connection/finplate" element={<FinePlate/>}/>
      </Route>
    )
  )
  return (
    <>
    <div className="sidebar">
          {/* <div><Sidebar/></div> 
          <div><Mainwindow/></div> 
          <div><Connection/></div> */}
          <RouterProvider router={router}/>
    </div>
    </>
  )
}
const Root = () =>{
  return (
  <> 
    <div>
      <Sidebar/>
    </div>
    <div>
        <Outlet />
    </div> 
  </>
    )
}

export default App

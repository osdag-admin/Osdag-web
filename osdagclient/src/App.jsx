import './App.css'
import FinePlate from './components/shearConnection/FinePlate';
import Sidebar from './components/Sidebar'
import Mainwindow from './components/Mainwindow'
import { createBrowserRouter, createRoutesFromElements, Route, Outlet, RouterProvider } from 'react-router-dom';
import Window from './components/Window';

import { GlobalProvider } from './context/GlobalState'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<Mainwindow />} />
        <Route path='/design-type/:designType' element={<Window />} />
        <Route path='/fin_plate' element={<FinePlate />} />
      </Route>
    )
  )
  return (
    <GlobalProvider>
      <div className="app">
        <RouterProvider router={router} />
      </div>
    </GlobalProvider>
  )
}
const Root = () => {
  return (
    <>
      <div>
        <Sidebar />
      </div>
      <div>
        <Outlet />
      </div>
    </>
  )
}

export default App

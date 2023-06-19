import './App.css'
import FinePlate from './components/shearConnection/FinePlate';
import Sidebar from './components/Sidebar'
import Mainwindow from './components/Mainwindow'
import { createBrowserRouter, createRoutesFromElements, Route, Outlet, RouterProvider } from 'react-router-dom';
import Window from './components/Window';

import { GlobalProvider } from './context/GlobalState'
import { ModuleProvider } from './context/ModuleState';

// pdf viewer imports 
import {Worker} from '@react-pdf-viewer/core'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<Mainwindow />} />
        <Route path='/design-type/:designType' element={<Window />} />
        <Route path='/design/:designType/:item' element={<FinePlate />} />
      </Route>
    )
  )
  return (
    <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
      <GlobalProvider>
        <ModuleProvider>
          <div className="app">
            <RouterProvider router={router} />
          </div>
        </ModuleProvider>
      </GlobalProvider>
    </Worker>
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

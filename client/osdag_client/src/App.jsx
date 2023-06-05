import './App.css'
import Sidebar from './components/Sidebar'
import Mainwindow from './components/Mainwindow'
import { createBrowserRouter, createRoutesFromElements, Route, Outlet, RouterProvider } from 'react-router-dom';
import Window from './components/Window';

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<Mainwindow />} />
        <Route path='/design-type/:designType' element={<Window />} />
      </Route>
    )
  )
  return (
    <>
      <div className="app">
        <RouterProvider router={router} />
      </div>
    </>
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

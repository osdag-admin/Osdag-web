





// import { useState } from 'react';

// function Endplate() {
//   const [activeMenu, setActiveMenu] = useState(null);
//   const [activeSubMenu, setActiveSubMenu] = useState(null);

//   const toggleMenu = (menu) => {
//     setActiveMenu(activeMenu === menu ? null : menu);
//     setActiveSubMenu(null); // Close any open submenus when switching menus
//   };

//   const handleFileInput = (type) => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.json'; // Adjust file type as needed
//     input.onchange = (event) => {
//       const file = event.target.files[0];
//       if (file) {
//         console.log(`${type} file selected:`, file.name);
//         // Handle the file input here
//       }
//     };
//     input.click();
//   };

//   return (
//     <div className="flex flex-col w-full">
//       {/* Top Bar */}
//       <div className="bg-gray-200 text-black flex justify-between items-center z-10">
//         <div className="flex relative">
//           {/* File Menu */}
//           <div className="relative">
//             <button
//               className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
//               onClick={() => toggleMenu('file')}
//             >
//               File
//             </button>
//             {activeMenu === 'file' && (
//               <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Load input <span className="float-right text-black">Ctrl+L</span>
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Save input <span className="float-right text-black">Ctrl+S</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Save log messages <span className="float-right text-black">Alt+M</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Create design report <span className="float-right text-black">Alt+C</span>
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Save 3D model <span className="float-right text-black">Alt+3</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Save CAD image <span className="float-right text-black">Alt+I</span>
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px]  shadow-white hover:bg-[#92c231]">
//                   Quit <span className="float-right text-black">Shift+Q</span>
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="relative">
//             <button
//               className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
//               onClick={() => toggleMenu('Edit')}
//             >
//              Edit
//             </button>
//             {activeMenu === 'Edit' && (
//               <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                 Design Preferences <span className="float-right text-black">Alt+P</span>
//                 </button>
                
                
//               </div>
//             )}
//           </div>



//           {/* Graphics Menu */}
//           <div className="relative">
//             <button
//               className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
//               onClick={() => toggleMenu('graphics')}
//             >
//               Graphics
//             </button>
//             {activeMenu === 'graphics' && (
//               <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Zoom in <span className="float-right text-black">Ctrl+I</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Zoom out <span className="float-right text-black">Ctrl+O</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Pan <span className="float-right text-black">Ctrl+P</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Rotate 3D model <span className="float-right text-black">Ctrl+R</span>
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Show front view <span className="float-right text-black">Alt+Shift+F</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Show top view <span className="float-right text-black">Alt+Shift+T</span>
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Show side view <span className="float-right text-black">Alt+Shift+S</span>
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Model 
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Beam 
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                  End plate 
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Change background
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Database Menu */}
//           <div className="relative">
//             <button
//               className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
//               onClick={() => toggleMenu('database')}
//             >
//               Database
//             </button>
//             {activeMenu === 'database' && (
//               <div className="absolute left-0 top-full bg-white shadow-md border border-black w-52">
//                 <div
//                   className="relative"
//                   onMouseEnter={() => setActiveSubMenu('download')}
//                   onMouseLeave={() => setActiveSubMenu(null)}
//                 >
//                   <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                     Download
//                   </button>
//                   {activeSubMenu === 'download' && (
//                     <div className="absolute left-full top-0 bg-white shadow-md border border-black w-40">
//                       <button
//                         className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
//                         onClick={() => handleFileInput('Column')}
//                       > 
//                        <li> Column</li>
//                       </button>
//                       <button
//                         className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
//                         onClick={() => handleFileInput('Beam')}
//                       >
//                         <li>Beam</li>
//                       </button>
//                       <button
//                         className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
//                         onClick={() => handleFileInput('Angle')}
//                       >
//                         <li>Angle</li>
//                       </button>
//                       <button
//                         className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
//                         onClick={() => handleFileInput('Channel')}
//                       >
//                         <li>Channel</li>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <hr className="border-t-[#7e8799] border-[#7e8799]" />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Reset
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Help Menu */}
//           <div className="relative">
//             <button
//               className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
//               onClick={() => toggleMenu('help')}
//             >
//               Help
//             </button>
//             {activeMenu === 'help' && (
//               <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Video Tutorials
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Design Examples
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Ask Us a Question
//                 </button>
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   About Osdag
//                 </button>
//                 <hr className="border-t-[#7e8799] border-[#7e8799] " />
//                 <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
//                   Check For Update
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//     </div>
//   );
// }

// export default Endplate;









import { useState } from 'react';

function Endplate() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
    setActiveSubMenu(null); // Close any open submenus when switching menus
  };

  const handleFileDownload = (type) => {
    const fileUrls = {
      Column: '/downloads/column.json',
      Beam: '/downloads/beam.json',
      Angle: '/downloads/angle.json',
      Channel: '/downloads/channel.json',
    };

    const url = fileUrls[type];
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.json`; // Set the downloaded file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Invalid file type for download:', type);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar */}
      <div className="bg-gray-200 text-black flex justify-between items-center z-10">
        <div className="flex relative">
          {/* File Menu */}
          <div className="relative">
            <button
              className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
              onClick={() => toggleMenu('file')}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Load input <span className="float-right text-black">Ctrl+L</span>
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Save input <span className="float-right text-black">Ctrl+S</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Save log messages <span className="float-right text-black">Alt+M</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Create design report <span className="float-right text-black">Alt+C</span>
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Save 3D model <span className="float-right text-black">Alt+3</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Save CAD image <span className="float-right text-black">Alt+I</span>
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px]  shadow-white hover:bg-[#92c231]">
                  Quit <span className="float-right text-black">Shift+Q</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
              onClick={() => toggleMenu('Edit')}
            >
             Edit
            </button>
            {activeMenu === 'Edit' && (
              <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                Design Preferences <span className="float-right text-black">Alt+P</span>
                </button>
                
                
              </div>
            )}
          </div>



          {/* Graphics Menu */}
          <div className="relative">
            <button
              className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
              onClick={() => toggleMenu('graphics')}
            >
              Graphics
            </button>
            {activeMenu === 'graphics' && (
              <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Zoom in <span className="float-right text-black">Ctrl+I</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Zoom out <span className="float-right text-black">Ctrl+O</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Pan <span className="float-right text-black">Ctrl+P</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Rotate 3D model <span className="float-right text-black">Ctrl+R</span>
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Show front view <span className="float-right text-black">Alt+Shift+F</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Show top view <span className="float-right text-black">Alt+Shift+T</span>
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Show side view <span className="float-right text-black">Alt+Shift+S</span>
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Model 
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Beam 
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                 End plate 
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Change background
                </button>
              </div>
            )}
          </div>

          {/* Database Menu */}
          <div className="relative">
            <button
              className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
              onClick={() => toggleMenu('database')}
            >
              Database
            </button>
            {activeMenu === 'database' && (
              <div className="absolute left-0 top-full bg-white shadow-md border border-black w-52">
                <div
                  className="relative"
                  onMouseEnter={() => setActiveSubMenu('download')}
                  onMouseLeave={() => setActiveSubMenu(null)}
                >
                  <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                    Download
                  </button>
                  {activeSubMenu === 'download' && (
                    <div className="absolute left-full top-0 bg-white shadow-md border border-black w-40">
                      <button
                        className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
                        onClick={() => handleFileDownload('Column')}
                      >
                        <li>Column</li>
                      </button>
                      <button
                        className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
                        onClick={() => handleFileDownload('Beam')}
                      >
                      <li>  Beam</li>
                      </button>
                      <button
                        className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
                        onClick={() => handleFileDownload('Angle')}
                      >
                        <li>Angle</li>
                      </button>
                      <button
                        className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]"
                        onClick={() => handleFileDownload('Channel')}
                      >
                        <li>Channel</li>
                      </button>
                    </div>
                  )}
                </div>
                <hr className="border-t-[#7e8799] border-[#7e8799]" />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              className="hover:bg-[#5281ee] px-2 text-[12px] py-1"
              onClick={() => toggleMenu('help')}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 top-full bg-white shadow-md  border border-black w-52">
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Video Tutorials
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Design Examples
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Ask Us a Question
                </button>
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  About Osdag
                </button>
                <hr className="border-t-[#7e8799] border-[#7e8799] " />
                <button className="block w-full text-left px-4 py-0 text-[13px] hover:bg-[#92c231]">
                  Check For Update
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
    </div>
  );
}

export default Endplate;
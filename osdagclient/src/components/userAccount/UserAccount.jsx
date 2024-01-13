import {React , useContext} from 'react';
import { List, Button } from 'antd';
import './UserAccount.css'; 
import { UserContext } from '../../context/UserState';


let renderOnce = false
let prevValue = localStorage.getItem('allInputValueFilesLength')

const UserAccount = () => {

  // UserContext thunks adn variables 
  const {inputFilesLink , obtainAllInputValueFiles} = useContext(UserContext)
  const userName = localStorage.getItem("username");
  const allInputValueFilesLength = localStorage.getItem('allInputValueFilesLength')
  if(prevValue != allInputValueFilesLength){
    renderOnce = false
  }
  // const userEmail = localStorage.getItem("email");
  // Replace these with your actual data
  /*
  const osiFiles = [
    { name: 'File 1.osi', url: 'https://example.com/file1.osi' },
    { name: 'File 2.osi', url: 'https://example.com/file2.osi' },
    // Add more fila
  ];
  */

  if(!renderOnce){
    // call the thunk to obtain all the input_value_files 
    // alert("not input files")
    obtainAllInputValueFiles()
    prevValue = allInputValueFilesLength
    renderOnce = true
  }



  const onViewClick = (link) => {
    // Implement view logic here
    //onsole.log('View file:', url);
    console.log('inside onViewClick')

    return(
      <iframe src={link.url} style="width:600px; height:500px;"></iframe>
    )
  };


  /*
  const renderItem = (file) => (
    <List.Item>
      <span>{file.name}</span>
      <Button onClick={() => onViewClick(file.url)} style={{ marginLeft: '10px' }}>
        View
      </Button>
      <Button onClick={() => onDownloadClick(file.url)} style={{ marginLeft: '10px' }}>
        Download
      </Button>
    </List.Item>
  );
  */

  const downloadInputFile = (link) => {
    console.log('inside download input file')
    link.click()
    link.remove()
  }
  const handleLogout = () => {

    localStorage.removeItem('userType');
localStorage.removeItem('username');
//localStorage.removeItem('refresh');
localStorage.removeItem('isLoggedIn');
localStorage.removeItem('email');
localStorage.removeItem('allInputValueFilesLength');
localStorage.removeItem('access');
    console.log("Logged out!");
    window.location.href = '/';

  };

  return (
    <>
    <div className="user-dashboard-container">
    <div className='dashboard-header' style={{ display: 'flex', justifyContent: 'space-between' }}>
  <h2>User Dashboard</h2>
  <div>
    <strong>Username: </strong>{userName} <br />
    {/*<strong>Email: </strong> {userEmail} */}
  </div>
  <div>
    <Button onClick={handleLogout}
    style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
    Logout
    </Button>
  </div>
</div>
      <div className="user-dashboard">
        <strong>Files in .osi format:</strong>
        <List >
          {inputFilesLink.map((item , index) => (
            <li key={index} style={{'marginTop' : '5px'}}>
              <span>{item.innerHTML}</span>
              {/*<Button onClick={() => onViewClick(item)} style={{ marginLeft: '185px' }}>View</Button>*/}
              <Button onClick={() => downloadInputFile(item)} style={{ marginLeft: '412px' }}>Download</Button>
            </li>
          ))}
        </List>
      </div>
    </div>
            </>
  );
};

export default UserAccount;

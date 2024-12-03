
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignUp from './auth/SignUp';
import HomePage from './components/HomePage';
import Login from './auth/Login';
import WelcomePage from './components/WelcomePage';
import ProfilePage from './components/home-page-components/ProfilePage';
import YourPostsPage from './components/home-page-components/YourPostsPage';
import Notifications from './components/home-page-components/Notifications';
import Connections from './components/home-page-components/Connections';
import ChatHere from './components/home-page-components/ChatHere';

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path='/' element={<WelcomePage/>}/>
        <Route path='/login-page' element={<Login/>}/>
        <Route path='/signup-page' element={<SignUp/>}/>
        <Route path='/home-page' element={<HomePage/>}/>
        <Route path='/profile' element={<ProfilePage/>}/>
        <Route path='/your-posts' element={<YourPostsPage/>}/>
        <Route path='/notifications' element={<Notifications/>}/>
        <Route path='/connections' element={<Connections/>}/>
        <Route path="/chat/:email1/:email2" element={<ChatHere/>}/>
      </Routes>
      </div>
    </BrowserRouter>
    
  );
}

export default App;

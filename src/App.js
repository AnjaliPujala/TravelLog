
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignUp from './auth/SignUp';
import HomePage from './components/HomePage';
import Login from './auth/Login';
import WelcomePage from './components/WelcomePage';

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path='/' element={<WelcomePage/>}/>
        <Route path='/login-page' element={<Login/>}/>
        <Route path='/signup-page' element={<SignUp/>}/>
        <Route path='/home-page' element={<HomePage/>}/>
      </Routes>
      </div>
    </BrowserRouter>
    
  );
}

export default App;

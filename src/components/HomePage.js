import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HomePage.css';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/login-page'); 
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const userPosts = [
      { id: 1, title: "Post 1", content: "This is the content of the first post." },
      { id: 2, title: "Post 2", content: "This is some more content for the second post." },
      { id: 3, title: "Post 3", content: "Here's the third post content, very interesting!" }
    ];
    setPosts(userPosts); 
  }, []);

  return (
    <div className="home-container">
      <span className="navbar-brand middle-title-small">
            <img src="https://static.vecteezy.com/system/resources/previews/025/165/901/original/coconut-tree-transparent-background-free-png.png" alt='Coconuttree' className='coconut-icon'/>
            TravelLog
      </span>
      <nav className="navbar navbar-expand-lg navbar-light bg-light d-none d-lg-block">
        <div className="container-fluid">
        <span className="navbar-brand middle-title">
            <img src="https://static.vecteezy.com/system/resources/previews/025/165/901/original/coconut-tree-transparent-background-free-png.png" alt='Coconuttree' className='coconut-icon'/>
            TravelLog
        </span>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/posts">Your Posts</Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/saved">Saved</Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/notifications">Notifications</Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/settings">Settings</Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/login-page" onClick={() => localStorage.removeItem('isLoggedIn')}>Logout</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''} d-lg-none`}>
        <div className="hamburger d-lg-none" onClick={toggleSidebar}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
        <ul className="sidebar-links">
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/your-posts">Your Posts</Link></li>
          <li><Link to="/saved">Saved</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/login-page" onClick={() => localStorage.removeItem('isLoggedIn')}>Logout</Link></li>
        </ul>
      </div>


      <div className="container main-content">
        <h2>Recent Posts</h2>
        {posts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

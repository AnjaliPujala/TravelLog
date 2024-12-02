import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HomePage.css';
import { db } from '../firebase/FirebaseInitializer';
import { collection, getDocs, updateDoc, doc, query,where} from 'firebase/firestore';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [activePostId, setActivePostId] = useState(null); 
  const [newComment, setNewComment] = useState(''); 
  const [sentRequests, setSentRequests] = useState([]); 
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/login-page');
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'user-posts');
      const querySnapshot = await getDocs(postsCollection);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    const updatedPosts = posts.map((post) =>
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);

    const postRef = doc(db, 'user-posts', id);
    try {
      await updateDoc(postRef, {
        likes: updatedPosts.find((post) => post.id === id).likes,
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const handleShowComments = (id) => {
    setActivePostId(activePostId === id ? null : id);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async (postId) => {
    if (newComment.trim() === '') return;

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = [...post.comments, newComment];

        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);

    const postRef = doc(db, 'user-posts', postId);
    try {
      await updateDoc(postRef, {
        comments: [...updatedPosts.find((post) => post.id === postId).comments, newComment],
      });
      setNewComment('');
    } catch (e) {
      console.error('Error adding comment: ', e);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));

    if (!userData) {
      navigate('/login-page');
    } else {
      setUser(userData);
    }
  }, []);

  const handleConnectionRequest = async (receiverEmail) => {
    if (sentRequests.includes(receiverEmail)) return;
  
    const updatedUser = { ...user, sentConnections: [...user.sentConnections, receiverEmail] };
    setUser(updatedUser);
  
    setSentRequests((prevRequests) => [...prevRequests, receiverEmail]);
  
    try {
      const userRef = collection(db, 'users');
      let q = query(userRef, where('email', '==', user.email));
      const userDocs = await getDocs(q);
  
      if (userDocs.empty) {
        alert('User not found');
        return;
      }
  
      const userDoc = userDocs.docs[0];
      const userDocRef = doc(db, 'users', userDoc.id);
  
      
      const userDocData = userDoc.data();
      const newSentConnections = userDocData.sentConnections || [];
      await updateDoc(userDocRef, {
        sentConnections: [...newSentConnections, receiverEmail],
      });
  
      sessionStorage.setItem('user', JSON.stringify(updatedUser));  
  
      const recipientRef = collection(db, 'users');
      q = query(recipientRef, where('email', '==', receiverEmail));
      const recipientDocs = await getDocs(q);
  
      if (recipientDocs.empty) {
        alert('Recipient not found');
        return;
      }
  
      const recipientDoc = recipientDocs.docs[0];
      const recipientDocRef = doc(db, 'users', recipientDoc.id);
  
      const recipientData = recipientDoc.data();
      const newRequests = recipientData.requests || [];
  
      await updateDoc(recipientDocRef, {
        requests: [...newRequests, user.email],
      });
  
      alert('Connection request sent');
    } catch (error) {
      alert('Error sending connection request: ', error);
    }
};

  return (
    <div className="home-container">
      <span className="navbar-brand middle-title-small">
        <img
          src="https://static.vecteezy.com/system/resources/previews/025/165/901/original/coconut-tree-transparent-background-free-png.png"
          alt="Coconuttree"
          className="coconut-icon"
        />
        TravelLog
      </span>
      <nav className="navbar navbar-expand-lg navbar-light bg-light d-none d-lg-block">
        <div className="container-fluid">
          <span className="navbar-brand middle-title">
            <img
              src="https://static.vecteezy.com/system/resources/previews/025/165/901/original/coconut-tree-transparent-background-free-png.png"
              alt="Coconuttree"
              className="coconut-icon"
            />
            TravelLog
          </span>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/your-posts">
                  Your Posts
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/saved">
                  Saved
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/notifications">
                Connection Requests
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/settings">
                  Settings
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''} d-lg-none`}>
        <div className="hamburger d-lg-none" onClick={toggleSidebar}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
        <ul className="sidebar-links">
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/your-posts">Your Posts</Link>
          </li>
          <li>
            <Link to="/saved">Saved</Link>
          </li>
          <li>
            <Link to="/notifications">Connection Requests</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/login-page" onClick={() => localStorage.removeItem('isLoggedIn')}>
              Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="container main-content">
        <h2>Recent Posts</h2>
        {posts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img
                  src={post.profilePic !== '' ? post.profilePic : 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="profile-pic"
                />
                <h3 className="post-title">{post.title}</h3>
              </div>
              <p className="post-description">{post.description}</p>
              {post.locationLink && <img src={post.locationLink} alt="location" className="post-media" />}
              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>👍 ({post.likes})</button>
                <button onClick={() => handleShowComments(post.id)}>💬 ({post.comments.length})</button>
                <button
                      onClick={() => handleConnectionRequest(post.email)} 
                      disabled={sentRequests.includes(post.email) || post.email === user.email ||user.connections.includes(post.email)  }>
                      {user.email === post.email 
                      ? "Your post" 
                      : (user.connections.includes(post.email) 
                      ? 'Chat' 
                      : (user.sentConnections.includes(post.email) ? 'Request Sent' : '🤝'))}
                </button>


              </div>
              {activePostId === post.id && (
                <div className="comments-section">
                  <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment"
                  />
                  <button onClick={() => handleAddComment(post.id)}>Post Comment</button>
                  <div className="comments-list">
                    {post.comments.map((comment, index) => (
                      <p key={index} className="comment">
                        {comment}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

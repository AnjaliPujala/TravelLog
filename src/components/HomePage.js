import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HomePage.css';
import { db } from '../firebase/FirebaseInitializer';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

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
        comments: [], // Default if missing
        likes: 0, // Default if missing
        ...doc.data(),
      }));
      setPosts(postsData || []); // Ensure posts is always an array
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // Fallback
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
      const postToUpdate = posts.find((post) => post.id === id);
  
      // Check if user's email is already in the likes array
      if (!postToUpdate.likes.includes(user.email)) {
        const updatedLikes = [...postToUpdate.likes, user.email];
  
        // Update the post in state with the new likes array
        const updatedPosts = posts.map((post) =>
          post.id === id ? { ...post, likes: updatedLikes } : post
        );
        setPosts(updatedPosts);
  
        const postRef = doc(db, 'user-posts', id);
        try {
          // Update the Firestore document with the new likes array
          await updateDoc(postRef, {
            likes: updatedLikes,
          });
        } catch (e) {
          console.error('Error updating document: ', e);
        }
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
        const updatedComments = [...(post.comments || []), newComment]; // Ensure comments is an array
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);

    const postRef = doc(db, 'user-posts', postId);
    try {
      await updateDoc(postRef, {
        comments: updatedPosts.find((post) => post.id === postId).comments,
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
  }, [navigate]);

  

const handleConnectionRequest = async (receiverName, receiverEmail) => {
    if (sentRequests && sentRequests.includes(receiverEmail)) return; // Check for array
    const updatedUser = {
        ...user,
        sentConnections: [...user.sentConnections, { email: receiverEmail, name: receiverName }]
    };
    setUser(updatedUser);

    
    setSentRequests((prevRequests) => {
        if (!Array.isArray(prevRequests)) return [receiverEmail];  // Fallback if undefined
        return [...prevRequests, receiverEmail];
    });

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
            sentConnections: [...newSentConnections, { email: receiverEmail, name: receiverName }],
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
        const emailData = {
            subject: "Request from new User",
            email:receiverEmail,
            message: `Hello ${receiverName},\nA new Connection request from ${user.name}\nBest Regards,\nTravelLog.`,
        };

        try {
          await emailjs.send(
            'service_npgj14s',
            'template_5671qrw',
            emailData,
            'SV0XPhI3tDyRALbSk'
          );
          await updateDoc(recipientDocRef, {
            requests: [...newRequests, { senderEmail: user.email, senderName: user.name }],
        });
            alert(`Connection request send to ${receiverEmail}`);
        } catch (error) {
            console.log('Error sending email:', error);
        }

       

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
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand middle-title">
            <img
              src="https://static.vecteezy.com/system/resources/previews/025/165/901/original/coconut-tree-transparent-background-free-png.png"
              alt="Coconut tree"
              className="coconut-icon"
            />
            TravelLog
          </span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/your-posts">
                  Your Posts
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/connections">
                  Connections
                </Link>
              </li>
              <li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/notifications">
                  Connection Requests
                </Link>
              </li>
              {/*<li className="nav-item bg-primary mx-2">
                <Link className="nav-link" to="/settings">
                  Settings
                </Link>
              </li>*/}
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
            <Link to="/connections">Connections</Link>
          </li>
          <li>
            <Link to="/notifications">Connection Requests</Link>
          </li>
          {/*<li>
            <Link to="/settings">Settings</Link>
          </li>*/}
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
              <div>
                {post.name && <p className="username">{post.name}</p>}
                <img
                  src={'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/626fd8140423801.6241b91e24d9c.png'}
                  alt="Profile"
                  className="profile-pic"
                />
              </div>
                
                <h3 className="post-title">{post.title}</h3>
              </div>
              <p className="post-description">{post.description}</p>
              {post.locationLink && <img src={post.locationLink} alt="location" className="post-media" />}
              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>👍 ({post.likes.length})</button>
                <button onClick={() => handleShowComments(post.id)}>💬 ({post.comments.length})</button>
                <button
                      onClick={() => handleConnectionRequest(post.name,post.email)} 
                      disabled={sentRequests.includes(post.email) || post.email === user.email ||user.connections.includes(post.email)  }>
                      {user.email === post.email 
                      ? "Your post" 
                      : (user.connections.some(connection => 
                        connection.email === post.email && connection.name === post.name
                      )
                      ? 'Connection🤗' 
                      : (user.sentConnections.some(connection => 
                        connection.email === post.email && connection.name === post.name
                      ) ? 'Request Sent' : '🤝'))}
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

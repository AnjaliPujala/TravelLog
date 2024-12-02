import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/FirebaseInitializer';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import '../../styles/YourPostsPage.css';
import { useNavigate } from 'react-router-dom';

export default function YourPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState('');
  const navigate=useNavigate();
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    locationLink: '',
  });
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState(null); 

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    console.log(userData);
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPosts = async () => {
        const ref = collection(db, 'user-posts');
        const postsCollection = query(ref, where('email', '==', user.email));
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
        setLoading(false);
      };

      fetchPosts();
    }
  }, [user]);

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

 
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setNewPost({
      title: '',
      description: '',
      locationLink: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value,
    });
  };

  const handleAddPost = async () => {
    if (newPost.locationLink) {
      const postData = {
        email: user.email,
        profilePic: user.photoURL,
        title: newPost.title,
        description: newPost.description,
        locationLink: newPost.locationLink,
        likes: 0,
        comments: [],
        shares: 0,
      };

      try {
        const docRef = await addDoc(collection(db, 'user-posts'), postData);
        setPosts([{ id: docRef.id, ...postData }, ...posts]);
        handleModalToggle();
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    } else {
      alert('Please paste a Google link!');
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

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="your-posts-container">
      <div className="header">
        <h2>Your Posts</h2>
        <button className="add-post-btn" onClick={handleModalToggle}>
          +
        </button>
        <button className='back-to-home' onClick={(e)=>navigate(-1)}>Back</button>
      </div>

      {posts.length === 0 ? <div><h3>No posts yet</h3></div>:<div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img src={post.profilePic!==""? post.profilePic : 'https://via.placeholder.com/150'} alt="Profile" className="profile-pic" />
              <h3 className="post-title">{post.title}</h3>
            </div>
            <p className="post-description">{post.description}</p>
            {post.locationLink && (
              <img src={post.locationLink} alt="location" className="post-media" />
            )}
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}>
                👍 ({post.likes})
              </button>
              <button onClick={() => handleShowComments(post.id)}>
                💬 ({post.comments.length})
              </button>
             
            </div>

      
            {activePostId === post.id && (
              <div className="comments-section">
                <div className="comments-list">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <p>{comment}</p>
                    </div>
                  ))}
                </div>
                <div className="add-comment">
                  <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment"
                  ></textarea>
                  <button onClick={() => handleAddComment(post.id)}>Add Comment</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      };

      {/* Modal for adding a post */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={handleModalToggle}>
              &times;
            </span>
            <h2>Create a New Post</h2>
            <div>
              <input
                type="text"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                placeholder="Title"
              />
            </div>
            <div>
              <textarea
                name="description"
                value={newPost.description}
                onChange={handleInputChange}
                placeholder="Description"
              ></textarea>
            </div>
            <div>
              <input
                type="text"
                name="locationLink"
                value={newPost.locationLink}
                onChange={handleInputChange}
                placeholder="Paste Google Location Link"
              />
            </div>
            <button onClick={handleAddPost}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

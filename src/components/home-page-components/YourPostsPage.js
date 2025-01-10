import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/FirebaseInitializer';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import '../../styles/YourPostsPage.css';
import { useNavigate } from 'react-router-dom';

export default function YourPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState('');
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    locationLink: '',
  });
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));

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
    if (newPost.description === '' || newPost.description.length > 1000) {
      alert('Description length should be within 10 to 1000 characters');
      return;
    }
    if (newPost.locationLink) {
      const postData = {
        email: user.email,
        name: user.name,
        profilePic: user.photoURL,
        title: newPost.title,
        description: newPost.description,
        locationLink: newPost.locationLink,
        likes: [],
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

  const handleRemovePost = async (postId) => {
    try {
      const postRef = doc(db, 'user-posts', postId);
      await deleteDoc(postRef);

      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error removing post: ', error);
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
        <button className='back-to-home' onClick={(e) => navigate(-1)}>Back</button>
      </div>

      {posts.length === 0 ? <div><h3>No posts yet</h3></div> : <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img src={'https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/zekn8v1idkfqfrlttdpx'} alt="Profile" className="profile-pic" />
              <h3 className="post-title">{post.title}</h3>
            </div>
            <p className="post-description">{post.description}</p>
            {post.locationLink && (
              <img src={post.locationLink} alt="location" className="post-media" />
            )}
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}>
                👍 ({post.likes.length})
              </button>
              <button onClick={() => handleShowComments(post.id)}>
                💬 ({post.comments.length})
              </button>
              <button onClick={() => handleRemovePost(post.id)}>Delete Post</button>
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
      </div>}

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
                width="70%"
                className="textarea-wide"
                value={newPost.description}
                onChange={handleInputChange}
                placeholder="Share your experience"
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

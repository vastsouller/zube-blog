import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadPosts from '../utils/getPosts';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack'

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts.then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div className="post-list">
      <ScrollStack>
        {posts.map((post) => (
          <ScrollStackItem key={post.slug}>
            <h3>
              <Link to={`/post/${post.slug}`}>{post.title}</Link>
            </h3>
            {post.date && <p className="post-date">{post.date}</p>}
            {post.excerpt && <p>{post.excerpt}</p>}
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
};

export default PostList;
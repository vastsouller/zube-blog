import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';
import { loadFile } from '../utils/getPosts';

const PostDetail = () => {
  const { slug } = useParams();
  const [file, setFile] = useState(null)

  useEffect(() => {
    getFile(slug);
  }, [slug]);

  const getFile = async (slug) => {
    const post = await loadFile(`${slug}.md`);
    setFile(post);
  };

  if (!file) {
    return <div>文章未找到</div>;
  }

  return (
    <div className="post-detail">
      <h1>{file.title}</h1>
      {file.date && <p className="post-date">{file.date}</p>}
      <MarkdownRenderer content={file.content} />
    </div>
  );
};

export default PostDetail;
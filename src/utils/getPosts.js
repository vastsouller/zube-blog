const postFilePaths = require.context('../../public/posts', false, /\.md$/).keys();

const loadPosts = async () => {
  const posts = [];

  for (const filePath of postFilePaths) {
    try {
      // 去掉开头的"./"
      const path = filePath.substring(2);
      const response = await fetch(process.env.PUBLIC_URL + '/posts/' + path);
      const content = await response.text();

      // 提取元数据
      const metadata = extractMetadata(content);

      posts.push({
        ...metadata,
        slug: path.replace('.md', ''),
        content: content
      });
    } catch (error) {
      console.error(`Error loading post ${filePath}:`, error);
    }
  }

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const loadFile = async (slug) => {
  const filePath = `./${slug}`;
  try {
    // 去掉开头的"./"
    const path = filePath.substring(2);
    const response = await fetch(process.env.PUBLIC_URL + '/posts/' + path);
    const content = await response.text();

    // 提取元数据
    const metadata = extractMetadata(content);

    return {
      ...metadata,
      slug: path.replace('.md', ''),
      content: content
    };
  } catch (error) {
    console.error(`Error loading post ${filePath}:`, error);
    return null
  }
};

// 提取元数据的辅助函数保持不变
function extractMetadata(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const metadata = {};

  yaml.split('\n').forEach((line) => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      metadata[key] = value;
    }
  });

  return metadata;
}

export default loadPosts();
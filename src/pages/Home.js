import PostList from '../components/PostList';

const Home = () => {
  return (
    <div className="home" style={styles.container}>
      <header style={styles.header}>
        <span>Welcome to Zubeneschamali's Blog</span>
      </header>
      <main style={styles.main}>
        <PostList />
      </main>
    </div>
  );
};

const styles = {
  container: {
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    lineHeight: 1.6,
  },
  header: {
    with: '100%',
    height: '300px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#2c3e50',
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    fontWeight: 300,
  },
  main: {
  }
};

export default Home;
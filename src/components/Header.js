import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav>
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/about">关于</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
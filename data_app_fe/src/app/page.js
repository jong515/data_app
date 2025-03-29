// pages/index.js
import Link from 'next/link';

const Home = () => {
    return (
        <div>
            <h1>AI-powered Data Application</h1>
            <Link href="pages/upload">
                Go to Upload Page
            </Link>
        </div>
    );
};

export default Home;

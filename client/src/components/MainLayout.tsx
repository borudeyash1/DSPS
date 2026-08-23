import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <>
            <Navbar />
            {/* Add padding-top to account for fixed navbar height (approx 100px) */}
            <div className="pt-24 min-h-screen">
                <Outlet />
            </div>
            <Footer />
        </>
    );
};

export default MainLayout;

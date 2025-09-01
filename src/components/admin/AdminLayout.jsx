import React, { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Admin.css'; // Import the CSS file

const AdminLayout = () => {
    useEffect(() => {
        // Add a class to the body element when the component mounts
        document.body.classList.add('admin-page-active');

        // Remove the class when the component unmounts
        return () => {
            document.body.classList.remove('admin-page-active');
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    return (
        <div className="admin-layout">
            <nav className="admin-nav">
                <h2 className="admin-nav-title">관리자 메뉴</h2>
                <ul>
                    <li><Link to="/">메인 페이지로</Link></li>
                    <li><Link to="/admin">대시보드</Link></li>
                    <li><Link to="/admin/users">사용자 관리</Link></li>
                    <li><Link to="/admin/posts">게시글 관리</Link></li>
                </ul>
            </nav>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
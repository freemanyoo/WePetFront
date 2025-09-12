import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Container, Card, Table, Button, Pagination, Spinner, Alert } from 'react-bootstrap';
import './UserManagementPage.css';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchUsers = async (currentPage) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/users', {
                params: {
                    page: currentPage,
                    size: 15,
                }
            });
            setUsers(response.data.data.content);
            setTotalPages(response.data.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('사용자 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchUsers(page);
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole, page]);

    const handleDelete = async (userId) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까? 게시물과 댓글도 함께 삭제됩니다.')) {
            try {
                await axiosInstance.delete(`/admin/users/${userId}`);
                alert('사용자가 성공적으로 삭제되었습니다.');
                fetchUsers(page);
            } catch (err) {
                console.error('Failed to delete user:', err);
                alert(`사용자 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <div className="user-management-page">
            <Container fluid>
                <h1 className="page-title">사용자 관리</h1>
                <Card className="table-card">
                    <Card.Body>
                        {users.length === 0 ? (
                            <p>등록된 사용자가 없습니다.</p>
                        ) : (
                            <Table striped bordered hover responsive className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>로그인 ID</th>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>역할</th>
                                        <th>액션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.userId}>
                                            <td>{user.userId}</td>
                                            <td>{user.loginId}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(user.userId)}>
                                                    삭제
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <Pagination>
                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                            {[...Array(totalPages).keys()].map(p => (
                                <Pagination.Item key={p} active={p === page} onClick={() => handlePageChange(p)}>
                                    {p + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} />
                        </Pagination>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default UserManagementPage;
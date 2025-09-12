
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './AdminDashboardPage.css';

// Assumed data structure from the API endpoint /admin/stats/dashboard
// {
//   "success": true,
//   "data": {
//     "totalPosts": number,
//     "missingPosts": number,
//     "shelterPosts": number,
//     "completedPosts": number,
//     "todayPosts": number,
//     "totalUsers": number,
//     "todayUsers": number,
//     "dailyPosts": [{ "date": "YYYY-MM-DD", "count": number }],
//     "recentCompletions": [{ "postId": number, "title": "string", "completedAt": "datetime" }]
//   }
// }

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/admin/stats/dashboard');
                setStats(response.data.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('대시보드 통계를 불러오는 데 실패했습니다. API가 실행 중인지 확인해주세요.');
            } finally {
                setLoading(false);
            }
        };

        if (userRole === 'ADMIN') {
            fetchStats();
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">오류: {error}</Alert>
            </Container>
        );
    }

    const postTypeData = [
        { name: '실종', count: stats?.missingPosts || 0 },
        { name: '보호', count: stats?.shelterPosts || 0 },
        { name: '완료', count: stats?.completedPosts || 0 },
    ];

    const dailyPostData = stats?.dailyPosts || [];

    return (
        <div className="admin-dashboard">
            <Container fluid>
                <h1 className="dashboard-title">관리자 대시보드</h1>

                {stats ? (
                    <>
                        <Row>
                            <Col md={3}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <Card.Title>총 게시글</Card.Title>
                                        <Card.Text>{stats.totalPosts}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <Card.Title>오늘 등록된 글</Card.Title>
                                        <Card.Text>{stats.todayPosts}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <Card.Title>총 사용자</Card.Title>
                                        <Card.Text>{stats.totalUsers}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <Card.Title>신규 사용자 (오늘)</Card.Title>
                                        <Card.Text>{stats.todayUsers}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <div className="chart-container">
                                    <h3>게시글 유형별 분포</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={postTypeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="chart-container">
                                    <h3>일별 게시글 등록 수</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={dailyPostData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Col>
                        </Row>

                        <div className="recent-completions">
                            <h3>최근 완료된 게시글</h3>
                            {stats.recentCompletions && stats.recentCompletions.length > 0 ? (
                                <ul className="completion-list">
                                    {stats.recentCompletions.map((completion) => (
                                        <li key={completion.postId} className="completion-item">
                                            {completion.title} (완료일: {new Date(completion.completedAt).toLocaleDateString()})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>최근 완료된 게시글이 없습니다.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <Alert variant="info">통계 정보를 불러올 수 없습니다. 백엔드 API가 실행되고 있는지 확인해주세요.</Alert>
                )}
            </Container>
        </div>
    );
};

export default AdminDashboardPage;

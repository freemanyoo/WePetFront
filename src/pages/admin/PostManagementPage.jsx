import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Container, Card, Table, Button, Pagination, Modal, Spinner, Alert, ListGroup } from 'react-bootstrap';
import './PostManagementPage.css';

const PostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useAuth();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    const fetchPosts = async (currentPage) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/posts', {
                params: { page: currentPage, size: 10 }
            });
            setPosts(response.data.data.content);
            setTotalPages(response.data.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('게시글 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchPosts(page);
        } else {
            setError('관리자 권한이 필요합니다.');
            setLoading(false);
        }
    }, [userRole, page]);

    const handleDeletePost = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/admin/posts/${postId}`);
                alert('게시글이 성공적으로 삭제되었습니다.');
                fetchPosts(page);
                if (showDetailModal) setShowDetailModal(false);
            } catch (err) {
                console.error('Failed to delete post:', err);
                alert(`게시글 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/admin/comments/${commentId}`);
                alert('댓글이 성공적으로 삭제되었습니다.');
                const response = await axiosInstance.get(`/posts/${selectedPost.postId}`);
                setSelectedPost(response.data);
            } catch (err) {
                console.error('Failed to delete comment:', err);
                alert(`댓글 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleShowDetails = async (post) => {
        try {
            const response = await axiosInstance.get(`/posts/${post.postId}`);
            setSelectedPost(response.data);
            setShowDetailModal(true);
        } catch (err) {
            console.error('Failed to fetch post details:', err);
            alert('게시글 상세 정보를 불러오는 데 실패했습니다.');
        }
    };

    const handleShowComments = async (post) => {
        try {
            const response = await axiosInstance.get(`/posts/${post.postId}`);
            setSelectedPost(response.data);
            setShowCommentsModal(true);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            alert('댓글을 불러오는 데 실패했습니다.');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <div className="post-management-page">
            <Container fluid>
                <h1 className="page-title">게시글 관리</h1>
                <Card className="table-card">
                    <Card.Body>
                        <Table striped bordered hover responsive className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>제목</th>
                                    <th>동물 이름</th>
                                    <th>유형</th>
                                    <th>상태</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                    <th>액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.postId}>
                                        <td>{post.postId}</td>
                                        <td>{post.title}</td>
                                        <td>{post.animalName}</td>
                                        <td>{post.postType}</td>
                                        <td>{post.status}</td>
                                        <td>{post.author?.name || '알 수 없음'}</td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Button variant="info" size="sm" onClick={() => handleShowDetails(post)}>상세</Button>
                                            <Button variant="secondary" size="sm" className="ms-2" onClick={() => handleShowComments(post)}>댓글</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <Pagination>
                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                            {[...Array(totalPages).keys()].map(p => (
                                <Pagination.Item key={p} active={p === page} onClick={() => handlePageChange(p)}>{p + 1}</Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} />
                        </Pagination>
                    </div>
                )}
            </Container>

            {/* Post Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>게시글 상세</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPost && (
                        <div>
                            <h3>{selectedPost.title}</h3>
                            <p><strong>ID:</strong> {selectedPost.postId}</p>
                            <p><strong>내용:</strong> {selectedPost.content}</p>
                            <p><strong>동물 이름:</strong> {selectedPost.animalName}</p>
                            <p><strong>위치:</strong> {selectedPost.location}</p>
                            <h4>이미지</h4>
                            {selectedPost.images?.map((image, index) => (
                                <img key={index} src={`http://localhost:8080/upload/${image.imageUrl}`} alt={`Post ${index}`} className="modal-image" />
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>닫기</Button>
                    <Button variant="danger" onClick={() => handleDeletePost(selectedPost.postId)}>삭제</Button>
                </Modal.Footer>
            </Modal>

            {/* Comments Modal */}
            <Modal show={showCommentsModal} onHide={() => setShowCommentsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>댓글 관리</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPost?.comments?.length > 0 ? (
                        <ListGroup>
                            {selectedPost.comments.map(comment => (
                                <ListGroup.Item key={comment.commentId}>
                                    <p>{comment.content}</p>
                                    {comment.imageUrl && (
                                        <img src={`http://localhost:8080/upload/${comment.imageUrl}`} alt="Comment" className="modal-image" />
                                    )}
                                    <small>작성자: {comment.userName}</small>
                                    <Button variant="outline-danger" size="sm" className="float-end" onClick={() => handleDeleteComment(comment.commentId)}>삭제</Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p>댓글이 없습니다.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCommentsModal(false)}>닫기</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PostManagementPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, deletePost, completePost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import CommentComponent from '../../components/comment/CommentComponent';
import KakaoMap from '../../components/location/KakaoMap';
import './PostDetailPage.css';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPost = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPostById(postId);
            setPost(response.data);
        } catch (err) {
            setError("게시글을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await deletePost(postId);
                alert('게시글이 삭제되었습니다.');
                navigate(`/board/${post.postType.toLowerCase()}`);
            } catch (err) {
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    const handleComplete = async () => {
        if (window.confirm('이 게시글을 "찾기 완료" 상태로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                await completePost(postId);
                alert('"찾기 완료" 처리되었습니다.');
                fetchPost();
            } catch (err) {
                alert('상태 변경에 실패했습니다.');
            }
        }
    };

    if (loading) return <div>게시글을 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!post) return <div>해당 게시글이 없습니다.</div>;

    const isAuthor = isLoggedIn && user?.userId === post.author.userId;
    const fullImageUrls = post.imageUrls?.map(url => `http://localhost:8080/upload/${url}`) || [];

    // ❗ JSX 렌더링 부분에서 직접 상태 텍스트와 클래스를 결정합니다. (별도 함수 없이)
    const isCompleted = post.status === 'COMPLETED';

    // ❗❗ 바로 이 부분에서 텍스트를 결정합니다 ❗❗
    const statusText = isCompleted
        ? (post.postType === 'MISSING' ? '찾았어요!' : '가족 찾음!') // status가 COMPLETED일 때의 로직
        : (post.postType === 'MISSING' ? '찾는 중' : '보호 중');   // status가 ACTIVE일 때의 로직

    const statusClassName = isCompleted ? 'status-completed' : 'status-active';

    return (
        <section className="board-section">

            <div className="post-detail">
                <div className="post-detail-header">
                    <div className={`status-badge ${statusClassName}`}>
                        {statusText}
                    </div>
                    <h2 className="post-detail-title">{post.title}</h2>
                    <div className="post-detail-meta">
                        <span><i className="fas fa-user"></i> {post.author.name}</span>
                        <span><i className="fas fa-clock"></i> {new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    {isAuthor && (
                        <div className="post-actions">
                            {!isCompleted && (
                                <>
                                    <Link to={`/posts/${postId}/edit`} className="btn btn-outline">수정</Link>
                                    <button onClick={handleDelete} className="btn btn-danger">삭제</button>
                                    <button onClick={handleComplete} className="btn btn-success">찾기 완료</button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ❗❗❗ [사라졌던 부분 복구] ❗❗❗ */}
                <div className="post-detail-content">
                    <div className="post-image-gallery">
                        {fullImageUrls.map((fullUrl, index) => (
                            <img key={index} src={fullUrl} alt={`post image ${index}`} className="gallery-image" />
                        ))}
                    </div>

                    <div className="animal-detail-info">
                        <h3>동물 정보</h3>
                        <div className="info-grid">
                            <div className="info-item"><span className="info-label">이름</span><span className="info-value">{post.animalName || '-'}</span></div>
                            <div className="info-item"><span className="info-label">나이</span><span className="info-value">{post.animalAge ? `${post.animalAge}세` : '-'}</span></div>
                            <div className="info-item"><span className="info-label">동물 종류</span><span className="info-value">{post.animalCategory || '-'}</span></div>
                            <div className="info-item"><span className="info-label">품종</span><span className="info-value">{post.animalBreed || '-'}</span></div>
                            <div className="info-item"><span className="info-label">성별</span><span className="info-value">{post.gender || '-'}</span></div>
                            <div className="info-item"><span className="info-label">{post.postType === 'MISSING' ? '실종 일시' : '발견 일시'}</span><span className="info-value">{post.lostTime ? new Date(post.lostTime).toLocaleString() : '-'}</span></div>
                            <div className="info-item info-item--full-width"><span className="info-label">{post.postType === 'MISSING' ? '실종 장소' : '발견 장소'}</span><span className="info-value">{post.location || '-'}</span></div>
                        </div>
                    </div>

                    <div className="map-container">
                        <h3>{post.postType === 'MISSING' ? '실종 추정 위치' : '발견 위치'}</h3>
                        <KakaoMap
                            initialLocation={{ latitude: post.latitude, longitude: post.longitude }}
                            isSelectable={false}
                        />
                    </div>

                    <div className="post-main-content">
                        <p>{post.content}</p>
                    </div>
                </div>
                {/* ❗❗❗ [복구 끝] ❗❗❗ */}

                <CommentComponent postId={postId} isPostCompleted={isCompleted} />
            </div>
        </section>
    );
};

export default PostDetailPage;
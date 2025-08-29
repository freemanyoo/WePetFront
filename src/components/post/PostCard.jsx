import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
    const isCompleted = post.status === 'COMPLETED';
    const typeText = post.postType === 'MISSING' ? '실종' : '보호';
    const thumbnailUrl = post.thumbnailUrl
        ? `http://localhost:8080/upload/${post.thumbnailUrl}`
        : null;

    const getStatusBadge = () => {
        if (isCompleted) {
            return <div className="status-badge status-completed">가족 찾음!</div>;
        }
        return <div className="status-badge status-active">{post.postType === 'MISSING' ? '찾는 중' : '보호 중'}</div>;
    };

    // 추가: 날짜, 성별, 품종, 지역 정보를 변수로 준비
    const lostDate = post.lostTime ? new Date(post.lostTime).toLocaleDateString() : '날짜 미상';
    const genderText = post.gender === 'MALE' ? '수컷' : post.gender === 'FEMALE' ? '암컷' : '성별 모름';
    const breedText = post.animalBreed || '품종 모름';
    const locationText = post.location || '지역 정보 없음';


    return (
        <Link to={`/posts/${post.postId}`} className="post-card">
            <div className="post-image" style={{ backgroundImage: `url(${thumbnailUrl})`, backgroundColor: '#e0e0e0' }}>
                {!thumbnailUrl && <i className="fas fa-image"></i>}
                {getStatusBadge()}
            </div>
            <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                    <div className="animal-info">
                        <strong>{post.animalName || '이름 모름'}</strong>
                        <span>{typeText} · {post.author.name}</span>
                    </div>
                </div>
                {/* 추가된 정보 필드 */}
                <div className="post-details">
                    <p>
                        <i className="fas fa-calendar-alt"></i>&nbsp;
                        **날짜:** {lostDate}
                    </p>
                    <p>
                        <i className="fas fa-map-marker-alt"></i>&nbsp;
                        **지역:** {locationText}
                    </p>
                    <p>
                        <i className="fas fa-paw"></i>&nbsp;
                        **품종:** {breedText}
                    </p>
                    <p>
                        <i className="fas fa-venus-mars"></i>&nbsp;
                        **성별:** {genderText}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
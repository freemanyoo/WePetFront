import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPosts } from '../../api/postApi';
import PostCard from '../../components/post/PostCard';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import SearchFilterBox from '../../components/board/SearchFilterBox'; // 1. 검색 필터 박스 import

const BoardPage = () => {
    const { type } = useParams();
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pageInfo, setPageInfo] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    // 2. 검색 조건을 관리할 상태
    const [searchCriteria, setSearchCriteria] = useState({});

    const boardTitle = type === 'missing' ? '실종 동물 게시판' : '보호 동물 게시판';
    const boardIcon = type === 'missing' ? 'fas fa-search' : 'fas fa-heart';

    // 3. 검색 버튼을 눌렀을 때 실행될 함수
    const handleSearch = (criteria) => {
        setSearchCriteria(criteria);
        setPageInfo(prev => ({ ...prev, currentPage: 1 })); // 검색 시에는 항상 1페이지부터 조회
    };

    // 4. 페이지 번호를 클릭했을 때 실행될 함수
    const handlePageChange = (newPage) => {
        setPageInfo(prev => ({ ...prev, currentPage: newPage }));
    };

    // 5. API를 호출하는 핵심 로직
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!type) {
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    // 이름(Key) 변환
                    title: searchCriteria.title,
                    animalName: searchCriteria.author,
                    location: searchCriteria.location,
                    animalCategory: searchCriteria.animalType,
                    animalBreed: searchCriteria.breed,

                    // ✅ [핵심 수정] 날짜 형식에 시간 정보를 추가합니다.
                    lostTimeFrom: searchCriteria.lostDateFrom ? `${searchCriteria.lostDateFrom}T00:00:00` : null,
                    lostTimeTo: searchCriteria.lostDateTo ? `${searchCriteria.lostDateTo}T23:59:59` : null,

                    // 값(Value) 변환
                    status: searchCriteria.isFound === true ? 'COMPLETED' :
                        searchCriteria.isFound === false ? 'ACTIVE' : null,

                    // 기존 페이징 및 타입 파라미터
                    postType: (type || '').toUpperCase(),
                    page: pageInfo.currentPage - 1,
                    size: 9
                };

                // 내용이 없는 파라미터는 API 요청 URL에서 제외합니다.
                Object.keys(params).forEach(key => {
                    if (params[key] === null || params[key] === undefined || params[key] === '') {
                        delete params[key];
                    }
                });

                const response = await getPosts(params);

                setPosts(response.data.dtoList);
                setPageInfo({
                    currentPage: response.data.page,
                    totalPages: Math.ceil(response.data.total / response.data.size)
                });

            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [type, pageInfo.currentPage, searchCriteria]);

    return (
        <section className="board-section">
            <div className="board-header">
                <h2 className="board-title">
                    <i className={boardIcon}></i> {boardTitle}
                </h2>
                <div className="board-controls">
                    {/* 상세 검색 페이지 링크는 이제 필요 없으므로 주석 처리하거나 삭제 가능 */}
                    {/* <Link to="/find-pets" className="btn btn-secondary">
                        <i className="fas fa-search-plus"></i> 상세 검색하기
                    </Link> */}
                    {isLoggedIn && (
                        <Link to={`/posts/new?type=${type}`} className="btn btn-primary">
                            <i className="fas fa-plus"></i> 글쓰기
                        </Link>
                    )}
                </div>
            </div>

            {/* 6. 검색 필터 박스 컴포넌트 렌더링 */}
            <SearchFilterBox onSearch={handleSearch} />

            {loading && <div>로딩 중...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {!loading && !error && (
                <>
                    <div className="posts-grid">
                        {posts.length > 0 ? (
                            posts.map(post => <PostCard key={post.postId} post={post} />)
                        ) : (
                            <p>조건에 맞는 게시글이 없습니다.</p>
                        )}
                    </div>

                    <Pagination
                        currentPage={pageInfo.currentPage}
                        totalPages={pageInfo.totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </section>
    );
};

export default BoardPage;
import React, { useState, useEffect } from 'react';
import './SearchFilterBox.css';
// ✅ 1. fetch 대신 중앙 관리되는 API 함수를 import 합니다.
import { getFilterOptions, getBreedsByCategory } from '../../api/filterApi';

const SearchFilterBox = ({ onSearch, onFilterChange }) => {
    const [searchCriteria, setSearchCriteria] = useState({
        title: '', author: '', lostDateFrom: '', lostDateTo: '',
        location: '', animalType: '', breed: '', gender: '', isFound: null
    });

    const [filterOptions, setFilterOptions] = useState({
        animalTypes: [], genders: [], breeds: []
    });

    // ✅ 2. 옵션 로딩 에러를 관리할 상태를 추가합니다.
    const [optionsError, setOptionsError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const loadFilterOptions = async () => {
            setOptionsError(null); // 초기화
            try {
                // ✅ 3. 중앙 API 함수를 사용합니다.
                const resp = await getFilterOptions();
                const data = resp.data; // axios는 자동으로 json을 파싱하고 .data에 담아줍니다.

                const animalCategories = data.animalCategories || data.animalTypes || [];
                const normalizedTypes = animalCategories.map((t) =>
                    typeof t === 'string' ? { value: t, label: t } : t
                );
                setFilterOptions(prev => ({
                    ...prev,
                    animalTypes: normalizedTypes,
                    genders: data.genders || [],
                }));
            } catch (e) {
                console.error('필터 옵션 로드 실패:', e);
                // ✅ 4. 에러 발생 시 사용자에게 보여줄 메시지를 설정합니다.
                setOptionsError('필터 옵션을 불러오는 데 실패했습니다.');
            }
        };
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (searchCriteria.animalType) {
            const loadBreeds = async (animalType) => {
                try {
                    // ✅ 5. 중앙 API 함수를 사용합니다.
                    const resp = await getBreedsByCategory(animalType);
                    setFilterOptions(prev => ({ ...prev, breeds: resp.data || [] }));
                } catch (e) {
                    console.error('품종 목록 로드 실패:', e);
                    setFilterOptions(prev => ({ ...prev, breeds: [] }));
                }
            };
            loadBreeds(searchCriteria.animalType);
            setSearchCriteria(prev => ({ ...prev, breed: '' }));
        }
    }, [searchCriteria.animalType]);

    const handleInputChange = (field, value) => {
        const newCriteria = { ...searchCriteria, [field]: value };
        setSearchCriteria(newCriteria);
        onFilterChange && onFilterChange(newCriteria);
    };

    const handleSearch = () => {
        onSearch && onSearch(searchCriteria);
    };

    const handleReset = () => {
        const resetCriteria = {
            title: '', author: '', lostDateFrom: '', lostDateTo: '',
            location: '', animalType: '', breed: '', gender: '', isFound: null
        };
        setSearchCriteria(resetCriteria);
        onFilterChange && onFilterChange(resetCriteria);
        onSearch && onSearch(resetCriteria);
    };

    const toggleFoundStatus = (status) => {
        const newStatus = searchCriteria.isFound === status ? null : status;
        handleInputChange('isFound', newStatus);
    };

    return (
        <div className="search-filter-container">
            {/* ... (상단 검색창 부분은 동일) ... */}
            <div className="search-main-row">
                <div className="search-input-group">
                    <input
                        type="text"
                        placeholder="제목으로 검색..."
                        value={searchCriteria.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="text"
                        placeholder="작성자로 검색..."
                        value={searchCriteria.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="search-buttons">
                    <button className="btn btn-filter" onClick={() => setIsExpanded(!isExpanded)}>
                        <span className="filter-icon">⚙</span>
                        필터 {isExpanded ? '접기' : '펼치기'}
                    </button>
                    <button className="btn btn-search" onClick={handleSearch}>
                        <span className="search-icon">🔍</span>
                        검색
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="filter-expanded-section">
                    {/* ✅ 6. 에러 발생 시 메시지를 보여줍니다. */}
                    {optionsError && <div className="error-message" style={{gridColumn: '1 / -1'}}>{optionsError}</div>}

                    {/* ... (나머지 필터 UI 부분은 동일) ... */}
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>분실날짜</label>
                            <div className="date-range">
                                <input type="date" value={searchCriteria.lostDateFrom} onChange={(e) => handleInputChange('lostDateFrom', e.target.value)} className="date-input" />
                                <span className="date-separator">~</span>
                                <input type="date" value={searchCriteria.lostDateTo} onChange={(e) => handleInputChange('lostDateTo', e.target.value)} className="date-input" />
                            </div>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group" style={{ flexGrow: 1 }}>
                            <label>분실지역 검색</label>
                            <input
                                type="text"
                                placeholder="지역 키워드 입력 (예: 부산진구)"
                                value={searchCriteria.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>축종</label>
                            <select value={searchCriteria.animalType} onChange={(e) => handleInputChange('animalType', e.target.value)} className="select-input">
                                <option value="">전체</option>
                                {filterOptions.animalTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>품종</label>
                            <select value={searchCriteria.breed} onChange={(e) => handleInputChange('breed', e.target.value)} className="select-input" disabled={!searchCriteria.animalType}>
                                <option value="">전체</option>
                                {filterOptions.breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>성별</label>
                            <select value={searchCriteria.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="select-input">
                                <option value="">전체</option>
                                {filterOptions.genders.map((gender) => <option key={gender.value} value={gender.value}>{gender.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="status-toggle-group">
                            <label>상태</label>
                            <div className="toggle-buttons">
                                <button className={`toggle-btn ${searchCriteria.isFound === null ? 'active' : ''}`} onClick={() => toggleFoundStatus(null)}>전체</button>
                                <button className={`toggle-btn ${searchCriteria.isFound === false ? 'active' : ''}`} onClick={() => toggleFoundStatus(false)}>찾는중</button>
                                <button className={`toggle-btn ${searchCriteria.isFound === true ? 'active' : ''}`} onClick={() => toggleFoundStatus(true)}>찾기완료</button>
                            </div>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-reset" onClick={handleReset}>초기화</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilterBox;
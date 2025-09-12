// src/api/filterApi.js

import axiosInstance from './axiosInstance';

/**
 * 검색 필터 옵션(축종, 성별 등)을 조회하는 API
 */
export const getFilterOptions = () => {
    // ✅ 수정: '/api'를 제거하고 그 뒷부분부터 작성합니다.
    return axiosInstance.get('/find-pets/filter-options');
};

/**
 * 특정 축종에 해당하는 품종 목록을 조회하는 API
 * @param {string} animalCategory - 축종 (예: '개')
 */
export const getBreedsByCategory = (animalCategory) => {
    // ✅ 수정: '/api'를 제거하고 그 뒷부분부터 작성합니다.
    return axiosInstance.get(`/find-pets/breeds`, {
        params: { animalCategory }
    });
};
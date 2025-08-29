// **
// * 게시글의 postType과 status를 기반으로 화면에 표시할 텍스트와 CSS 클래스를 반환합니다.
// * @param {string} postType - "MISSING" 또는 "SHELTER"
// * @param {string} status - "ACTIVE" 또는 "COMPLETED"
// * @returns {{displayText: string, className: string}}
// */

export const getDisplayStatusInfo = (postType, status) => {
    if (status === 'COMPLETED') {
        const text = postType === 'MISSING' ? '찾았어요!' : '가족 찾음!';
        return {
            displayText: text,
            className: 'status-completed'
        };
    }

    // status가 'ACTIVE'인 경우
    const text = postType === 'MISSING' ? '찾는 중' : '보호 중';
    return {
        displayText: text,
        className: 'status-active'
    };
};
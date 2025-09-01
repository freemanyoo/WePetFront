import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

/**
 * @설명 사용자 로그인 페이지 컴포넌트
 * @기능 사용자의 로그인 ID와 비밀번호를 입력받아 백엔드 API를 통해 인증을 시도합니다.
 *       로그인 성공 시, JWT 토큰(Access Token, Refresh Token)을 로컬 스토리지에 저장하고,
 *       전역 인증 상태(AuthContext)를 업데이트하여 사용자 정보를 애플리케이션 전반에 걸쳐 사용할 수 있도록 합니다.
 *       로그인 실패 시, 사용자에게 오류 메시지를 표시합니다.
 * @주요로직
 *   - `loginId`와 `password` 상태 관리
 *   - `handleSubmit`: 폼 제출 시 백엔드 `/auth/login` API 호출
 *   - 로그인 성공 시:
 *     - `AuthContext`의 `login` 함수를 호출하여 사용자 정보 업데이트
 *     - `accessToken` 및 `refreshToken`을 `localStorage`에 저장
 *     - 메인 페이지(`/`)로 리디렉션
 *   - 로그인 실패 시: 오류 메시지 표시
 */
function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axiosInstance.post('/auth/login', { loginId, password });
      if (response.data.success) {
        console.log('Login successful:', response.data);
        const { user, accessToken, refreshToken } = response.data.data;
        login(user);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        navigate('/'); // Redirect to home page or dashboard
      } else {
        setError(response.data.error.message || '로그인 실패');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || '서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-page">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginId">아이디:</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">로그인</button>

      </form>
      <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
    </div>
  );
}

export default LoginPage;

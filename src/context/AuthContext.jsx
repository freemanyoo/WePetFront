import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    return storedLoggedIn ? JSON.parse(storedLoggedIn) : false;
  });
  const [userRole, setUserRole] = useState(() => {
    const storedUserRole = localStorage.getItem('userRole');
    return storedUserRole ? storedUserRole : null;
  });
  // Add state for user object
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  // Effect for user object
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Modify login to accept user object
  /**
   * @설명 사용자 로그인 상태 설정 및 로컬 스토리지 업데이트
   * @기능 백엔드로부터 받은 사용자 데이터(로그인 ID, 이름, 역할 등)를 기반으로
   *       애플리케이션의 전역 로그인 상태를 `true`로 설정하고,
   *       사용자 역할 및 전체 사용자 객체를 업데이트합니다.
   *       이 정보는 `localStorage`에 저장되어 페이지 새로고침 시에도 유지됩니다.
   * @파라미터 userData - 백엔드 로그인 API 응답에서 받은 사용자 정보 객체
   */
  const login = (userData) => { // userData will be the full user object from backend
    setIsLoggedIn(true);
    setUserRole(userData.role);
    setUser(userData); // Store the full user object
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null); // Clear user object
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user'); // Clear user object from localStorage
      // 추가_CKM
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      //
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

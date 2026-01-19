import { useState, useEffect } from 'react'
import axios from 'axios';
import { FaHome, FaList, FaEdit, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';

// 引入 CSS 檔案
import './assets/style.css'

// 導入頁面元件
import HomePage from './components/pages/HomePage';
import ProductListPage from './components/pages/ProductListPage';
import ProductEditPage from './components/pages/ProductEditPage';
// 選單資料配置（未來新增功能只需在繼續往下加入即可）
// import Test from './components/pages/TestPage';

// 導入日期時間元件
import { DateTimeDisplay } from './components/CalendarIcon';

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
// eslint-disable-next-line no-unused-vars
const API_PATH = import.meta.env.VITE_API_PATH; // 保留供未來使用


function App() {
  // 選單資料配置（未來新增功能只需在這裡加入）
  const menuItems = [
    {
      id: 'home',
      label: '首頁',
      icon: FaHome,
      component: HomePage,
    },
    {
      id: 'product-list',
      label: '產品列表',
      icon: FaList,
      component: ProductListPage,
    },
    {
      id: 'product-edit',
      label: '產品維護',
      icon: FaEdit,
      component: ProductEditPage,
    },
    // （未來新增功能只需在繼續往下加入即可）
    // {
    //   id: 'test',
    //   label: '產品-測試',
    //   icon: FaEdit,
    //   component: Test,
    // },
  ];

  // 當前選取的頁面 ID
  const [currentPageId, setCurrentPageId] = useState('home');

  // 控制下拉選單的顯示狀態，預設為關閉。
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 取得當前選取的頁面元件
  const CurrentPageComponent = menuItems.find(
    (item) => item.id === currentPageId
  )?.component || HomePage;

  // 儲存登入表單資料，使用 useState 儲存表單資料 
  const [formData, setFormData] = useState ({
    username: '',
    password: '',
  });
  // 使用 useState 狀態管理 登入狀態
  const [isAuth, setIsAuth] = useState(false);


  // 處理表單輸入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,     // 保留之前的資料
      [name]: value, // 更新指定的欄位
    }));
  };


  // 處理表單提交
  const onSubmit = async (e) => {
    e.preventDefault(); // 防止表單預設行為，如表單提交後，頁面重新整理。
    try {
      // 發送登入請求，並取得 token。
      const response = await axios.post(`${API_BASE}/admin/signin`, formData); 
      const { token, expired} = response.data;
      // console.log('登入成功', response.data);
      // 儲存 token 到 Cookie。
      document.cookie = `hexToken=${token}; expires=${new Date(expired)};`;
      

      // 設定 axios 的 default headers，並設置 token。
      axios.defaults.headers.common.Authorization = `${token}`;

      // 設定登入狀態為 true
      setIsAuth(true);

    } catch (error) {
      setIsAuth(false); // 登入失敗，設置登入狀態為 false
      // 使用 alert 顯示錯誤訊息
      window.alert('登入失敗，請重新確認你的帳號、密碼是否正確。');
      if (axios.isAxiosError(error) && error.response) {
        console.error('登入失敗，錯誤訊息：', error.response);
      } else {
        console.error('登入失敗，錯誤訊息：', error);
      }
    }
  };


  
  // 登入狀態檢查與權限驗證
  useEffect(() => {
    // 取得 cookie 中的 token 然後設定 axios 的 default headers，並設置 token。
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    // 如果沒有 token 的話, 明確為未登入的狀態, 不執行驗證. 
    if (!token) {
      // setIsAuth(false); // 設定登入狀態為 false
      return; // 直接返回, 不執行後面的驗證步驟. 
    } else {
      // 如果 token 存在, 則執行驗證步驟. 
      // 設定 axios 的 default headers，並設置 token。
      axios.defaults.headers.common["Authorization"] = token;
      // 設定登入狀態為 true
      // setIsAuth(true);
    }

    // 登入驗證（保留作為功能，可在需要時使用）
    const checkLogin = async () => {
      try {
          // 登入驗證請求，並取得驗證結果。
          const response = await axios.post(`${API_BASE}/api/user/check`);
          // window.alert('登入驗證成功: ' + response.data.uid);
          // console.log('登入驗證成功', response.data);
          setIsAuth(true);
      } catch (error) {
        // 驗證失敗，設定登入狀態 false
        setIsAuth(false);
        if (axios.isAxiosError(error) && error.response) {
          console.error(
            "Login verification failed 登入驗證失敗: ",
            error.response.data?.message || error.message
          );
        } else {
          console.error("Login verification failed 登入驗證失敗: ", error);
        }
      }
    };
    checkLogin();
  },[])

  // 處理登出
  const handleLogout = () => {
    // 清除 cookie 中的 token
    document.cookie = 'hexToken=; max-age=0; path=/;';
    // 清除 axios 的 Authorization header
    delete axios.defaults.headers.common["Authorization"];
    // 設定登入狀態 false
    setIsAuth(false);
    // 重置表單資料
    setFormData({
      username: '',
      password: '',
    });
  };

  return (
    <> 
      { !isAuth ? (
        // 進入 「登入表單」頁面
        <div className='container login'>
          <h2 className="mb-3 font-weight-normal">Please Login 請先登入</h2>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating">
              <input
                type="email"
                className="form-control w-100 mb-3 text-left"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
                required
                title="請輸入 EMAIL 帳號"
                autoComplete="email"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control w-100 mb-3 text-left"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
                required
                title="請輸入密碼"
                autoComplete="current-password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="w-100 mt-3 btn btn-lg btn-primary" type="submit">
              Login 登入
            </button>
          </form>
        </div>
      ) : (
        // 確認成功登入後，顯示主畫面
        <>
          {/* 導覽列 */}
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom sticky-top">
            <div className="container-fluid">
              {/* 左側區塊：Logo + 系統名稱 */}
              <div className="navbar-brand d-flex align-items-center">
                <FaShieldAlt className="me-2" size={24} />
                <div>
                  <div className="fw-bold">花的世界</div>
                  <small className="text-muted">商品管理系統</small>
                </div>
              </div>

              {/* 中間區塊：功能選單 */}
              <div className="navbar-nav mx-auto">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`nav-link btn btn-link d-flex align-items-center ${
                        currentPageId === item.id ? 'active fw-bold' : ''
                      }`}
                      onClick={() => setCurrentPageId(item.id)}
                    >
                      {IconComponent && <IconComponent className="me-1" size={18} />}
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* 右側區塊：日期時間 + 下拉選單 */}
              {/* 下拉選單 不知為什麼使用 bootstrap 的 dropdown 無法正常顯示，改用 onClick 事件來控制顯示狀態。*/}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userMenu"
                  // data-bs-toggle="dropdown"
                  // aria-expanded="false"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                >
                  <DateTimeDisplay 
                    showCalendarIcon={true}
                    className="me-2"
                  />
                </button>
                <ul 
                  // className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                  className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`} 
                  aria-labelledby="userMenu"
                  >
                  <li>
                    <button 
                      className="dropdown-item d-flex align-items-center" 
                      // onClick={() => setIsAuth(false)}
                      onClick={
                        () => {
                          handleLogout();
                          setIsDropdownOpen(false); // 登出後關閉下拉選單 
                        }
                      }
                    >
                      <FaSignOutAlt className="me-2" size={16} />
                      登出
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* 主畫面區塊 */}
          <main className="container mt-3">
            <CurrentPageComponent />
          </main>
        </>
      )}
    </>
  );
}

export default App;

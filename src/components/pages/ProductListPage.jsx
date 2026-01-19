import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(undefined);

  // 取得產品資料
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error('取得產品資料失敗', error);
    }
  };

  // 元件掛載時取得資料
  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="row container-fluid">
      <div className="col-md-6">
        <h2>產品列表</h2>
        <table className="table">
          <thead>
            <tr className="table-info">
              <th>產品名稱</th>
              <th>原價</th>
              <th>售價</th>
              <th>是否啟用</th>
              <th>查看細節</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td className="text-left">{item.title}</td>
                <td className="text-right">{item.origin_price}</td>
                <td className="text-right">{item.price}</td>
                <td className={`${item.is_enabled ? 'text-success' : 'text-danger'}`}>
                  {item.is_enabled === 1 ? '啟用' : '未啟用'}
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setTempProduct(item)}
                  >
                    查看細節
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-md-6 mt-1">
        <h2>單一產品細節</h2>
        {tempProduct ? (
          <div className="card mb-3 shadow-lg">
            <img
              src={tempProduct.imageUrl}
              className="card-img-top primary-image"
              alt="主圖"
            />
            <div className="card-body">
              <h5 className="card-title">
                {tempProduct.title}
                <span className="badge bg-primary ms-2">
                  {tempProduct.category}
                </span>
              </h5>
              <p className="card-text">商品描述：{tempProduct.description}</p>
              <p className="card-text">商品內容：{tempProduct.content}</p>
              <div className="d-flex">
                <p className="card-text text-secondary">
                  <del>{tempProduct.origin_price}</del>
                </p>
                元 / {tempProduct.price} 元
              </div>
              <h5 className="mt-3">更多圖片：</h5>
              <div className="d-flex flex-wrap">
                {tempProduct.imagesUrl?.map((url, index) => (
                  <img key={index} src={url} className="images" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-secondary">請選擇一個商品查看</p>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;

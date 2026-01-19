import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { FaEdit, FaTrash } from 'react-icons/fa';

import * as bootstrap from 'bootstrap'
import "../../assets/style.css"

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;


// 建立初始化的產品資料物件
const INITIAL_TEMPLATE_DATA = {
    id: "",
    title: "",
    category: "",
    origin_price: "",
    price: "",
    unit: "",
    description: "",
    content: "",
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [],
};


const ProductEditPage = () => {
    // 使用 useRef 建立綁定 DOM 元素
    const productModalRef = useRef(null);
    // 使用 useRef 儲存 Bootstrap Modal 實例
    const modalInstanceRef = useRef(null);

    // 建立表單資料模板
    const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
    const [modalType, setModalType] = useState(""); // create: 新增, edit: 編輯, delete: 刪除

    // 取得產品資料
    const [products, setProducts] = useState([]);
    const getProducts = async () => {
        try {
            const response =  await axios.get(
                `${API_BASE}/api/${API_PATH}/admin/products`
            );
            setProducts(response.data.products);
        } catch (error) {
            console.error('取得產品資料失敗', error);
        }
    };
    // 畫面渲染完後執行：元件掛載後，取得資料並設定 Bootstrap Modal 元件的參數。
    useEffect(() => {
        getProducts();
        
        // 初始化 Bootstrap Modal
        if (productModalRef.current) {
            modalInstanceRef.current = new bootstrap.Modal(productModalRef.current, {
                keyboard: false
            });
        }

        // Modal關閉時移除焦點
        const modalElement = document.querySelector("#productModal");
        if (modalElement) {
            modalElement.addEventListener('hide.bs.modal', () => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
        }
    }, []);
    
    // open Modal 
    const openModal = (type, product) => {
        // 取得單筆產品資料在 Modal 元件中，並在主控台中顯示該筆資料。
        console.log('操作類型：', type);
        console.log('被選中的產品資料：', product);
        // 設定然後綁定至 Modal 表單元件中。
        setModalType(type);
        if (product) {
            setTemplateData((pre) => ({
                ...pre,
                ...product
            }));
        } else {
            setTemplateData(INITIAL_TEMPLATE_DATA);
        }
        // 使用 ref 顯示 Modal 表單元件。
        if (modalInstanceRef.current) {
            modalInstanceRef.current.show();
        }
    };

    // close Modal
    const closeModal = () => {
        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }
    };


    // 在 Model 表單中編輯，輸入資料時，更新 templateData 的資料。
    const handleModalInputChange = (e) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? e.target.checked : undefined;
        
        console.log(name, value, checked, type);
        // 使用 setState 更新 templateData 的資料。
        setTemplateData((preData) => ({
            ...preData,    // 使用解構賦值方式，保留之前的資料。
            [name]: type === 'checkbox' ? checked : value, // 使用三元運算子，更新指定的欄位。
        }));
    };

    // 編輯圖片
    const handleModalImageChange = (index, value) => {
        setTemplateData((pre) => {
            const newImages = [...pre.imagesUrl];
            newImages[index] = value;

            // 優化 handleModalImageChange
            // 限制圖片最多只能5張，且最後一張不能空白。
            if (value !== "" && index === newImages.length -1 && newImages.length < 5) {
                newImages.push(""); // 滿足上述 if 條件，自動新增一個空的Input輸入框。
            }

            // 限制圖片最少要1張，且最後一張不能空白。
            if (value ==="" && newImages.length > 1 && newImages[newImages.length-1] === "") {
                newImages.pop(); // 滿足上述 if 條件，自動刪除最後一個空的Input輸入框。
            }
            return {
                ...pre,
                imagesUrl: newImages,
            }; 
        });
    };

        // 編輯圖片-新增圖片
        const handleAddImage = () => {
            setTemplateData((pre) => { 
                const newImage = [...pre.imagesUrl];
                newImage.push(""); // 滿足上述 if 條件，自動新增一個空的Input輸入框。
                return {
                    ...pre,
                    imagesUrl: newImage,
                }
            });
        };
        
        // 編輯圖片-刪除圖片
        const handleRemoveImage = () => {
            setTemplateData((pre) => {
                const newImage = [...pre.imagesUrl];
                newImage.pop();
                return {
                    ...pre, 
                    imagesUrl: newImage,
                };
            });
        };


    // 建立 axios 要接收的資料格式。
    const productData = {
        data: {
            ...templateData, // 使用解構賦值方式，保留之前的資料。
            origin_price: Number(templateData.origin_price),
            price: Number(templateData.price),
            is_enabled: templateData.is_enabled ? 1 : 0,
            imagesUrl: templateData.imagesUrl.filter(url => url !== ""),  // 過濾掉空的圖片網址。
        }
    }

    // 儲存產品資料
    const updateProduct = async (id) => {
        // 新增 / 編輯 共用同一個表單，由 modalType 判斷是新增還是編輯。
        let url = `${API_BASE}/api/${API_PATH}/admin/product`;
        let method = "post"; // 預設為新增。
        if (modalType === "edit") {
            url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
            method = "put";
        }
        try {
            // 根據 method 決定使用 post 或 put
            const response = method === "post" 
                ? await axios.post(url, productData)
                : await axios.put(url, productData);
            console.log('儲存產品資料成功: ', response.data);
            getProducts();
            closeModal();
        } catch (error) {
            console.log('儲存產品資料失敗: ', error);
        }
    }

    // 刪除產品
    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
            console.log('刪除產品', response.data);
            // 關閉 Modal 表單元件, 然後重新載入產品。
            closeModal();
            getProducts();
        } catch (err) {
            // const errorMsg = err.response?.data?.message || err.message;
            console.log('刪除產品失敗: ', err);
            alert('刪除產品失敗' + err);
        }
    };
    
    return (
        <>
            <div className="container-sm">
                {/* 這裡放置產品列表的頁面 含 建立、編輯、刪除 的按鈕 */}
                <div className="row w-100">
                    <div className="col-md-6 text-left">
                        <h4>產品列表</h4>
                    </div>
                    <div className="col-md-6 text-right">
                        <button type="button" className="btn btn-primary"
                            onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
                        >
                            建立新的產品
                        </button>
                    </div>
                    <div className="col-md-12 mt-1">
                        <table className="table">
                            <thead>
                                <tr className="table-info">
                                    <th>分類</th>
                                    <th>產品名稱</th>
                                    <th>原價</th>
                                    <th>售價</th>
                                    <th>是否啟用</th>
                                    <th>編輯</th>
                                </tr>
                            </thead>
                            <tbody className=" align-middle">
                                { products.map((item) => (
                                    <tr key={item.id}>
                                        <td className="text-left">{item.category}</td>
                                        <td className="text-left">{item.title}</td>
                                        <td className="text-center">{item.origin_price}</td>
                                        <td className="text-center">{item.price}</td>
                                        <td className={`${item.is_enabled ? 'text-success' : 'text-danger'}`}>
                                            {item.is_enabled === 1 ? '啟用' : '未啟用'}
                                        </td>
                                        <td className="btn-group text-center" role="group" aria-label="Basic outlined example">
                                            <button type="button" className="btn btn-outline-warning"
                                                onClick={() => openModal('edit', item)}
                                            >
                                                <FaEdit className='me-2' size={14} />編輯
                                            </button>
                                            <button type="button" className="btn btn-outline-danger"
                                                // onClick={() => handleDelete(item.id)}
                                                onClick={() => openModal('delete',item)}
                                            >
                                                <FaTrash className='md-2' size={14} />刪除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* 建立 Modal 表單元件 */}
            <div className="modal fade"
                    id="productModal"
                    tabIndex={-1}
                    aria-labelledby="productModalLabel"
                    aria-hidden="true"
                    ref={productModalRef}
                >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content border-0">
                        {/* 判斷是新增、編輯、刪除，顯示不同的背景顏色 */}
                        <div className={`modal-header bg-${
                            // 利用 modalType 判斷是刪除(danger)、編輯(warning)、新增(primary)，顯示不同的header顏色。
                            modalType === 'delete' ? 'danger' :
                            modalType === 'edit' ? 'warning' : 'primary'
                        } text-white`}> 
                            <h5 id="productModalLabel" className="modal-title">
                                <span className="text-white">
                                    {modalType === 'delete' ? '刪除' :
                                    modalType === 'edit' ? '編輯' : '新增'}產品</span>
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {/* 利用 modalType 判斷是新增、編輯、刪除，顯示不同的表單內容 */}
                            {
                                modalType === 'delete' ? (
                                    <p className="fs-4">
                                        確定要刪除
                                        <span className="text-danger">{templateData.title}</span>嗎？
                                    </p>
                                ) : (
                                    // 新增、編輯 共用同一個表單，由 modalType 判斷是新增還是編輯。
                                    <>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <div className="mb-2">
                                                    <div className="mb-3">
                                                        <label htmlFor="imageUrl" className="form-label">
                                                            輸入圖片網址
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="imageUrl"
                                                            name="imageUrl"
                                                            className="form-control"
                                                            placeholder="請輸入圖片連結"
                                                            value={templateData.imageUrl}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                    </div>
                                                    {
                                                        // 判斷是否存在主圖，如果存在則顯示圖片。
                                                        templateData.imageUrl && (
                                                            <img className="img-fluid" 
                                                                src={templateData.imageUrl} alt="主圖" />
                                                    )}
                                                </div>
                                                <div>
                                                    {
                                                        templateData.imagesUrl.map((url, index) => (
                                                            <div key={index}>
                                                                <label htmlFor="imageUrl" className="form-label">
                                                                    輸入圖片網址
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder={`圖片網址${index + 1}`}
                                                                    value={url}
                                                                    onChange={(e) => handleModalImageChange(index, e.target.value)}
                                                                />
                                                                {
                                                                    url &&  
                                                                    <img
                                                                        className="img-fluid"
                                                                        src={url}
                                                                        alt={`副圖${index + 1}`}
                                                                    />
                                                                }
                                                            </div>
                                                        ))
                                                    }
                                                    {
                                                        // 優化 handleAddImage：限制圖片最多只能5張，如果小於5張，則顯示新增圖片按鈕。
                                                        templateData.imagesUrl.length < 5 && 
                                                        // 限制最後一張圖片不能空白才能按新增按鈕，避免一直按新增。
                                                        templateData.imagesUrl[templateData.imagesUrl.length - 1] !== "" && (
                                                            <button 
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm d-block w-100"
                                                                onClick={() => handleAddImage()}
                                                            >
                                                                新增圖片
                                                            </button>
                                                        )
                                                    }
                                                    
                                                </div>
                                                {
                                                    // 優化 handleRemoveImage：imagesUrl 陣列有值才顯示 刪除圖片按鈕。
                                                    templateData.imagesUrl.length >= 1 && 
                                                        <div>
                                                            <button 
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm d-block w-100"
                                                                onClick={() => handleRemoveImage()}
                                                            >
                                                                刪除圖片
                                                            </button>
                                                        </div>
                                                }
                                            </div>
                                            <div className="col-sm-8">
                                                <div className="mb-3">
                                                    <label htmlFor="title" className="form-label">標題</label>
                                                    <input
                                                        name="title"
                                                        id="title"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="請輸入標題"
                                                        value={templateData.title}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    />
                                                </div>

                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="category" className="form-label">分類</label>
                                                        <input
                                                            name="category"
                                                            id="category"
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="請輸入分類"
                                                            value={templateData.category}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="unit" className="form-label">單位</label>
                                                        <input
                                                            name="unit"
                                                            id="unit"
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="請輸入單位"
                                                            value={templateData.unit}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="origin_price" className="form-label">原價</label>
                                                        <input
                                                            name="origin_price"
                                                            id="origin_price"
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="請輸入原價"
                                                            value={templateData.origin_price}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="price" className="form-label">售價</label>
                                                        <input
                                                            name="price"
                                                            id="price"
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="請輸入售價"
                                                            value={templateData.price}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                    </div>
                                                </div>
                                                <hr />

                                                <div className="mb-3">
                                                    <label htmlFor="description" className="form-label">產品描述</label>
                                                    <textarea
                                                        name="description"
                                                        id="description"
                                                        className="form-control"
                                                        placeholder="請輸入產品描述"
                                                        value={templateData.description}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="content" className="form-label">說明內容</label>
                                                    <textarea
                                                        name="content"
                                                        id="content"
                                                        className="form-control"
                                                        placeholder="請輸入說明內容"
                                                        value={templateData.content}
                                                        onChange={(e) => handleModalInputChange(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="form-check">
                                                        <input
                                                            name="is_enabled"
                                                            id="is_enabled"
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={templateData.is_enabled}
                                                            onChange={(e) => handleModalInputChange(e)}
                                                        />
                                                        <label className="form-check-label" htmlFor="is_enabled">
                                                            是否啟用
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => closeModal()}
                            >
                                取消
                            </button>
                            <button 
                                type="button" 
                                className={`btn ${
                                    // 利用 modalType 判斷是刪除(danger)、編輯(primary)，顯示不同的按鈕顏色。
                                    modalType === 'delete' ? 'btn-danger' : 'btn-primary'
                                }`}
                                onClick={() => {
                                    // 利用 modalType 判斷是刪除(danger)、編輯(primary)，執行不同的操作。
                                    if (modalType === 'delete') {
                                        deleteProduct(templateData.id);
                                    } else {                                        
                                        updateProduct(templateData.id)
                                    }
                                }}>
                                    {modalType === 'delete' ? '確認刪除' : '確認'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};



export default ProductEditPage;

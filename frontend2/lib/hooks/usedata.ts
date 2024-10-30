// context/DataContext.js
import { createContext, useContext, useState, useCallback } from 'react';

// コンテキストの初期値の型定義
const initialContextValue = {
  data: null,
  loading: false,
  error: null,
  refreshData: async () => {},
  updateData: async () => {},
};

// コンテキストの作成
const DataContext = createContext(initialContextValue);

// カスタムフックの作成
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// APIリクエストに関する共通の設定
const API_CONFIG = {
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
};

// APIリクエスト用のユーティリティ関数
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Providerコンポーネントの作成
export const DataProvider = ({ children }) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  // データを取得する関数
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchAPI('/data');
      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  // データを更新する関数
  const updateData = useCallback(async (newData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchAPI('/data', {
        method: 'PUT',
        body: JSON.stringify(newData),
      });

      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // コンテキストの値
  const value = {
    ...state,
    refreshData: fetchData,
    updateData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// データ取得中の表示用のラッパーコンポーネント
export const WithData = ({ children, loadingComponent, errorComponent }) => {
  const { loading, error, data } = useData();

  if (loading) {
    return loadingComponent || <div>Loading...</div>;
  }

  if (error) {
    return errorComponent || <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return children;
};

// 使用例
// import { useData, DataProvider, WithData } from './context/DataContext';

// function YourComponent() {
//   const { data, updateData, refreshData } = useData();
//
//   const handleUpdate = async () => {
//     await updateData({ newValue: 'updated' });
//   };
//
//   return (
//     <WithData>
//       <div>
//         {/* データを表示 */}
//         <pre>{JSON.stringify(data, null, 2)}</pre>
//         
//         {/* データ更新ボタン */}
//         <button onClick={handleUpdate}>Update Data</button>
//         
//         {/* データ再取得ボタン */}
//         <button onClick={refreshData}>Refresh Data</button>
//       </div>
//     </WithData>
//   );
// }

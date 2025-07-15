'use client';

import { useState, useEffect } from 'react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState([]);
  const [selectedQuoteNumber, setSelectedQuoteNumber] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchQuotes(1);
  }, []);

  const fetchQuotes = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes?page=${page}&limit=10`);
      const data = await response.json();
      
      if (page === 1) {
        setQuotes(data.quotes);
      } else {
        setQuotes(prev => [...prev, ...data.quotes]);
      }
      
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuoteDetails = async (quoteNumber) => {
    setIsLoadingDetails(true);
    setSelectedQuoteNumber(quoteNumber);
    setShowModal(true);

    try {
      const response = await fetch(`/api/quotes/by-number/${quoteNumber}`);
      const details = await response.json();
      
      if (response.ok) {
        setSelectedQuoteDetails(details);
      } else {
        console.error('Error fetching details:', details.error);
        setSelectedQuoteDetails([]);
      }
    } catch (error) {
      console.error('Failed to fetch quote details:', error);
      setSelectedQuoteDetails([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuoteDetails([]);
    setSelectedQuoteNumber(null);
  };

  const handleDeleteClick = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quotes?quoteNumber=${quoteToDelete.quote_number}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 从列表中移除删除的报价
        setQuotes(prev => prev.filter(q => q.quote_number !== quoteToDelete.quote_number));
        setShowDeleteConfirm(false);
        setQuoteToDelete(null);
      } else {
        const data = await response.json();
        alert('删除失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('Delete quote error:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setQuoteToDelete(null);
  };

  const loadNextPage = () => {
    if (hasMore && !isLoading) {
      fetchQuotes(currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDimensions = (width, height) => {
    // 将英寸转换为平方米: 1 inch = 0.0254 meters
    const areaSquareInches = parseFloat(width) * parseFloat(height);
    const areaSquareMeters = areaSquareInches * 0.0254 * 0.0254;
    return `${parseFloat(width).toFixed(3)}" × ${parseFloat(height).toFixed(3)}" (${areaSquareMeters.toFixed(4)} ㎡)`;
  };

  if (isLoading && quotes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">报价历史</h2>
        <p className="mt-1 text-gray-600">查看所有已生成的报价单记录</p>
      </div>

      {/* 报价单列表 */}
      {quotes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报价记录</h3>
          <p className="text-gray-600">
            <a href="/" className="text-primary-600 hover:text-primary-500">
              创建第一个报价
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <div key={quote.quote_number || `quote-${index}`} className="bg-white shadow rounded-lg">
              {/* 报价单摘要 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        报价单 #{quote.quote_number}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quote.item_count} 项目
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">客户:</span> {quote.customer_name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">电话:</span> {quote.phone || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">产品摘要:</span> {quote.products_summary}
                      </div>
                      <div>
                        <span className="font-medium">创建时间:</span> {formatDate(quote.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${parseFloat(quote.total_amount || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">总金额</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchQuoteDetails(quote.quote_number)}
                        className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        查看详情
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(quote)}
                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        删除
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          ))}

          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="flex justify-center py-6">
              <button
                onClick={loadNextPage}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    加载中...
                  </>
                ) : (
                  <>
                    加载更多
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 分页信息 */}
          <div className="text-center text-sm text-gray-500">
            第 {currentPage} 页，共 {totalPages} 页
          </div>
        </div>
      )}

      {/* Modal for Quote Details */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-11/12 lg:w-10/12 xl:w-11/12 max-w-7xl shadow-lg rounded-md bg-white min-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-lg font-medium text-gray-900">
                报价单 #{selectedQuoteNumber} 详情
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : selectedQuoteDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  没有找到详情数据
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">尺寸</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">单价</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">总价</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedQuoteDetails.map((item, index) => (
                        <tr key={item.id || `item-${index}`}>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{item.product}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="space-y-1 text-xs">
                              <div>Fabric: {item.fabric}</div>
                              <div>Valance: {item.valance}</div>
                              <div>Color: {item.valance_color}</div>
                              <div>Rail: {item.bottom_rail}</div>
                              <div>Control: {item.control}</div>
                              {item.fabric_price && (
                                <div className="text-green-600">Fabric Price: ${parseFloat(item.fabric_price).toFixed(2)}</div>
                              )}
                              {item.motor_price && (
                                <div className="text-blue-600">Motor: ${parseFloat(item.motor_price).toFixed(2)}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {formatDimensions(item.width_inch, item.height_inch)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            ${parseFloat(item.unit_price || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            ${parseFloat(item.total_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Total Summary */}
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">总计</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${selectedQuoteDetails.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      共 {selectedQuoteDetails.length} 个项目
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                确认删除报价单
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  您确定要删除报价单 #{quoteToDelete?.quote_number} 吗？
                </p>
                <p className="text-sm text-red-600 mt-1">
                  此操作不可撤销！
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
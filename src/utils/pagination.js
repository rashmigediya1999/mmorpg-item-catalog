/**
 * Calculate pagination parameters from request query
 * 
 * @param {number|string} page - Page number (0-indexed)
 * @param {number|string} size - Items per page
 * @returns {Object} Pagination parameters
 */
export const getPagination = (page, size) => {
    const pageNumber = page ? Math.max(1, parseInt(page)) : 1;
    const limit = size ? parseInt(size) : 10;
    const offset = (pageNumber - 1) * limit;
    
    return { limit, offset };
};

/**
 * Format pagination data for response
 * 
 * @param {Object} data - Data with items and count
 * @param {number|string} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Formatted response with pagination metadata
 */
export const getPagingData = (data, page, limit) => {
    const { count, items } = data;
    const currentPage = page ? Math.max(1, parseInt(page)) : 1;
    const totalPages = Math.ceil(count / limit);
    
    return {
        items,
        meta: {
            totalItems: count,
            itemsPerPage: limit,
            totalPages,
            currentPage
        }
    };
};
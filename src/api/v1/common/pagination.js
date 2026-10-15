const getPagination = (query, defaultLimit = 10, defaultSortBy = 'createdAt', defaultOrder = 'DESC') => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = (query.sortOrder || defaultOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return {
    page,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    sortBy,
    sortOrder,
  };
};

const formatPaginatedResponse = (rows, count, page, limit) => {
  const totalPages = Math.ceil(count / limit) || 1;
  return {
    rows,
    pagination: {
      totalItems: count,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPagination,
  formatPaginatedResponse,
};

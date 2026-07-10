interface IPaginationOptions {
  page?: string;
  limit?: string;
}

export const calculatePagination = (
  options: IPaginationOptions,
) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
  });
}

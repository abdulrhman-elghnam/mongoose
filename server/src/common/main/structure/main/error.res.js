export const globalErrorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  console.error({ ErrorMessage: err.message });

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};

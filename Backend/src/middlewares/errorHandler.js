export default function errorHandler(err, _req, res, _next) {
  const status = err.status || (/^User location/.test(err.message) || /^personalityType/.test(err.message) ? 400 : 500);
  res.status(status).json({ message: err.message || 'Something went wrong' });
}

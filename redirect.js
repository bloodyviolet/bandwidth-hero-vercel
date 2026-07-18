function redirect(req, res) {
  // Prevent crashing if the response object is missing or already sent
  if (!res || res.headersSent) return;

  res.setHeader('content-length', 0);
  
  // Safely attempt to remove headers only if Vercel supports it
  if (typeof res.removeHeader === 'function') {
    res.removeHeader('cache-control');
    res.removeHeader('expires');
    res.removeHeader('date');
    res.removeHeader('etag');
  }
  
  // Safely grab the URL whether Vercel passes it in params or query
  const targetUrl = (req.params && req.params.url) || (req.query && req.query.url) || '';
  
  res.setHeader('location', encodeURI(targetUrl));
  res.statusCode = 302;
  res.end();
}

module.exports = redirect;

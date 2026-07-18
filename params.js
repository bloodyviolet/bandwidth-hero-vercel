const DEFAULT_QUALITY = 40

function params(req, res, next) {
  let url = req.query.url || req.params[0] || req.url.substring(1);
  if (url && url.includes('?')) url = url.split('?')[0];

  while (url && (url.includes('%25') || url.toLowerCase().startsWith('http%3a') || url.toLowerCase().startsWith('https%3a'))) {
    url = decodeURIComponent(url);
  }

  if (!url || !url.startsWith('http')) return res.end('bandwidth-hero-proxy')

  url = url.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://')
  req.params.url = url
  req.params.webp = !req.query.jpeg
  req.params.grayscale = req.query.bw != 0
  req.params.quality = parseInt(req.query.l, 10) || DEFAULT_QUALITY

  next()
}

module.exports = params

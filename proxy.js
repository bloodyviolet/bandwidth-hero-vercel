const http = require('http');
const https = require('https');
const axios = require('axios');
const { pick } = require('lodash');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  // 1. Safely grab the target URL from query parameter first
  let url = req.query.url;

  // 2. If it's not in the query, extract it cleanly from the path wildcard
  if (!url) {
    url = req.params[0] || req.url.substring(1);
    // If Express passed query parameters along in the raw req.url string, strip them out
    if (url.includes('?')) {
      url = url.split('?')[0];
    }
  }
  
  // 3. Keep decoding until the URL is completely cleaned up
  try {
    while (url && (url.includes('%25') || url.toLowerCase().includes('http%3a') || url.toLowerCase().includes('https%3a'))) {
      let decoded = decodeURIComponent(url);
      if (decoded === url) break; // Break out if no changes happen to prevent an accidental infinite loop
      url = decoded;
    }
  } catch (e) {
    return redirect(req, res);
  }

  // If no valid URL is found, gracefully back out
  if (!url || !url.startsWith('http')) return redirect(req, res);

  const headers = {
    cookie: req.headers.cookie,
    dnt: req.headers.dnt,
    referer: req.headers.referer,
    'user-agent': 'Bandwidth-Hero Compressor',
    'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
    via: '1.1 bandwidth-hero',
  };
  
  const config = {
    timeout: 10000,
    maxRedirects: 5,
    responseType: 'arraybuffer',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };

  try {
    const response = await axios.get(url, { headers, ...config });
    if (response.status >= 400) {
      return redirect(req, res);
    }

    copyHeaders(response.headers, res);
    res.setHeader('content-encoding', 'identity');
    
    // Ensure params exists so the app doesn't crash
    req.params = req.params || {};
    req.params.originType = response.headers['content-type'] || '';
    req.params.originSize = response.data.length;

    if (shouldCompress(req)) {
      compress(req, res, response.data);
    } else {
      bypass(req, res, response.data);
    }
  } catch (error) {
    redirect(req, res);
  }
}

module.exports = proxy;

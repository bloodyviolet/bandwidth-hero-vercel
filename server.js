#!/usr/bin/env node
'use strict'
const app = require('express')()
const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')

const PORT = process.env.PORT || 8080

app.enable('trust proxy')

// 1. Intercept and clean the URL before params.js can reject it
app.use((req, res, next) => {
  if (req.path !== '/favicon.ico') {
    let url = req.query.url || req.url.substring(1);
    
    // 2. Clean up the double-encoding from the extension
    while (url && (url.includes('%25') || url.toLowerCase().startsWith('http%3a') || url.toLowerCase().startsWith('https%3a'))) {
      url = decodeURIComponent(url);
    }
    
    // 3. Trick params.js into thinking it was a standard query all along
    req.query.url = url;
  }
  next();
});

app.get('/*', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

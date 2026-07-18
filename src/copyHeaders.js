function copyHeaders(source, target) {
  for (const [key, value] of Object.entries(source)) {
    try {
      target.setHeader(key, value)
    } catch (e) {
      console.log(e.message)
    }
  }
}

module.exports = copyHeaders

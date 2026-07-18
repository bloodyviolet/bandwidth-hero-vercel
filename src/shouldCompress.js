const MIN_COMPRESS_LENGTH = 1024;
const MIN_TRANSPARENT_COMPRESS_LENGTH = MIN_COMPRESS_LENGTH * 100;

const IMAGE_FILE_REGEX = /^image\/(jpeg|png|gif|webp)$/i;

function shouldCompress({ params }) {
  const { originType, originSize, webp } = params;

  if (!originType || !IMAGE_FILE_REGEX.test(originType)) {
    return false;
  }

  if (originSize === 0) {
    return false;
  }

  if (
    (webp && originSize < MIN_COMPRESS_LENGTH) ||
    (!webp && originSize < MIN_TRANSPARENT_COMPRESS_LENGTH)
  ) {
    return false;
  }

  return true;
}

module.exports = shouldCompress;

// src/lib/functions.js
function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return [d > 0 ? `\( {d}j` : '', h > 0 ? ` \){h}h` : '', m > 0 ? `\( {m}min` : '', ` \){s}s`].filter(a => a).join(' ');
}

module.exports = { runtime };
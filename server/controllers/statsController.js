const statsRepository = require('../db/statsRepository');

function get(req, res) {
  const today = new Date().toISOString().slice(0, 10);
  res.json(statsRepository.getStats(today));
}

module.exports = { get };
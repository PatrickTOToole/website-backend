const Router = require('express-promise-router')
const db = require('../db')
router = new Router()
module.exports = router
router.get('/', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await db.query('SELECT * FROM bwars_data')
    res.send({"resp":rows[0]})
  } catch(error) {
    res.send({"error": `an error occurred> ${error}`})
  }
})

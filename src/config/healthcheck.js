const router = require('express').Router()


// Health Check Endpoint
router.get('/', async (req, res) => { res.json({status: 'ok'}) })

module.exports = router
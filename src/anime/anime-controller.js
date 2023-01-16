const router = require('express').Router()
const { OK } = require('http-status-codes').StatusCodes

const service = require('./anime-service')

router.get('/', async (req, res) => {
    res.json()
})

router.get('/:slug_name', async (req, res) => {
    res.json()
})

router.get('/search', async (req, res) => {
    res.json()
})

module.exports = router
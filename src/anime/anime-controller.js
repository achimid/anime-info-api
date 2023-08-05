const router = require('express').Router()
const { OK } = require('http-status-codes').StatusCodes

const animeService = require('./anime-service')

router.get('/:id', async (req, res) => {
    
})

module.exports = router
const router = require('express').Router()
const { OK } = require('http-status-codes').StatusCodes

const animeService = require('./anime-service')

router.get('/list/names', async (req, res) => {
    return animeService.listAllNames()
        .then(json => res.status(OK).json(json))
        .catch(res.onError)
})

router.get('/', async (req, res) => {
    return animeService.search(req.query.q)
        .then(json => res.status(OK).json(json))
        .catch(res.onError)
})

module.exports = router
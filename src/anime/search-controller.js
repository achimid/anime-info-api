const router = require('express').Router()
const { OK } = require('http-status-codes').StatusCodes

const animeService = require('./anime-service')

router.get('/list/names', async (req, res) => {
    // #swagger.tags = ['Search']
	// #swagger.summary = 'Listagem de todos os nomes de animes'

    return animeService.listAllNames()
        .then(json => res.status(OK).json(json))
        .catch(res.onError)
})

router.get('/', async (req, res) => {
    // #swagger.tags = ['Search']
	// #swagger.summary = 'Busca de animes. (Query, Nome, Similaridade, Aproximação)'

    const { q } = req.query

    return animeService.search(q)
        .then(json => res.status(OK).json(json))
        .catch(res.onError)
})


module.exports = router
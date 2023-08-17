const router = require('express').Router()
const { OK } = require('http-status-codes').StatusCodes

const animeService = require('./anime-service')

router.get('/:id', async (req, res) => {
    // #swagger.tags = ['Anime']
	// #swagger.summary = 'Recuperar informações de um anime pelo ID'
    
    const { id } = req.params

    return animeService.findById(id)
        .then(json => res.status(OK).json(json))
        .catch(res.onError)

})

module.exports = router
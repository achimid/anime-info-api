const router = require('express').Router()


router.get('/', async (req, res) => { 
    // #swagger.tags = ['Health Check']
	// #swagger.summary = 'Endpoint para consultar o status da aplicação'

    res.json({status: 'ok'}) 
})

module.exports = router
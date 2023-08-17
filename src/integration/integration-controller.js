const router = require('express').Router()

const clientMAL = require('./client-mal')

router.get('/callback', async (req, res) => {
    res.send()
})

router.post('/callback/mal/anime/info', async (req, res) => {
    res.send()
    proccessCallbackBody(req.body, clientMAL.onAnimeInfo)
})

router.post('/callback/mal/search', async (req, res) => {
    res.send()
    proccessCallbackBody(req.body, clientMAL.onSearchComplete)
})

const proccessCallbackBody = (body, fn) => {

    const { execution, request } = body

    console.log(`Execução do script ${request.url} ${execution.isSuccess} ${execution.executionTime}` )

    if (execution.isSuccess == false || execution.result == null || execution.result == undefined || execution.result == "" || execution.result.length == 0) {        
        return console.error("Nenhum retorno na execução do script", body)        
    }

    fn(body)
}


module.exports = router
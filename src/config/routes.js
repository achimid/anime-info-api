const healthcheck = require('./healthcheck')
const anime = require('../anime/anime-controller')
const search = require('../anime/search-controller')
const integration = require('../integration/integration-controller')

const { errorHandler } = require('./error-handler')

const prefix = "/api/v1"

module.exports = (app) => {
    console.info(`Registrando rotas...`)

    app.use(errorHandler)

    app.use(`${prefix}`, healthcheck)
    app.use(`${prefix}/anime`, anime)
    app.use(`${prefix}/search`, search)
    app.use(`${prefix}/integration`, integration)

    console.info(`Rotas registradas com sucesso...`)

    return app
}
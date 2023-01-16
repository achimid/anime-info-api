const healthcheck = require('./healthcheck')
const anime = require('../anime/anime-controller')

const { errorHandler } = require('./error-handler')

const prefix = "/api/v1"

module.exports = (app) => {
    console.info(`Registrando rotas...`)

    app.use(errorHandler)
    app.use(preAuthHeader)

    app.use(`${prefix}`, healthcheck)
    app.use(`${prefix}/anime`, anime)

    console.info(`Rotas registradas com sucesso...`)

    return app
}
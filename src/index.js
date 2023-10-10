
require('dotenv').config()

const swaggerUi = require('swagger-ui-express')
const { databaseInit } = require('./config/database')
const express = require('express')
const app = express()
const routes = require('./config/routes')

app.use(express.json())

databaseInit()
    .then(() => routes(app))
    .then(() => app.use('/', swaggerUi.serve, swaggerUi.setup(require('../swagger-output.json'))))



app.listen(process.env.PORT || 3000)
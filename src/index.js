
require('dotenv').config()

const swaggerUi = require('swagger-ui-express')
const mongoose = require('mongoose')
const express = require('express')
const app = express()

app.use(express.json())


main().catch(err => console.log(err))

async function main() {
	await mongoose.connect(process.env.MONGO_DB_CONNECTION)
}

app.use('/', swaggerUi.serve, swaggerUi.setup(require('../swagger-output.json')))

app.listen(process.env.PORT || 3000)
const fetch = require('node-fetch')
const stringUtils = require('../utils/string-utils')

let cache

const fetchData = async () => {
    if (cache) return cache

    const data = await fetch(`https://api2.animestc.com/series?page=1&full=true`)
        .then(res => res.json())
        .then(json => json.data) 

    cache = data

    return data
}

const queryByNameBestMatch = async (name) => {
    return fetchData()
        .then(details => selectBestMatch(name, details))
        .catch(err => console.error("Erro ao buscar detalhe: ", err))
}

const selectBestMatch = async (name, details) => {

    if (!details) return null

    const fMapName = (d) => { return [d.title]}

    return stringUtils.selectBestMatch(name, details, fMapName)
}

module.exports = {
    queryByNameBestMatch
}
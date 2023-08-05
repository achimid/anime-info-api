const fetch = require('node-fetch')
const stringUtils = require('../utils/string-utils')


const cache = {}

const queryByNameCached = async (name) => {
    const hasCache = cache[toKey(name)]
    if (hasCache) {
        console.log("Is cached ", name)   
        return hasCache
    } else {
        console.log("Is NOT cached!! ", name)
    }

    return null
}

const queryByNameBestMatch = async (name, limit = 20) => {
    return fetch(`https://api.jikan.moe/v4/anime?q=${name}&limit=${limit}`)
        .then(res => res.json())
        .then(json => json.data)
        .then(details => selectBestMatch(name, details))
        .catch(err => console.error("Erro ao buscar detalhe: ", err))
}

const queryByName = async (name) => {
    console.log(`Realizando busca do detalhe do anime: ${name}`)
    return fetch(`https://api.jikan.moe/v4/anime?q=${name}&limit=5`)
        .then(res => res.json())
        .then(json => json.data)
        .then(details => selectBestMatch(name, details))
        .then(detail => storeCache(name, detail))
        .catch(err => console.error("Erro ao buscar detalhe: ", err))
}

const selectBestMatch = async (name, details) => {

    if (!details) return null

    const fMapName = (d) => { return [
        d.title, 
        d.title_english, 
        d.title_japanese, 
        ...d.title_synonyms, 
        ...d.titles.map(t => t.title)
    ]}

    return stringUtils.selectBestMatch(name, details, fMapName)
}


const toKey = (str) => str.toUpperCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(new RegExp(" ", 'g'), "")

const storeCache = (name, detail) => {
    if (!detail) return null
    
    console.log("Stored cache ", name, detail.title)
    cache[toKey(name)] = detail    

    return detail
}

module.exports = {
    queryByName,
    queryByNameCached,
    queryByNameBestMatch
}
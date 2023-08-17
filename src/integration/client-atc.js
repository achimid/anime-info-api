const fetch = require('node-fetch')

const getAllAnimes = async () => {
    return fetch(`https://api2.animestc.com/series?page=1&full=true`)
        .then(res => res.json())
        .then(json => json.data)
        .then(animes => animes.map(anime => {
            return {
                ...anime,
                title: anime.title.replace(/[']/g, ''),
                titles: [...new Set([anime.title, anime.title.replace(/[']/g, '')])].filter(s => s)
            }
        }))
}

module.exports = {
    getAllAnimes
}
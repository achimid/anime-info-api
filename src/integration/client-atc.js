const fetch = require('node-fetch')

const getAllAnimes = async (page = 1) => {
    return fetch(`https://api2.animestc.com/series?page=${page}&full=true`)
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
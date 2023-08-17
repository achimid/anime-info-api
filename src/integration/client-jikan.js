const fetch = require('node-fetch')

const search = async (name, limit = 20) => {
    return fetch(`https://api.jikan.moe/v4/anime?q=${name}&limit=${limit}&sfw=false`)
        .then(res => res.json())
        .then(json => json.data || [])
        .then(animes => animes.map(anime => {
            return {
                ...anime,
                title: anime.title.replace(/[']/g, ''),
                titles: [...new Set([anime.title, anime.title.replace(/[']/g, ''), anime.title_english, anime.title_japanese, ...(anime.titles || []).map(s => s.title), ...(anime.title_synonyms || [])])].filter(s => s)
            }
        }))
        .catch(e => console.error(e))
}

module.exports = {
    search
}
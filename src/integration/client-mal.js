const fetch = require('node-fetch')
const crypto = require('crypto')

const cacheSearch = {}
const scriptExtractor = `
    info = { 
        title: document.querySelector('.title-name')?.innerText,    
        title_english: document.querySelector('.title-english')?.innerText,
        image: document.querySelector('.lazyloaded')?.getAttribute('data-src'), 
        url: window.location.href,
        score: document.querySelector('.score-label')?.innerText,
        description: document.querySelector('[itemprop*="description"]')?.innerText,
        titles: [...document.querySelectorAll('.js-alternative-titles .spaceit_pad')].map(e => e.innerText.split(':').slice(1).join(':').replace('\\n', '').trim())
    };

    info;
`

const search = (query) => new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5').update(query).digest('hex')
    extract({
        "url": `https://myanimelist.net/anime.php?q=${query}&cat=anime`,
        "script": "[...document.querySelectorAll('tr .pt4 a')].map(a => a.href)",
        "callbackUrl": process.env.ANIME_INFO_URL + "/api/v1/integration/callback/mal/search",
        "ref": hash
    })

    cacheSearch[hash] = resolve
})

const extract = (body) => {
    fetch(process.env.PUPPETEER_EXECUTOR_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then(json => console.log('Extração adicionada a fila ', json.id))
}

const onSearchComplete = ({ execution, request}) => {
    const links = execution.result
    links.slice(0, 1).map(link => extract({
        "url": link,
        "script": scriptExtractor,
        "callbackUrl": process.env.ANIME_INFO_URL + "/api/v1/integration/callback/mal/anime/info",        
        "ref": request.ref
    }))
}

const onAnimeInfo = ({ execution, request}) => {
    const info = execution.result
    const ref = request.ref

    if (!!ref && !!info && !!cacheSearch[ref]) cacheSearch[ref](parseInfo(info))
}

const parseInfo = (anime) => {
    return {
        ...anime,        
        titles: [...new Set([anime.title, anime.title.replace(/[']/g, ''), anime.title_english, , ...(anime.titles || []).map(s => s.title)])].filter(s => s)
    }
}

module.exports = {
    search,
    onAnimeInfo,
    onSearchComplete,    
}
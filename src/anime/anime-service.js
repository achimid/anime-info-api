const repository = require('./anime-repository')
const integrationService = require('../integration/integration-service')
const { searchSimilarityName, searchStrategySimple } = require('./search-service')


const findById = (id) => repository.findById(id)

const listAllNames = () => repository.listAllNames()

const search = async (query = '') => {

    const animesFound = await repository.queryByNames(query)
    if (animesFound.length > 0) return animesFound

    const bestMatchs = searchSimilarityName(query, [...repository.getAllNames()])

    if (bestMatchs.length > 0) {
        const animesBestMatchFound = await repository.queryByNames(bestMatchs[0].possibility)
        if (animesBestMatchFound.length > 0) {
            improveFutureSearchName(animesBestMatchFound, query)
            return animesBestMatchFound
        }
    }
    
    return findOrCreateFromBestMatch(query, await integrationService.findBestMatch(query))
}

const improveFutureSearchName = async (animesBestMatchFound, possibleName) => {
    for (let i = 0; i < animesBestMatchFound.length; i++) {
        const { _id } = animesBestMatchFound[i];

        const anime = await repository.findById(_id)
        
        anime.synonyms = [...new Set([...(anime.synonyms || []), possibleName])]
        console.log(possibleName, anime.name)

        await repository.update(anime)
    }
}

const findOrCreateFromBestMatch = async (query, bestMatchs) => {
    const { mal, atc, jikan } = bestMatchs

    const anime = {
        name: mal?.title || jikan?.title || atc?.name,
        names: [...new Set([...(mal?.names || []), ...(jikan?.titles || []), ...(atc?.titles || [])])].filter(s => s),
        synonyms: [query],
        source: { mal, atc, jikan },
        type: mal?.type || jikan?.type || atc?.type,
        season: mal?.season || jikan?.season || atc?.season,
        image: mal?.image || jikan?.images?.webp?.image_url || jikan?.images?.jpg?.image_url || atc?.image,
        description: mal?.description || jikan?.synopsis || atc?.description,
    }

    const animesFound = await repository.queryByNames(anime.name)
    const bestMatchsDB = searchStrategySimple(anime.name, animesFound, (a) => a.name)    

    if (bestMatchsDB.length > 0 && bestMatchsDB[0].similarity >= 0.95) {
        const animeFounded = bestMatchsDB[0].possibility
        animeFounded.synonyms = [...new Set([...(animeFounded.synonyms || []), query])]
        
        repository.update(animeFounded).catch(console.error)

        return animeFounded
    } else {
        repository.create(anime).catch(console.error)
        
        return anime
    }    
}


module.exports = {
    search,
    findById,
    listAllNames,
    searchSimilarityName
}

// names: {
//     type: [{ type: String }],
//     default: undefined
// },
// synonyms: {
//     type: [{ type: String }],
//     default: undefined
// },
// type: {
//     type: String,
//         required: false,
// },
// season: {
//     type: String,
//         required: false,
// },
// image: {
//     type: String,
//         required: false
// },
// description: {
//     type: String,
//         required: false
// },
// source: {
//     mal: { type: Object },
//     jikan: { type: Object },
//     atc: { type: Object }
// },
// extra: {
//     type: [{ type: Object }],
//     default: undefined
// }
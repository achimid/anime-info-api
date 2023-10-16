const repository = require('./anime-repository')
const integrationService = require('../integration/integration-service')
const telegeram = require('../config/telegram')
const { searchSimilarityName, searchStrategySimple, sortBestMatch } = require('./search-service')


const findById = (id) => repository.findById(id)

const listAllNames = () => repository.listAllNames()

const search = async (query = '') => {
   

    const animesFound = await repository.queryByNames(query)
    if (animesFound.length > 0) return sortBestMatch(query, animesFound)

    const bestMatchs = searchSimilarityName(query, [...repository.getAllNames()])

    if (bestMatchs.length > 0) {
        const animesBestMatchFound = await repository.queryByNames(bestMatchs[0].possibility)
        if (animesBestMatchFound.length > 0) {
            improveFutureSearchName(animesBestMatchFound, query)
            return animesBestMatchFound
        }
    }
    
    const resultBestMatch = await findOrCreateFromBestMatch(query, await integrationService.findBestMatch(query))
    return [resultBestMatch].filter(s => s)
}

const improveFutureSearchName = async (animesBestMatchFound, possibleName) => {
    for (let i = 0; i < animesBestMatchFound.length; i++) {
        const { _id } = animesBestMatchFound[i];

        const anime = await repository.findById(_id)

        anime.synonyms = [...new Set([...(anime.synonyms || []), possibleName])]
        console.log(possibleName, anime.name)

        await repository.update(anime).catch(console.log)
    }
}

const findOrCreateFromBestMatch = async (query, bestMatchs) => {
    const { mal, atc, jikan } = bestMatchs

    if (mal == undefined && atc == undefined && jikan == undefined) return

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

    telegeram.send(`Termo de busca não encontrado: (${query}) => (${anime.name})`)

    const animesFound = await repository.queryByNames(anime.name)
    const bestMatchsDB = searchStrategySimple(anime.name, animesFound, (a) => a.name)
    const matchFromExternal = searchStrategySimple(query, [anime], (a) => a.name)

    if (bestMatchsDB.length > 0 && bestMatchsDB[0].similarity >= 0.95) {
        const animeFounded = bestMatchsDB[0].possibility
        animeFounded.synonyms = [...new Set([...(animeFounded.synonyms || []), query])]

        repository.update(animeFounded).catch(console.error)

        return animeFounded
    } else if (bestMatchsDB.length == 0 && matchFromExternal.length > 0 && matchFromExternal[0].similarity > 0.95) {
        console.log('criando novo anime...')
        const savedAnime = await repository.create(anime).catch(console.error)

        return savedAnime
    } else {
        console.log('Match não encontrado... ', query)

        return null
    }
}


module.exports = {
    search,
    findById,
    listAllNames,
    searchSimilarityName
}
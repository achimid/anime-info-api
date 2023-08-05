// const jikanClient = require('./jikan-client')
// const atcClient = require('./atc-client')

const repository = require('./anime-repository')
const stringSimilarity = require('string-similarity')


const findById = (id) => repository.findById(id)

const listAllNames = () => repository.listAllNames()

const search = async (query) => {
    
    const animesFound = await repository.queryByNames(query)
    if(animesFound.length > 0 ) return animesFound
    
    console.time("search.similarity.time")
    const bestMatchs = searchSimilarityName(query, [...repository.getAllNames()])
    console.timeEnd("search.similarity.time")

    if(bestMatchs.length == 0 ) return []

    const animesBestMatchFound = await repository.queryByNames(bestMatchs[0].possibility)
    if(animesBestMatchFound.length > 0 ) {
        improveFutureSearchName(animesBestMatchFound, query)
        return animesBestMatchFound
    }

    return []
}

const improveFutureSearchName = async (animesBestMatchFound, possibleName) => {
    for (let i = 0; i < animesBestMatchFound.length; i++) {
        const { _id } = animesBestMatchFound[i];

        const anime = await repository.findById(_id)
                
        anime.names.push(possibleName)
        console.log(possibleName, anime.name)
        
        // await repository.update(anime)        
    }    
}

const searchSimilarityName = (text, possibilities = []) => {

    console.time("search.strategy.simple.time")
    const simpleStrategy = searchStrategySimple(text, possibilities)
    console.timeEnd("search.strategy.simple.time")

    if (simpleStrategy.length > 0) return simpleStrategy


    console.time("search.strategy.split.time")
    const splitStrategy = searchStrategySplitDoubleDot(text, possibilities)
    console.timeEnd("search.strategy.split.time")

    if (splitStrategy.length > 0) return splitStrategy


    console.time("search.strategy.normalize.time")
    const normalizeStrategy = searchStrategyNormalize(text, possibilities)
    console.timeEnd("search.strategy.normalize.time")

    if (normalizeStrategy.length > 0) return normalizeStrategy


    console.time("search.strategy.normalizeNonNumbers.time")
    const normalizeNonNumbersStrategy = searchStrategyNormalizeNonNumbers(text, possibilities)
    console.timeEnd("search.strategy.normalizeNonNumbers.time")

    if (normalizeNonNumbersStrategy.length > 0) return normalizeNonNumbersStrategy

    return []

    // quebrar em palavras
    // quebrar nas virgulas e dois pontos
}

const searchStrategySimple = (text, possibilities = []) => {

    const similarities = possibilities.map(possibility => {
        const similarity = stringSimilarity.compareTwoStrings(text.toUpperCase(), possibility)
        return { similarity, possibility }
    })
    
    similarities.sort((a, b) => {
        if (a.similarity < b.similarity) return 1;
        if (a.similarity > b.similarity) return -1;
        return 0;
    })
    
    console.log(similarities[0])    

    return similarities.filter(({ possibility, similarity }) => {        
        if (text.length <= 5 && possibility.length <= 5) {
            return similarity >= 0.60
        } else if (text.length <= 10 && possibility.length <= 10) {
            return similarity >= 0.75
        } else if (text.length > 40 && possibility.length > 40) {
            return similarity >= 0.75
        } else {
            return similarity >= 0.80
        }        
    })
}
const searchStrategySplitDoubleDot = (text, possibilities = []) => {
    return searchStrategySimple(text, possibilities.flatMap(s => s.split(':')))
}

const searchStrategyNormalize = (text, possibilities = []) => {
    return searchStrategySimple(normalize(text.toUpperCase()), possibilities.map(normalize))
}

const searchStrategyNormalizeNonNumbers = (text, possibilities = []) => {
    const normalizeNonNumbers = (s) => {
        return normalize(s).replace(/[0-9]/g, '').trim()
    }
    return searchStrategySimple(normalizeNonNumbers(text.toUpperCase()), possibilities.map(normalizeNonNumbers))
}

const normalize = (s) => {
    return s
        .replace('[', '')
        .replace(']', '')
        .replace('SEASON', '')
        .replace('TEMPORADA', '')
        .replace('TMP', '')
        .replace('TMP.', '')
        .replace('.', '')
        .replace('º', '')
        .replace('ª', '')
        .replace("'", '')
        .replace('...', '')
        .replace(':', '')
        .replace(';', '')
        .replace('(', '')
        .replace(')', '')
        .replace('  ', ' ')
        .trim()
}

module.exports = {
    search,
    findById,
    listAllNames
}
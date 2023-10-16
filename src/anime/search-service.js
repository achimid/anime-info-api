const repository = require('./anime-repository')
const stringSimilarity = require('string-similarity')
// const integrationService = require('../integration/integration-service')


const findById = (id) => repository.findById(id)

const listAllNames = () => repository.listAllNames()

const search = async (query) => {

    // integrationService.process(query)

    const animesFound = await repository.queryByNames(query)
    if (animesFound.length > 0) return sortBestMatch(query, animesFound)

    const bestMatchs = searchSimilarityName(query, [...repository.getAllNames()])

    if (bestMatchs.length == 0) return []

    const animesBestMatchFound = await repository.queryByNames(bestMatchs[0].possibility)
    if (animesBestMatchFound.length > 0) {
        improveFutureSearchName(animesBestMatchFound, query)
        return animesBestMatchFound
    }

    return []
}

const sortBestMatch = (query, animesFound) => {
    const animesAndSimilarities = animesFound.map(anime => {
        const similarities = anime.names.map((name) => stringSimilarity.compareTwoStrings(query.toUpperCase(), name.toUpperCase()))
        similarities.sort((a, b) => {
            if (a.similarity < b.similarity) return 1;
            if (a.similarity > b.similarity) return -1;
            return 0;
        })
        return {
            anime,
            similarity: similarities[0]
        }
    })

    animesAndSimilarities.sort((a, b) => {
        if (a.similarity < b.similarity) return 1;
        if (a.similarity > b.similarity) return -1;
        return 0;
    })

    return animesAndSimilarities.map(a => a.anime)
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

    const simpleStrategy = searchStrategySimple(text, possibilities)

    if (simpleStrategy.length > 0) return simpleStrategy


    const splitStrategy = searchStrategySplitDoubleDot(text, possibilities)
    if (splitStrategy.length > 0) return splitStrategy


    const normalizeStrategy = searchStrategyNormalize(text, possibilities)
    if (normalizeStrategy.length > 0) return normalizeStrategy


    const normalizeNonNumbersStrategy = searchStrategyNormalizeNonNumbers(text, possibilities)
    if (normalizeNonNumbersStrategy.length > 0) return normalizeNonNumbersStrategy

    return []

    // quebrar em palavras
    // quebrar nas virgulas e dois pontos
}

const searchStrategySimple = (text = '', possibilities = [], fn = (s) => s) => {

    const similarities = possibilities.map(possibility => {
        const similarity = stringSimilarity.compareTwoStrings(text.toUpperCase(), fn(possibility).toUpperCase())
        return { similarity, possibility }
    })

    similarities.sort((a, b) => {
        if (a.similarity < b.similarity) return 1;
        if (a.similarity > b.similarity) return -1;
        return 0;
    })

    // const similarityLog = similarities[0].similarity
    // const possibilityLog = fn(similarities[0].possibility)
    // console.log({ similarityLog, possibilityLog })    

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
        .replace('SEASON', '')
        .replace('TEMPORADA', '')
        .replace('DUBLADO', '')
        .replace('DUBLADA', '')
        .replace('LEGENDADO', '')
        .replace('LEGENDADA', '')
        .replace('LEGENDA', '')
        .replace('TMP', '')
        .trim()
}

module.exports = {
    search,
    findById,
    listAllNames,
    sortBestMatch,
    searchSimilarityName,
    searchStrategySimple
}
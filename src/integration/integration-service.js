const clientMAL = require('./client-mal')
const clientJikan = require('./client-jikan')
const clientATC = require('./client-atc')

const { searchSimilarityName, searchStrategySimple } = require('../anime/search-service')

const findBestMatch = async (query) => {


    const bastMatchs = await Promise.all(
        [
            processMAL(query),
            processATC(query),
            processJikan(query),
        ]
    )

    const [bestMatchMAL, bestMatchATC, bestMatchJikan] = bastMatchs

    // console.log(bestMatchJikan, bestMatchATC, bestMatchMAL)

    return {
        mal: bestMatchMAL,
        atc: bestMatchATC,
        jikan: bestMatchJikan
    }

}

const processJikan = async (query) => {
    let bestMatch = ((await clientJikan.search(query, 1)) || [])
    bestMatch = bestMatch.length >= 0 ? bestMatch[0] : undefined

    return bestMatch
}

const processATC = async (query) => {
    const animesATC = await clientATC.getAllAnimes()
    let bestMatch = searchStrategySimple(query, animesATC, (s) => s.title)
    bestMatch = bestMatch.length > 0 ? bestMatch[0].possibility : undefined

    return bestMatch
}

const processMAL = async (query) => {
    const bestMatch = await clientMAL.search(query)

    return bestMatch
}

module.exports = {
    findBestMatch
}
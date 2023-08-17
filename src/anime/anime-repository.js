const Anime = require('./anime-model')

const allNames = new Set()

const findById = (id) => Anime.findById(id)

const listAllNames = () => Anime.find().select('_id, name').sort({name: 1}).lean()

const queryByNames = async (query) => {
    const animes = await Anime.find({$or: [
        { 'names': { $regex: escapeQuery(query), $options: 'i' }},
        { 'name': query}
    ]})
    
    return animes
}

const queryBySynonyms = async (query) => {
    const animes = await Anime.find({ 'synonyms': { $regex: escapeQuery(query), $options: 'i' }})
    
    return animes
}

const escapeQuery = (text = '') => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&").replace(/[']/g, '')
}

const create = (anime) => {    
    anime.names.map(name => allNames.add(name.toUpperCase()))
    anime.synonyms.map(name => allNames.add(name.toUpperCase()))

    return new Anime(anime).save()
}

const update = (anime) => {
    anime.names.map(name => allNames.add(name.toUpperCase()))
    anime.synonyms.map(name => allNames.add(name.toUpperCase()))

    return anime.save()
}

const loadNamesOnMemory = async () => {
    console.log('Carregando nomes na memoria...')

    const allDbNames = await Anime.find().select('names').sort({name: 1}).lean()
    allDbNames.map(({ names = [], synonyms = [] }) => {
        names.filter(a => a).map(name => allNames.add(name.toUpperCase()))
        synonyms.filter(a => a).map(name => allNames.add(name.toUpperCase()))
    })

    console.log(`Carregamento finaliza, foram carregados ${allNames.size} nomes`)
}

loadNamesOnMemory()
// setTimeout(loadNamesOnMemory, 3000)

const getAllNames = () => allNames

module.exports = {
    create,
    update,
    findById,
    getAllNames,
    listAllNames,
    queryByNames,
    queryBySynonyms
}
const Anime = require('./anime-model')

const allNames = new Set()

const findById = (id) => Anime.findById(id)

const findAll = () => Anime.find()

const listAllNames = () => Anime.find().select('_id, name').sort({name: 1}).lean()

const findByName = (name) => Anime.find({name})

const queryByNames = async (query) => {
    const animes = await Anime.find({$or: [
        { 'names': { $regex: escapeQuery(query), $options: 'i' }},
        { 'name': { $regex: escapeQuery(query), $options: 'i' }},
        { 'synonyms': { $regex: escapeQuery(query), $options: 'i' }},
        { 'names': { $regex: query, $options: 'i' }},
        { 'name': { $regex: query, $options: 'i' }},
        { 'synonyms': { $regex: query, $options: 'i' }}
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
    anime.names.map(name => allNames.add(name.trim().toUpperCase()))
    anime.synonyms.map(name => allNames.add(name.trim().toUpperCase()))

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
    findAll,
    findById,    
    findByName,
    getAllNames,
    listAllNames,
    queryByNames,
    queryBySynonyms
}
const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@cluster0.uz6d5.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Persons = mongoose.model('Phonebook', personSchema)

const person = new Persons({
    name: process.argv[3],
    number: process.argv[4],
})

/*person.save().then(result => {
    console.log(`Person saved! ${person.name} ${person.number}`)
    mongoose.connection.close()
})*/

Persons.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})

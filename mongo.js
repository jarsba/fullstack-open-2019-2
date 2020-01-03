const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

console.log(process.argv)

const password = process.argv[2]

const url =
    `mongodb+srv://fullstacker:${password}@fullstack-open-2019-wolma.mongodb.net/puhelinluettelo-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length === 3) {

    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
    
} else if (process.argv.length === 5) {

    let name = process.argv[3]
    let number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(response => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    })
}

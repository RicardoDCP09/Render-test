require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler');
const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
const Phonebook = require('./models/phoneBook')
app.use(express.static('dist'))

morgan.token('post', function (req, res) {
    return JSON.stringify(req.body);
});

app.use((req, res, next) => {
    if (req.method === 'POST') {
        morgan(':method :url :status :response-time ms - :post')(req, res, next);
    } else {
        next();
    }
});

app.get('/api/persons', (request, response) => {
    Phonebook.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/info', (request, response) => {
    const date = new Date()
    Phonebook.find({}).then(persons => {
        response.send(`Phonebook has info for ${Phonebook.length} people <br><br> ${date.toString()}`)
    })
})


app.get('/api/persons/:id', (request, response) => {
    Phonebook.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;


    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const validatePhoneNumber = (phoneNumber) => {
        const regex = /^\d{2,3}-\d+$/;
        return regex.test(phoneNumber);
    };

    if (!validatePhoneNumber(body.number)) {
        return response.status(400).json({ error: 'The number is incorrect' })
    }

    const person = new Phonebook({
        name: body.name,
        number: body.number,
    });

    person.save().then(savedNote => {
        response.json(savedNote)
    })
        .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const validatePhoneNumber = (phoneNumber) => {
        const regex = /^\d{2,3}-\d+$/;
        return regex.test(phoneNumber);
    };

    if (!validatePhoneNumber(body.number)) {
        return response.status(400).json({ error: 'The number is incorrect' })
    }
    const person = ({
        name: body.name,
        number: body.number,
    });
    Phonebook.find({})
        .then(persons => {
            const existingPerson = persons.find(person => person.name === body.name);

            if (existingPerson && existingPerson.number !== body.number) {
                Phonebook.findByIdAndUpdate(
                    existingPerson._id,
                    { number: body.number },
                    { new: true, runValidators: true, context: 'query' }

                )
                    .then(updatedPerson => {
                        response.json(updatedPerson);
                    })
                    .catch(error => next(error));
            } else {
                response.status(400).json({ error: 'La persona ya existe o no hay cambios' });
            }
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    Phonebook.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
app.use(errorHandler)



const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


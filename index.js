/* eslint-disable consistent-return */
require('dotenv').config();

const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const Person = require('./models/person');


app.use(bodyParser.json());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body'));

app.use(cors());

app.use(express.static('build'));

app.get('/', (request, response) => {
    response.send('Hello World!');
});

app.get('/info', (request, response) => {
    Person.find({}).then((persons) => {
        response.send(`Phonebook has info for ${persons.length} people \n\n${new Date(Date.now())}`);
    });
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons.map((person) => person.toJSON()));
    });
});

app.post('/api/persons', (request, response, next) => {
    const { body } = request;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save().then((savedPerson) => {
        response.json(savedPerson.toJSON());
    }).catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person.toJSON());
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
    const { body } = request;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then((updatedPerson) => {
            response.json(updatedPerson.toJSON());
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' });
    } if (error.name === 'ValidationError') {
        return response.status(400).send({ error: `${error.message}` });
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

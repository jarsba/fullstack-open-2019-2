/* eslint-disable consistent-return */
const express = require('express');

const router = express.Router();

let persons = require('./db.json');

const generateId = () => Math.floor(Math.random() * 1000000);

router.get('/', (request, response) => {
    response.send('Hello World!');
});

router.get('/persons', (request, response) => {
    response.json(persons);
});

router.post('/persons', (request, response) => {
    const { body } = request;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        });
    }

    if (persons.filter((person) => person.name === body.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique',
        });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    };

    persons = persons.concat(person);

    response.json(persons);
});

router.get('/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);

    if (!person) {
        return response.status(404).json({
            error: 'person not found',
        });
    }

    response.json(person);
});

router.delete('/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
});

module.exports = router;

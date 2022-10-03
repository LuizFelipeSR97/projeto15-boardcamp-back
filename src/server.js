import express from 'express';
import pg from 'pg';
import joi from 'joi';
import dayjs from 'dayjs';

const {Pool} = pg;

const user = 'postgres';
const password = '1401';
const host = 'localhost';
const port = 5432;
const database = 'boardcamp';

const connection = new Pool({
    user,
    password,
    host,
    port,
    database
  });

const app = express();
app.use(express.json());

// Schemas

const categoriesSchema = joi.object({
    name: joi.string().min(1).required()
});

const gamesSchema = joi.object({
    name: joi.string().min(1).required(),
    stockTotal: joi.number().min(1).required(),
    pricePerDay: joi.number().min(1).required(),
    categoryId: joi.number().required(),
});

const customersSchema = joi.object({
    name: joi.string().min(1).required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().min(11).max(11).required(),
    birthday: joi.string().required()    
});




// Fazer as validations do schema

// Passar as conexoes pra dentro do try

// Colocar os await dentro das funcoes async





// Rota /categories

app.get('/categories', async (req, res) => {
  connection.query('SELECT * FROM categories').then(cat => {
    res.send(cat.rows);
  });
});

app.post('/categories', async (req, res) => {

    const category = req.body.name;

    if (!category || category===""){
        res.sendStatus(400)
        return
    }

    // Fazer a conferencia se a categoria ja existe

    try {
        const request = connection.query(`insert into categories (name) values (${category})`)
        res.sendStatus(201)
        return
    } catch(err) {
        res.sendStatus(500)
    };
  });

// Rota /games

app.post('/games', async (req, res) => {

    const {name, image,stockTotal,categoryId,pricePerDay} = req.body;

    if (name==="" || stockTotal<1 || pricePerDay<1){

            // Fazer a conferencia se a categoryId passada realmente existe

        res.sendStatus(400);
        return
    }

    // Fazer a conferencia se o nome já existe
        // Retornar o status 409

    try {

        const request = connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`,[name, image, stockTotal, categoryId, pricePerDay])
        res.sendStatus(201)
        return

    } catch(err) {

        res.status(500).send(err.message)

    };
  });

app.get('/games', async (req, res) => {

    let filterName = req.query.name;

    if(filterName){

        filterName = filterName[0].toUpperCase()+filterName.substring(1) + "%";
        connection.query(`SELECT * FROM games WHERE name LIKE $1;`,[filterName]).then(games => {
        res.send(games.rows)
        }) 
        return
    }

    try {

    connection.query('SELECT * FROM games').then(games => {
    res.send(games.rows)}) 

    } catch(err) {

        res.status(500).send(err.message)

    };

});

// Rota /customers

app.get('/customers', async (req, res) => {

    let filterCPF = req.query.cpf;

    if(filterCPF){

        filterCPF = filterCPF + "%";
        connection.query(`SELECT * FROM customers WHERE cpf LIKE $1;`,[filterCPF]).then(cust => {
        res.send(cust.rows)
        }) 
        return
    }

    try {

    connection.query('SELECT * FROM customers').then(cust => {
    res.send(cust.rows)}) 

    } catch(err) {

        res.status(500).send(err.message)

    };

});

app.get('/customers/:id', async (req, res) => {

    let filterId = parseInt(req.params.id);

    if (isNaN(filterId)){
        // Ou se o id nao existe
        res.sendStatus(404)
        return
    }

    try {

    connection.query('SELECT * FROM customers WHERE id = $1;',[filterId]).then(cust => {
    res.send(cust.rows)}) 

    } catch(err) {

        res.status(500).send(err.message)

    };

});

app.post('/customers', async (req, res) => {

    const {name, phone, cpf, birthday} = req.body;

    if (name===""){

            // Fazer a conferencia se cpf é string de 11 numeros
            // Fazer a conferencia se phone é string de 10 ou 11 numeros
            // Fazer a conferencia se birthday é uma data valida

        res.sendStatus(400);
        return
    }

    // Fazer a conferencia se o cpf já existe
        // Retornar o status 409

    try {

        const request = connection.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,[name, phone, cpf, birthday])

        res.sendStatus(201)
        return

    } catch(err) {

        res.status(500).send(err.message)

    };
  });

app.put('/customers/:id', async (req, res) => {

    let id = req.params.id
    id = parseInt(id)

    const {name, phone, cpf, birthday} = req.body;

    if (name===""){

            // Fazer a conferencia se cpf é string de 11 numeros
            // Fazer a conferencia se phone é string de 10 ou 11 numeros
            // Fazer a conferencia se birthday é uma data valida

        res.sendStatus(400);
        return
    }

    // Fazer a conferencia se o cpf já existe
        // Retornar o status 409

    try {

        const request = connection.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,[name, phone, cpf, birthday, id])

        res.sendStatus(200)
        return

    } catch(err) {

        res.status(500).send(err.message)

    };
});

// Rota rentals

app.get('/rentals', async (req, res) => {

    // Incompleto

    let filterCustomerId = req.query.customerId;
    let filterGameId = req.query.gameId;

    try {

    if(filterCustomerId){

        connection.query(`SELECT * FROM rentals WHERE customerId = $1;`,[filterCustomerId]).then(rent => {
        res.send(rent.rows)
        }) 
        return
    }

    if(filterGameId){

        connection.query(`SELECT * FROM rentals WHERE gameId = $1;`,[filterGameId]).then(rent => {
        res.send(rent.rows)
        }) 
        return
    }

    connection.query('SELECT * FROM customers').then(cust => {
    res.send(cust.rows)}) 

    } catch(err) {

        res.status(500).send(err.message)

    };

});

app.post('/rentals', async (req, res) => {

    const rentDate = dayjs(Date.now()).format("YYYY-MM-DD");

    let pricePerDay = 2000;
    // Fazer o originalPrice = daysRented * pricePerDay
    // pricePerDay deve vir da tabela games, de acordo com o gameId e o id

    const {customerId, gameId, daysRented} = req.body;

    const originalPrice = daysRented * pricePerDay

    try {

    connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,[customerId, gameId, rentDate, daysRented, null, originalPrice, null])

    res.sendStatus(201)

    } catch(err) {

        res.status(500).send(err.message)

    };

});

//////////

app.listen(4000, ()=>{console.log("Server running on port 4000")});
import express from 'express';
import pg from 'pg';

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

// Fazer o nosso, esse é so exemplo

app.get('/categories', async (req, res) => {
  connection.query('SELECT * FROM categories').then(cat => {
    res.send(cat.rows);
    //res.send(games.rows)
  });
});

// Rota /categories

app.post('/categories', async (req, res) => {

    const category = req.body.name;

    if (!category || category===""){
        res.sendStatus(400)
        return
    }

    // Fazer a conferencia se a categoria ja existe
    // Pegar depois pra ver isso

    /* const existentCategories = await connection.query(`SELECT * FROM categories WHERE name = 'Investigação'`)

    if (existentCategories.rows.length>0){
        res.send("existe")
        return
    } */

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
        const request = connection.query("INSERT INTO games (name, image, stockTotal, categoryId, pricePerDay) VALUES ($1, $2, $3, $4, $5);",[name, image, stockTotal, categoryId, pricePerDay])
        res.sendStatus(201)
        return
    } catch(err) {
        res.sendStatus(500)
    };
  });

////////


/* const query = connection.query('SELECT * FROM customers;'); */

/* query.then(result => {
    console.log(result.rows);
}); */

app.listen(4000, ()=>{console.log("Server running on port 4000")});
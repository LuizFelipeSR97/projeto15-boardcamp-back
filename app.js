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

const query = connection.query('SELECT * FROM customers;');

query.then(result => {
    console.log(result.rows);
});

app.listen(4000, ()=>{console.log("Server running on port 4000")});
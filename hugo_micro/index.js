const express = require('express');
const { Deta } = require('deta');

const deta = Deta('a0hj4n8f_iBqzMWSkYPqZuaaf4EG2fpnrbrVxd6RM');
const db = deta.Base('hugo_base');

const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    var cors = require('cors');
    app.use(cors());
}

const port = process.env.PORT || 3000;

const getPattern = 'SELECT * FROM hugo WHERE id = $1';
const incrementPatternPlays = 'UPDATE hugo SET plays=plays+1 WHERE id = $1 RETURNING plays';
const incrementStats = 'UPDATE stats SET sent=sent+1';
const deletePattern = 'DELETE FROM hugo WHERE id = $1';
const addPattern = 'INSERT INTO hugo(id,pattern,name,plays) VALUES ($1,$2::JSONB,$3,$4)';
var response;

// request pattern
app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await db.get(id);

    if (user) {
        res.json(user);
    } else {
        res.send({ "error": 404 });
    }
});

// increment pattern plays
app.post('/:id', async (req, res) => {
    // const client = new Client({
    //     connectionString
    // });
    // await client.connect();

    // let id = req.params.id;
    // const params = [id];

    // response = await client.query(incrementPatternPlays, params);
    // response != undefined ? response = response.rows[0] : response;

    // if (response == undefined)
    //     res.send({ "error": 404 });
    // else if (response.plays == 3)
    //     await client.query(deletePattern, params);

    // if (id == "every1") {
    //     response.plays *= -1;
    // }

    // client.end();
    // res.send(response);
});

// insert new pattern
app.post('/', async (req, res) => {

    const { name, pattern } = req.body;
    const toCreate = { name, pattern };
    const insertedUser = await db.put(toCreate); // put() will autogenerate a key for us
    
    res.status(201).json(insertedUser);
});

app.listen(port, () => {
    console.log(`Open on port: ${port}`);
});

module.exports = app;
const { Pool, Client } = require("pg");
const express = require('express');
const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  var cors = require('cors');
  app.use(cors());
}

const port = process.env.PORT || 3000;
const connectionString = process.env.DB_URL;

const getPattern = 'SELECT * FROM hugo WHERE id = $1';
const incrementPatternPlays = 'UPDATE hugo SET plays=plays+1 WHERE id = $1 RETURNING plays';
const deletePattern = 'DELETE FROM hugo WHERE id = $1';
const addPattern = 'INSERT INTO hugo(id,pattern,name,plays) VALUES ($1,$2::JSONB,$3,$4)';
var response;

function generateId(length){
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/:id', async (req, res) => {
  const client = new Client({
    connectionString
  });
  await client.connect();

  let id = req.params.id;
  const params = [id];
  
  response = await client.query(getPattern, params);

  response != undefined ? response = response.rows[0] : response;

  if(response == undefined)
    res.send({"error": 404});

  client.end();
  res.send(response);
});

app.post('/:id', async (req, res) => {
  const client = new Client({
    connectionString
  });
  await client.connect();

  let id = req.params.id;
  const params = [id];

  response = await client.query(incrementPatternPlays, params);
  response != undefined ? response = response.rows[0] : response;

  if(response == undefined)
    res.send({"error": 404});
  else if(response.plays == 3)
    await client.query(deletePattern, params);

  client.end();
  res.send(response);
});

app.post('/', async (req, res) => {
  const client = new Client({
    connectionString
  });
  
  await client.connect();

  let body = req.body;
  let id = generateId(6);
  let pattern = {"pattern": body.pattern};
  let name = body.name;
  let params = [id,pattern,name,0];

  for(let i = 0;;i++){
    try {
      await client.query(addPattern, params);
      response = {"id": params[0]};

      break;
    } catch (error) {
      params[0] = generateId(6);
    }
  }
  
  client.end();
  res.send(response);
});

app.listen(port, () => {
  console.log(`Open on port: ${port}`);
});
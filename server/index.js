/* eslint-disable no-return-assign */
const path = require('path');
const express = require('express');
const { getTop100By } = require('./Api/api');

const { User } = require('./database/index');

const app = express();
const CLIENT_PATH = path.resolve(__dirname, '../client/dist');
app.use(express.static(CLIENT_PATH));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 8085;

app.get('/', (req, res) => {
  console.log('here');
  res.send();
});
// Receives request for unique netflix programs
// makes call to api for each country, returns data to
// server which then uses ServerFunc to manipulate and then returns manipulated data back to client
app.get('/findUnique', async (req, res) => {
  const { origin, destination } = req.query;
  let originArr;
  let destinationArr;

  await getTop100By(origin)
    .then((data) => originArr = data.results)
    .catch((error) => console.error(error));

  await getTop100By(destination)
    .then((data) => destinationArr = data.results)
    .catch((error) => console.error(error));

  // this code takes the destination array and the origin array and returns
  // a newArray of unique items
  const uniqueArray1 = destinationArr
  // eslint-disable-next-line max-len
    .filter((country1) => !originArr.some((country2) => country1.netflix_id === country2.netflix_id));

  res.send(uniqueArray1);
});

//  sequelize.authenticate().then(()=>{console.log("connected")});
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});

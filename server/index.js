/* eslint-disable no-return-assign */
const path = require('path');
const express = require('express');
const { getTop100By, youtubeSearch } = require('./Api/api');
require('dotenv').config();

const { default: axios } = require('axios');

// Authentication Requirements
const session = require('express-session');
const passport = require('passport');
const { initDb } = require('./database');
require('./authentication/auth');
const { SESSION_SECRET } = require('./config');
///

// Authentication Middleware
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
///

const app = express();

// Session Middleware
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Authentication Routes
// 1.A Serves the Login Page
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/authentication/loginPage.html`);
});
// 1.B Serves the Login Page's CSS
app.get('/loginPage.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(`${__dirname}/authentication/loginPage.css`);
});

// 2. Accesses Google
app.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
  }),
);

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

// 3.1 Failure case of 3.0

app.get('/auth/failure', (req, res) => {
  res.send('Something went wrong, unable to authenticate.');
});

// 3.2 Success case of 3.0

// 4. Logout Route
app.get('/logout', (req, res) => {
  req.logout(() => {
    if (req.session) {
      req.session.destroy();
    }
  });
  res.redirect('/');
});
///

const CLIENT_PATH = path.resolve(__dirname, '../client/dist');
app.use(express.static(CLIENT_PATH));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 8090;

// search for youTube Clip
app.post('/search', (req, res) => {
  youtubeSearch(req.body.title).then((data) => {
    const videoIds = data.items.map((item) => item.id.videoId);
    res.send(videoIds[0]);
  });
});
// needed to add this because without it was trying to create
// a new instance without having defined the model
(async () => {
  // Initialize the database and get the User model
  const { User, Movie, UniqueArrays } = await initDb();

  // find one movies from the movie model to get its thumbsUp/Down Data
  app.get('/findMovies', async (req, res) => {
    const { title } = req.query.selectedMovie;
    await Movie.findOne({ where: { movieName: title } }).then((data) => {
      if (data) {
        res.send(data).status(200);
      } else {
        res.send(data).status(200);
      }
    })
      .catch((err) => {
        console.log('ERROR was unable to get all movies: ', err);
      });
  });
  // create movie
  app.post('/Movie', async (req, res) => {
    const { movieName, thumbsUp, thumbsDown } = req.body;

    await Movie.create({ movieName, thumbsUp, thumbsDown }).then((data) => res.send(data));
  });

  app.put('/Movie/UpdateThumbs/', (req, res) => {
    const { movieName, thumbsUp, thumbsDown } = req.body;
    console.log('thumbs', thumbsDown);
    Movie.update({
      thumbsUp,
      thumbsDown,
    }, {
      where: {
        movieName,
      },
      returning: true,
    })
      .then((data) => {
        console.log(data);
        if (data) {
          console.log('updated');
          res.sendStatus(200);
        } else {
          console.log('error: ', data);
          res.sendStatus(404);
        }
      })
      .catch((err) => {
        console.error('error data is undefine', err);
        res.sendStatus(500);
      });
  });
  // Gets users for activity feed
  app.get('/users', async (req, res) => {
    await User.findAll({ limit: 20 })
      .then((data) => res.send(data))
      .catch((error) => {
        console.error('Error in UserObject');
        res.send(error);
      });
  });

  // Use the User model in your app.post('/User') route to create new
  // User
  app.post('/User', async (req, res) => {
    const { userName } = req.body;
    await User.create({ userName })
      .then((data) => res.send(data))
      .catch((error) => res.send(error));
  });
  // gets the users table to retrieve watchlist object
  app.get('/UserObject', async (req, res) => {
    const { userName } = req.query;
    User.findAll({
      where: {
        userName,
      },
    })
      .then((data) => res.send(data[0].dataValues))
      .catch(((error) => res.send(error)));
  });
  // updating the user watchlist
  app.post('/UserObject', async (req, res) => {
    const { userName, movieList } = req.body;
    User.update({
      movieList,
    }, {
      where: {
        userName,
      },
      returning: true,
    })
      .then((data) => {
        console.log(data);
        if (data) {
          console.log('updated');
          res.sendStatus(200);
        } else {
          console.log('error: ', data);
          res.sendStatus(404);
        }
      })
      .catch((err) => {
        console.error('error data is undefine', err);
        res.sendStatus(500);
      });
  });
  // Receives request for unique netflix programs
  // makes call to api for each country, returns data to
  // server which then uses ServerFunc to manipulate and then
  // returns manipulated data back to client
  app.get('/findUnique', async (req, res) => {
    const { origin, destination } = req.query;
    let originArr;
    let destinationArr;
    const keyCode = `${origin}${destination}`;
    // adds a check to see if data was sent
    let dataSent = false;
    // check if the search has already been made and is recorded into db
    await UniqueArrays.findOne({ where: { keyCode } }).then((data) => {
      const now = Date.now();

      const month = 2629746000;
      //  if you want to test that the timing use
      // const created = now - month - month;
      // if data exists and is less then a month old
      if (data) {
        const created = Date.parse(data.createdAt);
        if ((now - created) < month) {
          console.log(Date.parse(data.createdAt));
          console.log('yes');
          dataSent = true;
          return res.send(data);
        }
      }
    }).catch((err) => {
      console.error('ERROR was unable to get all movies: ', err);
    });

    const startArray = [100, 200, 300, 400];
    // these are all calls to the API
    await getTop100By(origin, 0)
      .then((data) => originArr = data.results)
      .catch((error) => console.error(error));

    await Promise.all(startArray.map((start) => getTop100By(origin, start)
      .then((data) => originArr = originArr.concat(data.results))
      .catch((error) => console.error(error))));

    await getTop100By(destination, 0)
      .then((data) => destinationArr = data.results)
      .catch((error) => console.error(error));

    await Promise.all(startArray.map((start) => getTop100By(destination, start)
      .then((data) => destinationArr = destinationArr.concat(data.results))
      .catch((error) => console.error(error))));

    // this code takes the destination array and the origin array and returns
    // a newArray of unique items
    const uniqueArray1 = destinationArr
    // eslint-disable-next-line max-len
      .filter((country1) => !originArr.some((country2) => country1.netflix_id === country2.netflix_id));
    // bc data does not exists in db create new entry and return the data to client
    if (!dataSent) {
      try {
        const createdUniqueArray = await UniqueArrays.create({
          keyCode,
          uniqueArray: uniqueArray1,
        });
        console.log('no');
        res.send(createdUniqueArray);
      } catch (error) {
        console.error('Error while creating unique array:', error);
        res.status(500).send(error);
      }
    }
  });
  // successRedirect: '/protected',
  // 3.0 Returns to Client
  // app.get(
  //   '/google/callback',
  //   passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  //   async (req, res) => {
  //     const userName = req.user.displayName;
  //     await User.findOrCreate({
  //       where: { userName },
  //       defaults: { userName },
  //     }).then((data) => console.log(data));
  //     try {
  //       res.redirect(`/index.html?userName=${encodeURIComponent(userName)}`);
  //     } catch {
  //       console.log('userName posting error!');
  //       res.status(500).send('userName posting error!');
  //     }
  //   },
  // );

  app.get('/protected', isLoggedIn, async (req, res) => {
    const userName = req.user.displayName;
    await User.findOrCreate({
      where: { userName },
      defaults: { userName },
    }).then((data) => console.log(data));
    try {
      res.redirect(`/index.html?userName=${encodeURIComponent(userName)}`);
    } catch {
      console.log('userName posting error!');
      res.status(500).send('userName posting error!');
    }
  });
})();

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});

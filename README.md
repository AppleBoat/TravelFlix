# TravelFlix

## Elevator Pitch
- An app for international travelers that lets them find, preview, and curate media watchlists for their trips
- Simple interface allows users to select an origin and destination, and quickly view new shows and movies at their destination
- Users can watch trailers, rate movies, and curate a watch list
- Users can see what others are watchlisting in the live feed
- Fight boredom with Travelflix!
# Tech Stack
Project Management Software: Trello, Figma
Deployment: AWS (EC2 Ubuntu)
Front End: React (Style Lib: MUI)
Server: Express
Database: mySQL / Sequelize
Auth: Passport-OAuth2
APIs: Rapid Api, uNoGS API Documentation:https://rapidapi.com/unogs/api/unogs, Google Cloud Youtube API

Linting: ESLint / AirBnB
MUI https://mui.com/
React Icons

Contact Info
report issues and ask questions via Github Issues @ https://github.com/AppleBoat/TravelFlix/issues

## How to Start (for Devs)

- run `npm install` to make sure to have needed dependencies installed
- All versions in package.json are "approximately equivalent to" (~) so if major releases are not aligned, you will need to `npm-check-update` or something to that effect.
- enter `sudo service mysql start` (bash) or `mysql.server start` (mac) to start database in bash terminal
- enter mysql shell: `mysql -u root` && `CREATE DATABASE dbstrology`
- make sure `seeder()` is being invoked in /server/index.js --> app.listen anonymous function only when you set up the server or want a clean database
- after creating the "seed" database remove the 'seeder()' function from the app.listen function.
- remove _example_ from .env file and enter required keys which are created at https://console.cloud.google.com/apis/credentials
- `npm run build` && `npm run dev` in terminal to run webpack and start the express server respectively
- visit http://localhost:8080/ to see served page


Clients Comments


Known Bugs:
1: issue with some of the regEx in programs names
2: stupid Bojack show wont go away
3: small error with check where second item sometimes arrives checked
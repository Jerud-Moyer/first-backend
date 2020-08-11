require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const request = require('superagent');



app.use(cors());
app.use(express.static('public'));

const {
    GEOCODE_API_KEY,
    MOVIE_API_KEY,
} = process.env;

function getWeather(lat, lon) {
    const data = weatherData.data;
    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };
    });
    return forecastArray;
}

async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);
    const city = response.body[0];
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

async function mungeMovies(cityName) {
    const data = await request.get(`http://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${cityName}`);
    const movies = data.body.results;
    const mungedMovies = movies.map((movie) => {
        return {
            title: movie.original_title,
            release: movie.release_date
        };
    });
    return mungedMovies;
}

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    });

app.get('/weather', (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = getWeather(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });

    }
        
    });

    app.get('/Movies', async(req, res) => {
        try {
        const userInput = req.query.search;
        const movies = await mungeMovies(userInput);
        res.json(movies);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
        
    });
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

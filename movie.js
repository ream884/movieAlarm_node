const cheerio = require("cheerio")
const request = require("request")

const movieUrl = "http://www.cgv.co.kr/movies/pre-movies.aspx"

function getMoviesOneDayBeforeRelease() {
    return new Promise((resolve, reject) => {
        request(movieUrl, (error, res, body) => {
            let movieTitles = []
            
            let html = cheerio.load(body)
            html(".box-contents").map((i, element) => {
                let movieInfo = html(element)
                let dday = movieInfo.find(".dday").text()
    
                if (dday === "D-2") {
                    movieTitles.push(movieInfo.find(".title").text())
                }
            })
    
            resolve(movieTitles)
        })
    })
}

exports.getMovieTitles = function() { 
    return getMoviesOneDayBeforeRelease()
}
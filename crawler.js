const request = require("request");
const cheerio = require("cheerio");

let movieList = [];

function crawlingMovie(url) {
  request(url, (err, res, body) => {
    const $ = cheerio.load(body);
    const movie = $(".box-contents");

    movie.each(function (i, element) {
      const movieInfo = $(element);
      const dday = movieInfo.find(".dday").text();

      if (dday === "D-1") {
        movieList.push(movieInfo.find(".title").text());
      }
    });
  });
}

module.exports = {
  crawlingMovie,
  getMovieList: () => movieList,
  clearMovieList: () => (movieList = []),
};

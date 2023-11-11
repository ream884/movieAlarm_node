const http = require("http")
const scheduler = require("node-schedule")
const movie = require("./movie")

async function sendMovieMessage() {
    let movieTitles = await movie.getMovieTitles()
}

const server = http.createServer((req, res) => {
    res.writeHead(200,{'Content-Type':'text/html'})
    res.end('Hello World !@#$')
})

server.listen(3000, () => {
    console.log("server is running...")

    scheduler.scheduleJob("0/5 * * * * *", () => {
        sendMovieMessage()
    })
})
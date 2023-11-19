const http = require("http")
const scheduler = require("node-schedule")
const movie = require("./movie")
const message = require("./message")

async function sendMovieMessage() {
    let movieTitles = await movie.getMovieTitles()

    message.sendMovieInfo(movieTitles.join())
}

const server = http.createServer(async (req, res) => {
    res.writeHead(200,{'Content-Type':'text/html'})
    res.end('Hello World !@#$')
})

server.listen(3000, () => {
    console.log("server is running...")

    scheduler.scheduleJob("0/5 * * * * *", () => {
        sendMovieMessage()
    })
})

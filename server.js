const fs = require("fs")
const http = require("http")

const server = http.createServer((req, res) => {
    if (fs.existsSync(`.${req.url}`))
        res.write(fs.readFileSync(`.${req.url}`) || null)
    res.end()
})

server.listen(4040, () => {
    console.log("listening on port 4040")
})
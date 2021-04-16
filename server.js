const fs = require("fs")
const http = require("http")

const public = "./public"
var port = process.env.PORT || 4040

const server = http.createServer((req, res) => {
    if (fs.existsSync(`./public/${req.url}`)) {
        res.write(fs.readFileSync(`./public/${req.url}`) || null)
        return res.end()
    } else {
        res.writeHead(404, "Not found.")
        return res.end(`<h1>404 - Not Found.</h1> <b>${req.url}</b> was not found.`)
    }

})

server.listen(port, () => {
    console.log("listening on port", port)
})
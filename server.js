const fs = require("fs")
const http = require("http")

const public = "./public"
var port = process.env.PORT || 4040

const server = http.createServer((req, res) => {
    const url = `./public/${req.url}`
    fs.access(url, fs.constants.R_OK, (err) => {
        if (err) {
            console.error(err)
            res.writeHead(403, "Forbidden.")
            return res.end(`<h1>403 - Forbidden.</h1> You are forbidden to access <b>${req.url}</b>.`)
        } else {
            if (fs.existsSync(url)) {
                res.write(fs.readFileSync(url) || null)
                return res.end()
            } else {
                res.writeHead(404, "Not found.")
                return res.end(`<h1>404 - Not Found.</h1> <b>${req.url}</b> was not found.`)
            }
        }
    })
})

server.listen(port, () => {
    console.log("listening on port", port)
})
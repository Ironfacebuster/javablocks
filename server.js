const fs = require("fs")
const http = require("http")

const public = "./public"
var port = process.env.PORT || 4040

const server = http.createServer((req, res) => {
    const url = `./public${req.url}`
    console.log(url)
    if (url == "./public/") {
        res.write("<h1>Index</h1>hello :)")
        return res.end()
    }

    if (fs.existsSync(url)) {
        res.write(fs.readFileSync(url) || null)
        return res.end()
    } else {
        res.writeHead(404, "Not found.")
        return res.end(`<h1>404 - Not Found.</h1> <b>${req.url}</b> was not found.`)
    }
})

server.listen(port, () => {
    console.log("listening on port", port)
})

function ScanDirectory(dir) {
    var obj = {}
    fs.readdirSync(dir).forEach(d => {
        if (fs.lstatSync(dir + "/" + d).isDirectory()) {
            obj[d] = ScanDirectory(dir + "/" + d)
        } else obj[d] = fs.readFileSync(dir + "/" + d)
    })
    return obj
}

var directories = ScanDirectory(public)
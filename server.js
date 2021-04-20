/*
 *   Copyright (c) 2021 William Huddleston
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

const fs = require("fs")
const http = require("http")

const public = "./public"
var port = process.env.PORT || 25565

const server = http.createServer((req, res) => {
    const url = `./public${req.url}`
    console.log(url)
    if (url == "./public/") {
        res.write(fs.readFileSync("./public/html/directory.html"))
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
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
var port = process.env.PORT || 4040

var directories = ScanDirectory(public)
console.log(directories)
const root_html = GetDirectoryHTML(directories)

const server = http.createServer((req, res) => {
    const url = `./public${req.url}`
    console.log(url)
    if (url == "./public/") {
        res.write(root_html)
        return res.end()
    }

    try {
        if (fs.existsSync(url)) {
            res.write(fs.readFileSync(url) || null)
            return res.end()
        } else {
            res.writeHead(404, "Not found.")
            return res.end(`<h1>404 - Not Found.</h1> <b>${req.url}</b> was not found.`)
        }
    } catch (err) {
        res.writeHead(500, "Internal Server Error.")
        return res.end(`<h1>500 - Internal Server Error.</h1> What did you do this time?`)
    }
})

server.listen(port, () => {
    console.log("listening on port", port)
})

function ScanDirectory(dir, root) {
    root = root || ""
    var directory = {}

    const n_root = root == "" ? dir : root + "/" + dir

    directory[dir] = {
        root: n_root.slice(public.length),
        files: []
    }

    fs.readdirSync(n_root).forEach(file => {
        const loc = n_root + "/" + file
        if (fs.lstatSync(loc).isDirectory()) {
            directory[dir].files.push(ScanDirectory(file, n_root)[file])
        } else directory[dir].files.push({
            root: n_root.slice(public.length),
            name: file,
            data: fs.readFileSync(loc)
        })
    })

    return directory
}

function GetDirectoryHTML(directory) {
    var html = `<head><title>Index</title> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon.png"> <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"> <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"> <link rel="manifest" href="/site.webmanifest"> <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"> <meta name="msapplication-TileColor" content="#2b5797"> <meta name="theme-color" content="#ffffff"><style>body{padding-left: 15px; font-family: monospace;}div{margin-top: 5px; margin-bottom: 10px;}div div{display: block; margin-left: 25px;}div a{display: block; width: fit-content;}</style></head><body><h1>Index</h1><h4>hello :)</h4>`

    var body = ""

    Object.keys(directory).forEach(d => {
        body = body + DirectoryToHTML(directory[d])
    })

    return html + body + "</body>"
}

function DirectoryToHTML(directory, looped, dir) {
    looped = false || looped

    var new_name = directory.root || ""
    if (looped) new_name = new_name.slice(dir.length)

    var body = new_name + "<div>"
    console.log("DIRECTORY", new_name)

    directory.files = directory.files.sort((a, b) => {
        if (a.hasOwnProperty("name") && !b.hasOwnProperty("name")) return 1
        if (b.hasOwnProperty("name") && !a.hasOwnProperty("name")) return -1
        if (!b.hasOwnProperty("name") && !a.hasOwnProperty("name")) return 1
        return a.name.localeCompare(b.name)
    })

    directory.files.forEach(file => {
        if (file.hasOwnProperty("files")) {
            file.files = file.files.sort((a, b) => {
                if (a.hasOwnProperty("name") && !b.hasOwnProperty("name")) return 1
                if (b.hasOwnProperty("name") && !a.hasOwnProperty("name")) return -1
                return a.name.localeCompare(b.name)
            })
            body = body + DirectoryToHTML(file, true, directory.root)
        } else {
            if (file.name == "index.html") {
                body = body + `<a href="${file.root || ""}/${file.name}" style="display:inline-block">${file.name}</a>`
                body = body + "<span> &#x2B05; go here!</span>"
            } else {
                body = body + `<a href="${file.root || ""}/${file.name}">${file.name}</a>`

            }
        }
    })


    return body + "</div>"
}
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

// file manager!
// for now, all this will handle is saving and loading files

// various optimizations could be made
// in all of the toJSON functions, each object/array must be checked
//      if it's empty, delete the key, for file size reductions.

/**
 * Save the MAIN node manager to a file
 * @param {NodeManager} node_manager 
 */
function SaveWorkspace(node_manager, force) {
    force = force || false
    node_manager = node_manager || Manager // either supplied node manager, or window node manager
    var dat = {
        schema: "1.0",
        states: {
            paused: pause_execution
        },
        type: "WRKSP",
        data: ""
    }

    const compress = {
        manager: node_manager.toJSON(),
        mouse: {
            selected: []
        },
    }

    // eventually save other things, such as:
    // maybe selected nodes?

    // the following have been moved into the NodeManager
    // constants and variables
    // view position
    // view scale

    const compressed = LZString.compressToBase64(JSON.stringify(compress))
    console.log("Compressed to", compressed.length, "bytes.")

    dat.data = compressed
    const string_dat = JSON.stringify(dat)

    const ws_name = "Unnamed Workspace" // get this properly when functionality is added

    const data_size = new Blob([string_dat]).size / 1000000
    console.log("File size: " + data_size + " MB", "(" + (data_size / 5) * 100 + "%)")
    // If the workspace's data is greater than 5 megabytes
    if (data_size > 5 || force == true) {
        // save as external file
        if (confirm("Unfortunately, this Workspace must be saved as a file. Is this ok?"))
            SaveFile(`${ws_name}.ws`, string_dat)
    } else
        // otherwise, save it to localstorage
        localStorage.setItem(ws_name, string_dat)
}

function LoadWorkspaceFromFile(compressed) {
    try {
        SetCursor("wait")

        compressed = JSON.parse(compressed)
        if (!compressed.hasOwnProperty("schema") || !compressed.hasOwnProperty("data")) return alert("Error: this is not a valid workspace!")
        if (!compressed.hasOwnProperty("type") || compressed.type != "WRKSP") return alert("Error: this is not a valid workspace!")

        const decomp = LZString.decompressFromBase64(compressed.data)

        if (!decomp) return alert("Error: malformed file!")

        switch (compressed.schema) {
            case "1.0":
                return LoadWorkspaceSchema1(decomp)
            default:
                alert("Error: this is not a supported schema!")
                return {}
        }
    } catch (err) {
        SetCursor("default")
        alert("Error loading node!")
        console.log(err)
    }
}

function LoadWorkspaceSchema1(ws) {
    ws = JSON.parse(ws)
    // set window manager
    window.Manager = NodeManager.fromJSON(ws.manager)

    CurrentContext = Manager
    context_path[0] = Manager

    UpdateAndDrawNodes()

    // load last selected nodes
    // maybe store just the IDs?
    // Mouse.selected = ws.mouse.selected

    SetCursor("default")
}

function SaveNode(node) {
    if (node.internal || node.default) return
    var n = node.toJSON()

    // remove connections
    delete (n.output_connections)
    // delete position, but preserve scale
    delete (n.position)

    var dat = {
        schema: "1.0",
        type: "NODE",
        data: ""
    }

    const compressed = LZString.compressToBase64(JSON.stringify(node))
    console.log("Compressed to", compressed.length, "bytes.")

    dat.data = compressed

    SaveFile(n.name + ".node", JSON.stringify(dat))
}

function LoadNodeFromFile(compressed) {
    try {
        compressed = JSON.parse(compressed)
        if (!compressed.hasOwnProperty("schema") || !compressed.hasOwnProperty("data")) return alert("Error: this is not a valid node file!")
        if (!compressed.hasOwnProperty("type") || compressed.type != "NODE") return alert("Error: this is not a valid node file!")

        const decomp = LZString.decompressFromBase64(compressed.data)
        // console.log(decomp)
        if (!decomp) return alert("Error: malformed file!")

        switch (compressed.schema) {
            case "1.0":
                return LoadNodeSchema1(decomp)
            default:
                alert("Error: this is not a supported schema!")
                return {}
        }
    } catch (err) {
        alert("Error loading node!")
        console.log(err)
    }
}

function LoadNodeSchema1(decomp) {

    const parsed = JSON.parse(decomp)
    console.log(parsed)

    var node = Node.fromJSON(parsed, CurrentContext)

    node.position = {
        x: node.scale.x,
        y: node.scale.y
    }

    node.id = GenerateID(16)

    UpdateAndDrawNodes()

    return node
}

function SaveFile(filename, data) {
    console.log("Saving data as", filename)
    var a = document.createElement("a")
    a.style.display = "none"
    a.setAttribute("download", filename)
    a.setAttribute("href", "data:application/octet-stream," + data)
    document.body.appendChild(a)
    a.click()

    a.remove()
}

const nodeSelector = document.getElementById('node-selector')
nodeSelector.addEventListener('change', (event) => {
    const fileList = event.target.files
    const file = fileList[0]

    const reader = new FileReader()

    reader.onload = function () {
        // console.log(reader.result)
        LoadNodeFromFile(reader.result)

        nodeSelector.value = null
    }

    reader.readAsText(file)
})
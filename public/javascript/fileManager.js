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

    var node = LoadNode(parsed)
    node.position = {
        x: node.scale.x,
        y: node.scale.y
    }

    UpdateAndDrawNodes()

    return node
}

function LoadNode(data, loadID, context, parent) {
    context = context || CurrentContext
    parent = parent || null
    loadID = loadID || false

    const json = data

    var n = context.CreateNode(json.name, json.description)
    if (loadID)
        n.id = json.id
    n.scale = json.scale
    n.accent = new Color(json.accent.r, json.accent.g, json.accent.b, json.accent.a)
    n.position = json.hasOwnProperty("position") ? json.position : {
        x: n.scale.x,
        y: n.scale.y
    }

    n.context = context

    if (json.internal && parent) {
        n.internal_type = json.internal_type
        n.internal = true
        n.parent = parent
    }

    const prev_context = CurrentContext

    // assign inputs and outputs
    Object.keys(json.inputs).forEach(key => {
        var input = n.AddInput(key, CreateAnyInput())
        input.position = json.inputs[key].position || undefined
        input.id = json.inputs[key].id
    })
    Object.keys(json.outputs).forEach(key => {
        var output = n.AddOutput(key, CreateAnyOutput())
        output.position = json.outputs[key].position || undefined
        output.id = json.outputs[key].id
    })

    if (json.hasOwnProperty("InternalManager")) {
        // load internal manager stuff
        const c = json.InternalManager.bg_color
        n.InternalManager.background_color = new Color(c.r, c.g, c.b, c.a)

        CurrentContext = n.InternalManager

        var loaded_internal = 0

        // retain IDs for internal connections
        const nodes = json.InternalManager.nodes

        var internal_connections = []

        if (nodes.length > 0)
            nodes.forEach(node => {
                if (node.default) {

                    if (!node_types.hasOwnProperty(node.default_type)) return console.log("UKNOWN TYPE", node.default_type)

                    var default_node = node_types[node.default_type]()

                    default_node.position = node.position
                    default_node.scale = node.scale
                    default_node.id = node.id

                    if (node.hasOwnProperty("selections"))
                        Object.keys(node.selections).forEach(key => {
                            console.log(node.selections[key])
                            default_node.inputs[key].SetSelection(node.selections[key])
                        })
                } else {
                    var loaded = LoadNode(node, true, n.InternalManager, n)

                    // update this to use the built in CreateInternalInput/Output nodes
                    if (node.internal) {
                        if (node.internal_type == "INPUT") n.internal_inputs = loaded
                        if (node.internal_type == "OUTPUT") n.internal_outputs = loaded
                        loaded_internal++
                    }
                }

                if (node.hasOwnProperty("output_connections")) internal_connections = internal_connections.concat(node.output_connections)
            })

        internal_connections.forEach(connection => {
            var origin = CurrentContext.GetNode(connection.origin.node),
                endpoint = CurrentContext.GetNode(connection.endpoint.node)

            var con1 = origin.outputs[connection.origin.output],
                con2 = endpoint.inputs[connection.endpoint.input]

            con1.connections.push(con2)
            con2.connections.push(con1)

            UpdateNodePositions(origin)
            UpdateNodePositions(endpoint)
        })

        if (loaded_internal == 2) {
            n.InternalManager.internal_nodes_created = true
        }

        UpdateNodePositions(n)

        CurrentContext = prev_context
    }

    return n
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
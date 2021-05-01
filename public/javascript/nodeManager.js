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



var nodes = []

class NodeManager {
    background_color = new Color(58, 65, 82)
    nodes = []

    view = {
        position: {
            x: 0,
            y: 0
        },
        scale: 0
    }

    VariableManager

    constructor() {
        this.VariableManager = new VariableManager()
        this.nodes = []
    }

    CreateNode(name, description) {
        var node = new Node(this)
        node.SetName(name).SetDescription(description)

        // NodeManager keeps track of this node.
        this.nodes.push(node)

        if (log.node.creation)
            console.log(`Created node (id ${node.id})`)

        return node
    }

    GetNodes() {
        // sort nodes by z index
        this.nodes = this.nodes.sort((a, b) => {
            return b.zindex - a.zindex
        })
        return [].concat(this.nodes)
    }

    GetNode(id) {
        const index = this.nodes.findIndex((n) => {
            return n.id == id
        })
        return this.nodes[index]
    }

    DeleteNode(id) {
        var nodes = this.nodes

        var index = nodes.findIndex((n) => {
            return n.id == id
        })

        if (index == -1) {
            if (log.node.deletion) console.log(`Attempted to delete non-existant node (id ${id})`)
            return
        }

        var node = this.GetNode(id)
        if (node.internal) return

        // clean up connections
        Object.keys(node.inputs).forEach((i) => {
            this.RemoveInputConnections(node.inputs[i])
        })
        Object.keys(node.outputs).forEach((o) => {
            this.RemoveOutputConnections(node.outputs[o])
        })

        if (index == 0) nodes.shift()
        else if (index == nodes.length - 1) nodes.pop()
        else nodes.splice(index, 1)

        if (log.node.deletion) console.log(`Deleted node (id ${id})`)
    }

    BatchDelete(array) {
        console.log("BATCH DELETING", array.length)
        while (array.length > 0) {
            const node = array.pop()
            if (typeof this.GetNode(node.id) != "undefined")
                this.DeleteNode(node.id)
        }
    }

    RemoveInputConnection(input, output) {
        this.RemoveOutputConnection(output, input)
    }

    RemoveInputConnections(input) {
        // a wrapper for RemoveOutputConnection
        if (!input.hasOwnProperty("connections") || input.connections.length == 0) return

        // inputs can only have one connection, so it's safe to assume index zero will be the the connection
        var output = input.connections[0]

        this.RemoveOutputConnection(output, input)
    }

    RemoveOutputConnection(output, input) {
        if (!output.hasOwnProperty("connections") || output.connections.length == 0) return

        var index = output.connections.findIndex((c) => {
            return c.id == input.id
        })
        // if the output has more than one connection, the index to be removed is not zero, and is less than the total amount
        if (output.connections.length > 1 && index > 0 && index < output.connections.length - 1)
            output.connections.splice(index, 1)
        // if the index is zero, shift out the first connection
        else if (index == 0) output.connections.shift()
        // if the index is the last item, pop it
        else if (index == output.connections.length - 1) output.connections.pop()
        // if this connection is the last in the array, set the array to be empty
        else if (output.connections.length == 1) output.connections = []

        if (!input.hasOwnProperty("connections") || input.connections.length == 0) return
        // since inputs can only have one connection, clear the input's connections
        input.connections = []
        // set the end connection's default value
        input.value = input.default_value
        // call "execute" if it has it
        if (input.hasOwnProperty("execute"))
            Schedule.Schedule(input)
    }

    RemoveOutputConnections(output) {
        if (!output.hasOwnProperty("connections") || output.connections.length == 0) return

        output.connections.forEach(c => {
            c.connections = []
        })

        output.connections = []
    }

    toJSON() {
        var json = {
            bg_color: this.background_color,
            view: this.view,
            variables: this.VariableManager
        }
        // convert this nodemanager to a JSON object
        if (this.nodes.length > 0) json.nodes = []
        this.nodes.forEach(node => {
            json.nodes.push(node.toJSON())
        })

        return json
    }

    /**
     * Convert a JSON object to a NodeManager
     * @param {Object} object JSON object
     */
    static fromJSON(object) {
        log.node.creation = false

        var n_manager = new NodeManager()
        n_manager.background_color = new Color(object.bg_color.r, object.bg_color.g, object.bg_color.b)

        CurrentContext = n_manager

        var connections = []

        object.nodes.forEach(node => {
            var n = Node.fromJSON(node, n_manager)

            if (node.hasOwnProperty("output_connections"))
                connections = connections.concat(node.output_connections)
        })

        connections.forEach(connection => {
            var origin = CurrentContext.GetNode(connection.origin.node),
                endpoint = CurrentContext.GetNode(connection.endpoint.node)

            var con1 = origin.outputs[connection.origin.output],
                con2 = endpoint.inputs[connection.endpoint.input]

            con1.connections.push(con2)
            con2.connections.push(con1)

            UpdateNodePositions(origin)
            UpdateNodePositions(endpoint)
        })

        n_manager.VariableManager = new VariableManager(object.variables.variables, object.variables.constants)

        log.node.creation = true

        return n_manager
    }
}

class Node {
    context
    InternalManager
    type = "Node"
    id = "no id"
    name = "Unnamed Node"
    description = "An empty node."
    default = false
    internal = false
    position = {
        x: 0,
        y: 0
    }
    scale = {
        x: 170,
        y: 25
    }
    inputs = {}
    outputs = {}
    accent
    zindex = 0
    dirty = true

    constructor(context) {
        if (!context) throw new Error("Node constructor requires NodeManager context!")

        this.zindex = context.GetNodes().length > 0 ? context.GetNodes()[0].zindex + 1 : 0, this.context = context
        this.id = GenerateID(16)
        this.InternalManager = new NodeManager()
        this.SetAccent("ffffff")

        this.execute = (finished) => {
            finished = finished || []
            if (finished.indexOf(this.id) != -1) return
            finished.push(this.id)

            if (!this.InternalManager.hasOwnProperty("internal_nodes_created")) return

            // go through internal nodes and check for default nodes with no inputs
            this.InternalManager.GetNodes().forEach(node => {
                if (Object.keys(node.GetNonSelectionInputs()).length == 0 && Object.keys(node.GetOutputs()).length >= 1) {
                    Schedule.Schedule(node, finished)
                }
            })

            // pass through inputs to internal_inputs
            Object.keys(this.inputs).forEach(n => {
                var value = this.inputs[n].value
                this.internal_inputs.outputs[n].value = value

                // pass values, and execute connections
                this.internal_inputs.outputs[n].connections.forEach(con => {
                    con.value = value
                    Schedule.Schedule(con.parent, finished)
                })
            })

            // pass through internal_outputs to outputs
            Object.keys(this.outputs).forEach(n => {
                var value = this.internal_outputs.inputs[n].value
                this.outputs[n].value = value

                // execute outside output connections
                this.outputs[n].connections.forEach(con => {
                    con.value = value
                    Schedule.Schedule(con.parent, finished)
                })
            })

            // Object.keys(this.outputs).forEach(name => {
            //     const output = this.outputs[name]
            //     console.log(output.connections)
            //     // console.log(this.outputs)
            // })
        }
        // make sure reference to this isn't lost
        this.execute.bind(this)
    }

    AddInput(title, input) {
        title = IterateUntilFree(title, this.inputs)
        input.parent = this
        this.inputs[title] = input
        return this.inputs[title]
    }

    AddOutput(title, output) {
        title = IterateUntilFree(title, this.outputs)
        output.parent = this
        this.outputs[title] = output
        return this.outputs[title]
    }

    isDirty() {
        return this.dirty
    }

    BringToFront() {
        if (!this.context) return

        const front = this.context.GetNodes()[0]

        if (front.id != this.id) {
            this.zindex = front.zindex + 1
        }
    }

    MarkDirty(dirty) {
        dirty = dirty || true
        this.dirty = dirty
    }

    GetName() {
        return this.name
    }

    GetFullName() {
        return `${this.name} [${this.id}]`
    }

    GetInputs() {
        return this.inputs
    }

    GetInput(id) {
        var res = undefined
        Object.keys(this.inputs).every(key => {
            // console.log(this.inputs[key].id, id)
            if (this.inputs[key].id == id) {
                res = {
                    name: key,
                    input: this.inputs[key]
                }
                return false
            }

            return true
        })

        if (!res)
            throw new Error(`${id} is not a valid input ID.`)

        return res
    }

    GetOutputs() {
        return this.outputs
    }

    GetOutput(id) {
        var res = undefined
        Object.keys(this.outputs).every(key => {
            if (this.outputs[key].id == id) {
                res = {
                    name: key,
                    output: this.outputs[key]
                }
                return false
            }

            return true
        })

        if (!res)
            throw new Error(`${id} is not a valid output ID.`)

        return res
    }

    GetNonSelectionInputs() {
        var arr = {}

        Object.keys(this.inputs).forEach(i => {
            if (this.inputs[i].type != "Selection") arr[i] = this.inputs[i]
        })

        return arr
    }

    SetContext(context) {
        this.context = context

        return this
    }

    SetName(name) {
        this.name = name || "Unnamed Node"

        return this
    }

    SetDescription(description) {
        this.description = description || "An empty node."
    }

    SetAccent(accent) {
        if (typeof accent == "string") accent = Color.FromHex(accent)
        this.accent = accent

        this.InternalManager.background_color = this.accent.divide(10)

        return this
    }

    SetPosition(position) {
        this.position = position

        return this
    }

    SetScale(scale) {
        this.scale = scale

        return this
    }

    Duplicate() {
        // create duplicate of this node
        var clone = new Node(this.context)

        clone.name = this.name + ""
        clone.description = this.description + ""
        clone.position = {
            x: this.position.x + 0,
            y: this.position.y + 0
        }
        clone.scale = {
            x: this.scale.x + 0,
            y: this.scale.y + 0
        }
        clone.SetAccent(this.accent)
        clone.execute = this.execute

        // duplicate input
        Object.keys(this.inputs).forEach(key => {
            clone.AddInput(key, TypeToInput(this.inputs[key].type)(this.inputs[key].default_value))
        })
        // duplicate outputs
        Object.keys(this.outputs).forEach(key => {
            clone.AddOutput(key, TypeToOutput(this.outputs[key].type)(this.outputs[key].default_value))
        })

        return clone
    }

    /**
     * Convert this Node to a JSON object.
     */
    toJSON() {
        var json = {
            id: this.id,
            default: this.default,
            internal: this.internal,
            output_connections: [],
            position: this.position || {
                x: 0,
                y: 0
            },
            scale: this.scale || {
                x: 0,
                y: 0
            }
        }

        // add keys if NOT default
        if (!this.default) {
            json.name = this.name
            json.description = this.description
            json.accent = this.accent
            json.inputs = {}
            json.outputs = {}
        } else {
            json.default_type = this.default_type

            // preserve selection choices

            json.selections = {}

            Object.keys(this.inputs).forEach(key => {
                const input = this.inputs[key]
                if (input.type != "Selection") return

                json.selections[key] = input.selection
            })
        }

        // preserve internal types
        if (this.internal)
            json.internal_type = this.internal_type

        // if this node has internal nodes
        if (this.InternalManager.nodes.length > 0) json.InternalManager = this.InternalManager.toJSON()

        // preserve inputs/outputs and their IDs (for reconstruction later)
        if (Object.keys(this.inputs).length > 0 && !this.default)
            Object.keys(this.inputs).forEach(key => {
                const input = this.inputs[key]
                // initialize this input
                json.inputs[key] = {
                    id: input.id,
                    type: input.type,
                    name: key,
                    direction: input.direction,
                    position: input.position,
                    default_value: input.default_value,
                    value: input.value
                }
            })

        // we really only need to know the output connections
        if (Object.keys(this.outputs).length > 0) {
            Object.keys(this.outputs).forEach(key => {
                const output = this.outputs[key]
                // initialize this output
                if (!this.default)
                    json.outputs[key] = {
                        id: output.id,
                        type: output.type,
                        direction: output.direction,
                        position: output.position,
                        default_value: output.default_value,
                        value: output.value,
                        connections: []
                    }

                output.connections.forEach(con => {
                    json.output_connections.push({
                        origin: {
                            node: output.parent.id,
                            output: key
                        },
                        endpoint: {
                            node: con.parent.id,
                            input: con.parent.GetInput(con.id).name
                        },
                        direction: con.direction
                    })
                })
            })
        }

        return json
    }

    /**
     * Convert JSON to a Node
     * @param {Object} object JSON object
     */
    static fromJSON(object, context, parent) {
        parent = parent || null

        var loadID = false
        if (object.hasOwnProperty("id")) loadID = true

        if (object.default) {
            if (!node_types.hasOwnProperty(object.default_type)) return console.log("UKNOWN TYPE", object.default_type)

            var default_node = node_types[object.default_type]()

            default_node.position = object.position
            default_node.scale = object.scale
            default_node.id = object.id

            if (object.hasOwnProperty("selections"))
                Object.keys(object.selections).forEach(key => {
                    default_node.inputs[key].SetSelection(object.selections[key])
                })

            return default_node
        }

        const json = object

        var n = context.CreateNode(json.name, json.description)
        if (loadID)
            n.id = json.id
        if (n.hasOwnProperty("accent"))
            n.accent = new Color(json.accent.r, json.accent.g, json.accent.b, json.accent.a)
        n.scale = json.scale
        n.position = json.hasOwnProperty("position") ? json.position : {
            x: n.scale.x,
            y: n.scale.y
        }

        n.context = context

        if ((json.internal || json.hasOwnProperty("internal_type")) && parent) {
            n.internal_type = json.internal_type
            n.internal = true
            n.parent = parent
        }

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

            var loaded_internal = 0

            // retain IDs for internal connections
            const nodes = json.InternalManager.nodes

            var internal_connections = []

            const prev_context = CurrentContext
            CurrentContext = n.InternalManager

            if (nodes.length > 0)
                nodes.forEach(node => {


                    var loaded = Node.fromJSON(node, n.InternalManager, n)

                    // update this to use the built in CreateInternalInput/Output nodes
                    if (node.internal) {
                        if (node.internal_type == "INPUT") n.internal_inputs = loaded
                        if (node.internal_type == "OUTPUT") n.internal_outputs = loaded
                        loaded_internal++
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
}

window.Manager = new NodeManager()

// TODO: change IO to Input and Output classes!
function CreateIO(direction) {
    return {
        id: GenerateID(16),
        type: "Any",
        direction: direction,
        value: undefined,
        default_value: undefined,
        connections: []
    }
}

function CreateOutput() {
    return this.CreateIO("OUTPUT")
}

function CreateInput() {
    return this.CreateIO("INPUT")
}

function CreateSelectionInput(views) {
    var data = {
        type: "Selection",
        direction: "INPUT",
        views: [],
        selection: 0,
        currentView: {},
        connections: []
    }
    // define functions
    let AddSelection = (name) => {
        // prevent duplicate names
        name = IterateUntilFree(name, data.views)

        data.views.push({
            name: name,
            index: data.views.length
        })
        if (data.views.length == 1) data.currentView = data.views[0]

        return data
    }

    let RemoveSelection = (name) => {
        // search for the view by name
        data.views.every((v, i) => {
            if (v.name == name) {
                data.views.splice(i, 1)
                return false
            }
            return true
        })

        return data
    }

    let SetSelection = (index) => {
        // clamp the index
        index = Math.max(0, Math.min(data.views.length - 1, index))

        data.selection = index
        data.currentView = data.views[index]
        return data.currentView
    }

    let SetView = (name) => {
        data.views.every(v => {
            if (v.name == name) {
                data.currentView = v
                return false
            }
            return true
        })

        return data.currentView
    }

    // add functions to object
    data.SetSelection = SetSelection
    data.AddSelection = AddSelection
    data.RemoveSelection = RemoveSelection
    data.SetView = SetView

    // add views
    if (views) {
        if (Array.isArray(views))
            views.forEach(v => {
                data.AddSelection(v)
            })
        else data.AddSelection(views)
    }

    return data
}

function CreateNumberInput(default_value) {
    default_value = default_value || 0

    var input = this.CreateInput()

    input.type = "Number"
    input.value = default_value
    input.default_value = default_value

    return input
}

function CreateNumberOutput() {
    var output = this.CreateOutput()

    output.type = "Number"
    output.value = 0
    output.default_value = 0

    return output
}

function CreateNumberViewerOutput() {
    var output = this.CreateOutput()

    output.type = "Viewer"
    output.value = 0
    output.default_value = "null"

    return output
}

function CreateArrayInput(default_value) {
    default_value = default_value || []

    var input = this.CreateInput()

    input.type = "Array"
    input.value = default_value
    input.default_value = default_value

    return input
}

function CreateArrayOutput() {
    var output = this.CreateOutput()

    output.type = "Array"
    output.value = []
    output.default_value = []

    return output
}

function CreateObjectInput(default_value) {
    default_value = default_value || {}

    var input = CreateInput()

    input.type = "Object"
    input.value = default_value
    input.default_value = default_value

    return input
}

function CreateObjectOutput() {
    var output = CreateOutput()

    output.type = "Object"
    output.value = {}
    output.default_value = {}

    return output
}

function CreateBoolInput(default_value) {
    default_value = default_value || false

    var input = CreateInput()

    input.type = "Boolean"
    input.value = default_value
    input.default_value = default_value

    return input
}

function CreateBoolOutput() {
    var output = CreateOutput()

    output.type = "Boolean"
    output.value = false
    output.default_value = false

    return output
}

function CreateAnyInput() {
    var input = this.CreateInput()

    input.type = "Any"
    input.value = "null"
    input.default_value = "null"

    return input
}

function CreateAnyOutput() {
    var output = this.CreateOutput()

    output.type = "Any"
    output.value = "null"
    output.default_value = "null"

    return output
}

let GenerateID = (length) => {
    // ensure there can't be duplicate IDs
    var str = Date.now().toString(16) + "_"
    while (str.length < length) {
        str = str + Math.round(Math.random() * 16).toString(16)
    }
    return str
}

Array.prototype.hasKeyValue = function (key, value) {
    this.forEach(v => {
        if (typeof v == "object" && v.hasOwnProperty(key) && v[key] == value) return true
    })

    return false
}

function IterateUntilFree(title, object) {
    var c = 1
    var finaltitle = title
    if (typeof object == "object") {
        while (object.hasOwnProperty(finaltitle)) {
            finaltitle = `${title} ${c}`
            c++
        }
    } else if (Array.isArray(object)) {
        while (object.hasKeyValue("name", finaltitle)) {
            finaltitle = `${title} ${c}`
            c++
        }
    }
    return finaltitle
}
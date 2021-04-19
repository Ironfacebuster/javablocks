var nodes = []

class NodeManager {
    nodes = []
    constructor() {
        this.nodes = []
    }

    CreateNode(name, description) {
        var node = new Node(this)
        node.SetName(name).SetDescription(description)

        // NodeManager keeps track of this node.
        this.nodes.push(node)

        return node
    }

    GetNodes() {
        // sort nodes by z index
        this.nodes = this.nodes.sort((a, b) => {
            return b.zindex - a.zindex
        })
        return this.nodes
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

        if (index == -1) return console.log(`Attempted to delete non-existant node (id ${id})`)

        var node = this.GetNode(id)

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

        console.log(`Deleted node (id ${id})`)
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
            input.execute()
    }

    RemoveOutputConnections(output) {
        if (!output.hasOwnProperty("connections") || output.connections.length == 0) return

        output.connections.forEach(c => {
            c.connections = []
        })

        output.connections = []
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
    accent = "ffffff"
    zindex = 0
    dirty = true

    constructor(context) {
        if (!context) throw new Error("Node constructor requires NodeManager context!")

        this.zindex = context.GetNodes().length > 0 ? context.GetNodes()[0].zindex + 1 : 0, this.context = context
        this.id = GenerateID(16)
        this.InternalManager = new NodeManager()
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

    GetOutputs() {
        return this.outputs
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
        this.accent = accent

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
}

window.Manager = new NodeManager()

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
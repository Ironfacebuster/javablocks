var nodes = []

let GenerateID = (length) => {
    // ensure there can't be duplicate IDs
    var str = Date.now().toString(16) + "_"
    while (str.length < length) {
        str = str + Math.round(Math.random() * 16).toString(16)
    }
    return str
}

function NMCreateNode(name, description) {
    var node = {
        id: GenerateID(16),
        name: name || "Unnamed Node",
        description: description || "An empty node.",
        inputs: {},
        outputs: {},
        accent: "FFFFFF",
        execute: null,
        type: "Node",
        position: {
            x: 0,
            y: 0
        },
        scale: {
            x: 150,
            y: 25 // base height is 20px
        },
        zindex: NodeManager.GetNodes().length > 0 ? NodeManager.GetNodes()[0].zindex + 1 : 0,
        dirty: true
    }

    let AddInput = (title, input) => {
        title = IterateUntilFree(title, node.inputs)
        input.parent = node
        node.inputs[title] = input
        return node.inputs[title]
    }

    let AddOutput = (title, output) => {
        title = IterateUntilFree(title, node.outputs)
        output.parent = node
        node.outputs[title] = output
        return node.outputs[title]
    }

    let GetName = () => {
        return node.name
    }

    let GetFullName = () => {
        return `${node.name} [${node.id.split("_")[1]}]`
    }

    let SetAccent = (color) => {
        node.accent = color
        return node
    }

    let isDirty = () => {
        return node.dirty
    }

    let MarkDirty = (dirty) => {
        node.dirty = dirty
    }

    let GetInputs = (array) => {
        var n_node = NodeManager.GetNode(node.id)
        array = array || false
        // TODO: if array, return an array of the inputs 
        return n_node.inputs
    }

    let GetOutputs = (array) => {
        var n_node = NodeManager.GetNode(node.id)
        array = array || false
        // TODO: if array, return an array of the outputs
        return n_node.outputs
    }

    node.SetAccent = SetAccent
    node.AddInput = AddInput
    node.AddOutput = AddOutput
    node.GetInputs = GetInputs
    node.GetOutputs = GetOutputs
    node.GetName = GetName
    node.GetFullName = GetFullName
    node.BringToFront = () => {
        const front = NodeManager.GetNodes()[0]

        if (front.id != node.id) {
            node.zindex = front.zindex + 1
        }
    }
    node.isDirty = isDirty
    node.MarkDirty = MarkDirty

    // NodeManager keeps track of this node.
    nodes.push(node)

    return node
}

function NMDeleteNode(id) {
    var index = nodes.findIndex((n) => {
        return n.id == id
    })

    if (index == -1) return console.log(`Attempted to delete non-existant node (id ${id})`)

    var node = NodeManager.GetNode(id)
    console.log(node.inputs)
    // clean up connections
    Object.keys(node.inputs).forEach((i) => {
        console.log(i, node.inputs[i])
        NodeManager.RemoveInputConnections(node.inputs[i])
    })
    Object.keys(node.outputs).forEach((o) => {
        NodeManager.RemoveOutputConnections(node.outputs[o])
    })

    if (index == 0) nodes.shift()
    else if (index == nodes.length - 1) nodes.pop()
    else nodes = nodes.splice(index, 1)

    console.log(`Deleted node (id ${id})`)
}

function NMCreateSelectionInput(views) {
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
                data.views = data.views.splice(i, 1)
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

function NMCreateNumberInput(default_value) {
    default_value = default_value || 0

    return {
        id: GenerateID(16),
        type: "Number",
        direction: "INPUT",
        value: default_value,
        default_value: default_value,
        connections: []
    }
}

function NMCreateNumberOutput() {
    return {
        id: GenerateID(16),
        type: "Number",
        direction: "OUTPUT",
        value: 0,
        default_value: 0,
        connections: []
    }
}

function NMCreateNumberViewer() {
    return {
        id: GenerateID(16),
        type: "Viewer",
        direction: "OUTPUT",
        value: 0,
        default_value: "null"
    }
}

function NMCreateArrayInput() {

    return {
        id: GenerateID(16),
        type: "Array",
        direction: "INPUT",
        value: [],
        default_value: [],
        connections: []
    }
}

function NMCreateArrayOutput() {
    return {
        id: GenerateID(16),
        type: "Array",
        direction: "OUTPUT",
        value: [],
        default_value: [],
        connections: []
    }
}

function NMCreateObjectInput() {

    return {
        id: GenerateID(16),
        type: "Object",
        direction: "INPUT",
        value: [],
        default_value: [],
        connections: []
    }
}

function NMCreateObjectOutput() {
    return {
        id: GenerateID(16),
        type: "Object",
        direction: "OUTPUT",
        value: [],
        default_value: [],
        connections: []
    }
}

function NMCreateBoolInput(default_value) {
    default_value = default_value || false

    return {
        id: GenerateID(16),
        type: "Boolean",
        direction: "INPUT",
        value: default_value,
        default_value: default_value,
        connections: []
    }
}

function NMCreateBoolOutput() {
    return {
        id: GenerateID(16),
        type: "Boolean",
        direction: "OUTPUT",
        value: false,
        default_value: false,
        connections: []
    }
}

function NMCreateAnyInput() {
    return {
        id: GenerateID(16),
        type: "Any",
        direction: "INPUT",
        value: "null",
        default_value: "null",
        connections: []
    }
}

function NMCreateAnyOutput() {
    return {
        id: GenerateID(16),
        type: "Any",
        direction: "OUTPUT",
        value: "null",
        default_value: "null",
        connections: []
    }
}

window.NodeManager = {
    CreateNode: NMCreateNode,
    DeleteNode: NMDeleteNode,
    CreateSelectionInput: NMCreateSelectionInput,
    CreateNumberInput: NMCreateNumberInput,
    CreateNumberOutput: NMCreateNumberOutput,
    CreateNumberViewerOutput: NMCreateNumberViewer,
    CreateArrayInput: NMCreateArrayInput,
    CreateArrayOutput: NMCreateArrayOutput,
    CreateObjectInput: NMCreateObjectInput,
    CreateObjectOutput: NMCreateObjectOutput,
    CreateBoolInput: NMCreateBoolInput,
    CreateBoolOutput: NMCreateBoolOutput,
    CreateAnyInput: NMCreateAnyInput,
    CreateAnyOutput: NMCreateAnyOutput,
    GetNodes: () => {
        // sort nodes by z index
        nodes = nodes.sort((a, b) => {
            return b.zindex - a.zindex
        })
        return nodes
    },
    GetNode: (id) => {
        return nodes[nodes.findIndex((node) => {
            return node.id == id
        })]
    },
    RemoveInputConnections: NMRemoveInputConnections,
    RemoveOutputConnections: NMRemoveOutputConnections,
    RemoveInputConnection: NMRemoveInputConnection,
    RemoveOutputConnection: NMRemoveOutputConnection
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

function NMRemoveInputConnection(input, output) {
    NMRemoveOutputConnection(output, input)
}

function NMRemoveInputConnections(input) {
    // a wrapper for RemoveOutputConnection
    if (input.connections.length == 0) return

    // inputs can only have one connection, so it's safe to assume index zero will be the the connection
    var output = input.connections[0]

    NodeManager.RemoveOutputConnection(output, input)
}

function NMRemoveOutputConnection(output, input) {
    var index = output.connections.findIndex((c) => {
        return c.id == input.id
    })
    // if the output has more than one connection, the index to be removed is not zero, and is less than the total amount
    if (output.connections.length > 1 && index > 0 && index < output.connections.length - 1)
        output.connections = output.connections.splice(index - 1, 1)
    // if the index is zero, shift out the first connection
    else if (index == 0) output.connections.shift()
    // if the index is the last item, pop it
    else if (index == output.connections.length - 1) output.connections.pop()
    // if this connection is the last in the array, set the array to be empty
    else if (output.connections.length == 1) output.connections = []

    // since inputs can only have one connection, clear the input's connections
    input.connections = []
    // set the end connection's default value
    input.value = input.default_value
    // call "execute" if it has it
    if (input.hasOwnProperty("execute"))
        input.execute()
}

function NMRemoveOutputConnections(output) {
    if (!output.hasOwnProperty("connections") || output.connections.length == 0) return

    output.connections.forEach(c => {
        console.log(c)
        c.connections = []
    })

    output.connections = []
}
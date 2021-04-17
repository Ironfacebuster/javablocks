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

    node.AddInput = AddInput
    node.AddOutput = AddOutput
    node.GetName = GetName
    node.GetFullName = GetFullName
    node.SetAccent = SetAccent
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
    var index = nodes.findIndex((n) => { return n.id == id })

    if (index == -1) return console.log(`Attempted to delete non-existant node (id ${id})`)

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
        return nodes[nodes.findIndex((node) => { return node.id == id })]
    }
}

Array.prototype.hasKeyValue = function (key, value) {
    this.forEach(v => {
        if (typeof v == "object" && v.hasOwnProperty(key) && v[key] == value) return true
    })

    return false
}

function IterateUntilFree(title, object) {
    var c = 1
    if (typeof object == "object") {
        while (object.hasOwnProperty(title)) {
            title = `${title}_${c}`
            c++
        }
    } else if (Array.isArray(object)) {
        while (object.hasKeyValue("name", title)) {
            title = `${title}_${c}`
            c++
        }
    }
    return title
}
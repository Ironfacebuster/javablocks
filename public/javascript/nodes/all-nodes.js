function CreateMathNode() {
    var node = NodeManager.CreateNode("Math Functions", "A node containing various math functions.")

    node.default = true
    node.SetAccent("ffbb00")

    node.AddInput("Mode", NodeManager.CreateSelectionInput(["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil", "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "log", "log1p", "log10", "log2", "max", "min", "pow", "round", "sign", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"]))
    var inp_a = node.AddInput("A", NodeManager.CreateNumberInput(0))
    var inp_b = node.AddInput("B", NodeManager.CreateNumberInput(0))
    var o = node.AddOutput("Output", NodeManager.CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const fun = node.inputs["Mode"].currentView.name

        if (fun == "atan2")
            o.value = Math.atan2(inp_b.value, inp_a.value)
        else {
            o.value = Math[fun](inp_a.value, inp_b.value)
        }

        // console.log(o)

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateNumberNode() {
    var node = NodeManager.CreateNode("Static Numbers", "A node that contains various static numbers.")

    node.default = true
    node.SetAccent("ff6600")

    node.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", NodeManager.CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const fun = node.inputs["Value"].currentView.name

        if (Math.hasOwnProperty(fun))
            o.value = Math[fun]
        else {
            switch (fun) {
                default:
                    o.value = 0
            }
        }

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateRandomNode() {
    var node = NodeManager.CreateNode("Random Number", "A node that generates a random number between zero and one.")

    node.default = true
    node.SetAccent("4444ff")

    // node.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", NodeManager.CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = Math.random()

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateViewerNode() {
    var node = NodeManager.CreateNode("Value Viewer", "A node that will display a value.")

    node.default = true
    node.SetAccent("4488ff")
    node.AddInput("Input", NodeManager.CreateAnyInput())
    node.AddOutput("Output", NodeManager.CreateNumberViewerOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)


    }

    return node
}

function CreateOperationsNode() {
    var node = NodeManager.CreateNode("Math Operations", "A node that performs various math operations.")

    node.default = true
    node.SetAccent("dd00ff")

    node.AddInput("Mode", NodeManager.CreateSelectionInput(["Power", "Multiply", "Divide", "Add", "Subtract"]))
    var inp_a = node.AddInput("A", NodeManager.CreateNumberInput(0))
    var inp_b = node.AddInput("B", NodeManager.CreateNumberInput(0))
    var o = node.AddOutput("Output", NodeManager.CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const act = node.inputs["Mode"].currentView.name

        switch (act) {
            case "Power":
                o.value = Math.pow(inp_a.value, inp_b.value)
                break
            case "Multiply":
                o.value = inp_a.value * inp_b.value
                break
            case "Divide":
                o.value = inp_a.value / inp_b.value
                break
            case "Add":
                o.value = inp_a.value + inp_b.value
                break
            case "Subtract":
                o.value = inp_a.value - inp_b.value
                break
        }


        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateIfNode() {
    var node = NodeManager.CreateNode("Comparison", "A node that compares two inputs.")

    node.default = true
    node.SetAccent("ff2200")

    // node.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = node.AddInput("A", NodeManager.CreateAnyInput())
    var in2 = node.AddInput("B", NodeManager.CreateAnyInput())
    var o = node.AddOutput("Output", NodeManager.CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        if (in1.value == in2.value) o.value = true
        else o.value = false

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateSwitchNode() {
    var node = NodeManager.CreateNode("Predicate Switch", "A node that switches between two inputs based on a bool predicate.")

    node.default = true
    node.SetAccent("ff8888")

    // node.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in2 = node.AddInput("A", NodeManager.CreateAnyInput())
    var in3 = node.AddInput("B", NodeManager.CreateAnyInput())
    var in1 = node.AddInput("Predicate", NodeManager.CreateBoolInput())
    var o = node.AddOutput("Output", NodeManager.CreateAnyOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = in1.value == true ? in2.value : in3.value

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateInverterNode() {
    var node = NodeManager.CreateNode("Bool Inverter", "A node that inverts its input.")

    node.default = true
    node.SetAccent("ff6655")

    // node.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = node.AddInput("Input", NodeManager.CreateBoolInput())
    var o = node.AddOutput("Output", NodeManager.CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = !in1.value

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateObjectKeyNode() {
    var node = NodeManager.CreateNode("Object Key", "A node that accesses a key from an object.")

    node.default = true
    node.SetAccent("44aaee")

    var in1 = node.AddInput("Input", NodeManager.CreateObjectInput())
    // change this to a user string input
    var in2 = node.AddInput("Key", NodeManager.CreateSelectionInput())
    var o = node.AddOutput("Output", NodeManager.CreateAnyOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = in1.value[in2.value] || "null"

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                })
        }
    }

    return node
}

function CreateObjectNode() {
    var node = NodeManager.CreateNode("Object", "A node that accesses a key from an object.")

    node.default = true
    node.SetAccent("4466ee")
    var obj = {}

    // var in1 = node.AddInput("Input", NodeManager.CreateObjectInput())
    // change this to a user string input
    var in1 = node.AddInput("Key", NodeManager.CreateSelectionInput())
    var o = node.AddOutput("Output", NodeManager.CreateObjectOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = obj

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        con.parent.execute(finished)
                    // eventually wait for execution of connections
                })
        }
    }

    return node
}
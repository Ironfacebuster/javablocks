function CreateMathFunctionsNode() {
    var node = Manager.CreateNode("Math Functions", "A node containing various math functions.")

    node.default = true
    node.SetAccent("ffbb00")

    node.AddInput("Mode", CreateSelectionInput(["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil", "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "log", "log1p", "log10", "log2", "max", "min", "pow", "round", "sign", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"]))
    var inp_a = node.AddInput("A", CreateNumberInput(0))
    var inp_b = node.AddInput("B", CreateNumberInput(0))
    var o = node.AddOutput("Output", CreateNumberOutput())

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

function CreateStaticNumberNode() {
    var node = Manager.CreateNode("Static Numbers", "A node that contains various static numbers.")

    node.default = true
    node.SetAccent("ff6600")

    node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", CreateNumberOutput())

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

function CreateRandomNumberNode() {
    var node = Manager.CreateNode("Random Number", "A node that generates a random number between zero and one.")

    node.default = true
    node.SetAccent("4444ff")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", CreateNumberOutput())

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

function CreateValueViewerNode() {
    var node = Manager.CreateNode("Value Viewer", "A node that will display a value.")

    node.default = true
    node.SetAccent("4488ff")
    node.AddInput("Input", CreateAnyInput())
    node.AddOutput("Output", CreateNumberViewerOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)


    }

    return node
}

function CreateMathOperationsNode() {
    var node = Manager.CreateNode("Math Operations", "A node that performs various math operations.")

    node.default = true
    node.SetAccent("dd00ff")

    node.AddInput("Mode", CreateSelectionInput(["Power", "Multiply", "Divide", "Add", "Subtract"]))
    var inp_a = node.AddInput("A", CreateNumberInput(0))
    var inp_b = node.AddInput("B", CreateNumberInput(0))
    var o = node.AddOutput("Output", CreateNumberOutput())

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

function TypeToInput(type) {
    switch (type) {
        case "Boolean":
            return CreateBoolInput
        case "Number":
            return CreateNumberInput
        case "Array":
            return CreateArrayInput
        case "Any":
            return CreateAnyInput
        default:
            return CreateAnyInput
    }
}

function TypeToOutput(type, default_value) {
    console.log(Manager)
    switch (type) {
        case "Boolean":
            return CreateBoolOutput(default_value)
        case "Number":
            return CreateNumberOutput(default_value)
        case "Array":
            return CreateArrayOutput(default_value)
        default:
            return CreateAnyOutput(default_value)
    }
}

function CreateInternalInputsNode(inputs) {
    var node = Manager.CreateNode("Inputs", "An internal node.")

    node.default = false
    node.internal = true
    node.internal_type = "INPUT"
    node.SetAccent("ffffff")

    Object.keys(inputs).forEach(name => {
        node.default = inputs[name].parent.default
        node.AddOutput(name, TypeToOutput(inputs[name].type, inputs[name].default_value))
    })

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

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

function CreateInternalOutputsNode(outputs) {
    var node = Manager.CreateNode("Outputs", "An internal node.")

    // allow adding and removing nodes (update parent node)
    node.default = false
    node.internal = true
    node.internal_type = "OUTPUT"
    node.SetAccent("ffffff")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    Object.keys(outputs).forEach(name => {
        node.default = outputs[name].parent.default
        node.AddInput(name, TypeToInput(outputs[name].type)(outputs[name].default_value))
    })

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)
    }

    return node
}

function CreateComparisonNode() {
    var node = Manager.CreateNode("Comparison", "A node that compares two inputs.")

    node.default = true
    node.SetAccent("ff2200")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var mode = node.AddInput("Mode", CreateSelectionInput(["==", ">", ">="]))
    var in1 = node.AddInput("A", CreateNumberInput())
    var in2 = node.AddInput("B", CreateNumberInput())
    var o = node.AddOutput("Output", CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const act = node.inputs["Mode"].currentView.name
        o.value = false

        switch (act) {
            case "==":
                if (in1.value == in2.value) o.value = true
                break
            case ">=":
                if (in1.value >= in2.value) o.value = true
                break
            case ">":
                if (in1.value > in2.value) o.value = true
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

function CreatePredicateNode() {
    var node = Manager.CreateNode("Predicate Switch", "A node that switches between two inputs based on a bool predicate.")

    node.default = true
    node.SetAccent("ff8888")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in2 = node.AddInput("A", CreateAnyInput())
    var in3 = node.AddInput("B", CreateAnyInput())
    var in1 = node.AddInput("Predicate", CreateBoolInput())
    var o = node.AddOutput("Output", CreateAnyOutput())

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

function CreateBoolInverterNode() {
    var node = Manager.CreateNode("Bool Inverter", "A node that inverts its input.")

    node.default = true
    node.SetAccent("ff6655")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = node.AddInput("Input", CreateBoolInput())
    var o = node.AddOutput("Output", CreateBoolOutput())

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
    var node = Manager.CreateNode("Object Key", "A node that accesses a key from an object.")

    node.default = true
    node.SetAccent("44aaee")

    var in1 = node.AddInput("Input", CreateObjectInput())
    // change this to a user string input
    var in2 = node.AddInput("Key", CreateSelectionInput())
    var o = node.AddOutput("Output", CreateAnyOutput())

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
    var node = Manager.CreateNode("Object", "A node contains an object.")

    node.default = true
    node.SetAccent("4466ee")
    var obj = {}

    // var in1 = node.AddInput("Input", CreateObjectInput())
    // change this to a user string input
    var in1 = node.AddInput("Key", CreateSelectionInput())
    var o = node.AddOutput("Output", CreateObjectOutput())

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
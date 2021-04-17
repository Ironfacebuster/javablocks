function CreateMathNode() {
    var MathNode = NodeManager.CreateNode("Math Functions", "A node containing various math functions.")

    MathNode.SetAccent("ffbb00")

    MathNode.AddInput("Mode", NodeManager.CreateSelectionInput(["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil", "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "log", "log1p", "log10", "log2", "max", "min", "pow", "round", "sign", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"]))
    var inp_a = MathNode.AddInput("A", NodeManager.CreateNumberInput(0))
    var inp_b = MathNode.AddInput("B", NodeManager.CreateNumberInput(0))
    var o = MathNode.AddOutput("Output", NodeManager.CreateNumberOutput())

    MathNode.execute = () => {
        const fun = MathNode.inputs["Mode"].currentView.name

        if (fun == "atan2")
            o.value = Math.atan2(inp_b.value, inp_a.value)
        else {
            o.value = Math[fun](inp_a.value, inp_b.value)
        }

        // console.log(o)

        for (var k in MathNode.outputs) {
            var output = MathNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return MathNode
}

function CreateNumberNode() {
    var NumberNode = NodeManager.CreateNode("Static Numbers", "A node that contains various static numbers.")

    NumberNode.SetAccent("ff6600")

    NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = NumberNode.AddOutput("Output", NodeManager.CreateNumberOutput())

    NumberNode.execute = () => {
        const fun = NumberNode.inputs["Value"].currentView.name

        if (Math.hasOwnProperty(fun))
            o.value = Math[fun]
        else {
            switch (fun) {
                default:
                    o.value = 0
            }
        }

        for (var k in NumberNode.outputs) {
            var output = NumberNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return NumberNode
}

function CreateRandomNode() {
    var NumberNode = NodeManager.CreateNode("Random Number", "A node that generates a random number between zero and one.")

    NumberNode.SetAccent("4444ff")

    // NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = NumberNode.AddOutput("Output", NodeManager.CreateNumberOutput())

    NumberNode.execute = () => {
        o.value = Math.random()

        for (var k in NumberNode.outputs) {
            var output = NumberNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return NumberNode
}

function CreateViewerNode() {
    var NumberNode = NodeManager.CreateNode("Value Viewer", "A node that will display a value.")

    NumberNode.SetAccent("4488ff")
    NumberNode.AddInput("Input", NodeManager.CreateAnyInput())
    NumberNode.AddOutput("Output", NodeManager.CreateNumberViewerOutput())

    NumberNode.execute = () => {

    }

    return NumberNode
}

function CreateOperationsNode() {
    var MathNode = NodeManager.CreateNode("Math Operations", "A node that performs various math operations.")

    MathNode.SetAccent("dd00ff")

    MathNode.AddInput("Mode", NodeManager.CreateSelectionInput(["Power", "Multiply", "Divide", "Add", "Subtract"]))
    var inp_a = MathNode.AddInput("A", NodeManager.CreateNumberInput(0))
    var inp_b = MathNode.AddInput("B", NodeManager.CreateNumberInput(0))
    var o = MathNode.AddOutput("Output", NodeManager.CreateNumberOutput())

    MathNode.execute = () => {
        const act = MathNode.inputs["Mode"].currentView.name

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

        for (var k in MathNode.outputs) {
            var output = MathNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return MathNode
}

function CreateIfNode() {
    var IfNode = NodeManager.CreateNode("Comparison", "A node that compares two inputs.")

    IfNode.SetAccent("ff2200")

    // NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = IfNode.AddInput("A", NodeManager.CreateAnyInput())
    var in2 = IfNode.AddInput("B", NodeManager.CreateAnyInput())
    var o = IfNode.AddOutput("Output", NodeManager.CreateBoolOutput())

    IfNode.execute = () => {
        if (in1.value == in2.value) o.value = true
        else o.value = false

        for (var k in IfNode.outputs) {
            var output = IfNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return IfNode
}

function CreateInverterNode() {
    var IfNode = NodeManager.CreateNode("Bool Inverter", "A node that inverts its input.")

    IfNode.SetAccent("ff6655")

    // NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = IfNode.AddInput("Input", NodeManager.CreateBoolInput())
    var o = IfNode.AddOutput("Output", NodeManager.CreateBoolOutput())

    IfNode.execute = () => {
        o.value = !in1.value

        for (var k in IfNode.outputs) {
            var output = IfNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return IfNode
}

function CreateObjectKeyNode() {
    var OKNode = NodeManager.CreateNode("Object Key", "A node that accesses a key from an object.")

    OKNode.SetAccent("44aaee")

    var in1 = OKNode.AddInput("Input", NodeManager.CreateObjectInput())
    // change this to a user string input
    var in2 = OKNode.AddInput("Key", NodeManager.CreateSelectionInput())
    var o = OKNode.AddOutput("Output", NodeManager.CreateAnyOutput())

    OKNode.execute = () => {
        o.value = in1.value[in2.value] || "null"

        for (var k in OKNode.outputs) {
            var output = OKNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return OKNode
}

// 4466ee

function CreateObjectNode() {
    var ObjectNode = NodeManager.CreateNode("Object", "A node that accesses a key from an object.")

    ObjectNode.SetAccent("4466ee")
    var obj = {}

    // var in1 = OKNode.AddInput("Input", NodeManager.CreateObjectInput())
    // change this to a user string input
    var in1 = ObjectNode.AddInput("Key", NodeManager.CreateSelectionInput())
    var o = ObjectNode.AddOutput("Output", NodeManager.CreateObjectOutput())

    ObjectNode.execute = () => {
        o.value = obj

        for (var k in ObjectNode.outputs) {
            var output = ObjectNode.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                })
        }
    }

    return ObjectNode
}
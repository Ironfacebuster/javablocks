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
    var NumberNode = NodeManager.CreateNode("Number Viewer", "A node that will display a number.")

    NumberNode.SetAccent("4488ff")
    NumberNode.AddInput("Input", NodeManager.CreateNumberInput())
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
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
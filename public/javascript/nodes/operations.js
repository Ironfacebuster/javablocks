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
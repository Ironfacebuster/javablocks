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
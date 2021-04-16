function CreateIfNode() {
    var IfNode = NodeManager.CreateNode("Comparison", "A node that compares two inputs.")

    IfNode.SetAccent("ff2200")

    // NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var in1 = IfNode.AddInput("A", NodeManager.CreateAnyInput())
    var in2 = IfNode.AddInput("A", NodeManager.CreateAnyInput())
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
function CreateNumberNode() {
    var NumberNode = NodeManager.CreateNode("Static Numbers", "A node that contains various static numbers.")

    NumberNode.SetAccent("ff6600")

    NumberNode.AddInput("Value", NodeManager.CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2", "RANDOM"]))
    var o = NumberNode.AddOutput("Output", NodeManager.CreateNumberOutput())

    NumberNode.execute = () => {
        const fun = NumberNode.inputs["Value"].currentView.name

        if (Math.hasOwnProperty(fun))
            o.value = Math[fun]
        else {
            switch (fun) {
                case "RANDOM":
                    o.value = Math.random()
                    break
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
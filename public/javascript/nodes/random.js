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
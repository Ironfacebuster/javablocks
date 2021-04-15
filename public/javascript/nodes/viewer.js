function CreateViewerNode() {
    var NumberNode = NodeManager.CreateNode("Number Viewer", "A node that will display a number.")

    NumberNode.SetAccent("4488ff")
    NumberNode.AddInput("Input", NodeManager.CreateNumberInput())
    NumberNode.AddOutput("Output", NodeManager.CreateNumberViewerOutput())

    NumberNode.execute = () => {

    }

    return NumberNode
}
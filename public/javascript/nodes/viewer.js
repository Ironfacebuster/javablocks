function CreateViewerNode() {
    var NumberNode = NodeManager.CreateNode("Value Viewer", "A node that will display a value.")

    NumberNode.SetAccent("4488ff")
    NumberNode.AddInput("Input", NodeManager.CreateAnyInput())
    NumberNode.AddOutput("Output", NodeManager.CreateNumberViewerOutput())

    NumberNode.execute = () => {

    }

    return NumberNode
}
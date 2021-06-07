/*
 *   Copyright (c) 2021 William Huddleston
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

function CreateMathFunctionsNode() {
    var node = CurrentContext.CreateNode("Math Functions", "A node containing various math functions.")

    node.default = true
    node.default_type = "math_functions"
    node.SetAccent("ffbb00")

    node.AddInput("Mode", CreateSelectionInput(["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil", "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "log", "log1p", "log10", "log2", "max", "min", "pow", "round", "sign", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"]))
    var inp_a = node.AddInput("A", CreateNumberInput(0))
    var inp_b = node.AddInput("B", CreateNumberInput(0))
    var o = node.AddOutput("Output", CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const fun = node.inputs["Mode"].currentView.name

        if (fun == "atan2")
            o.value = Math.atan2(inp_b.value, inp_a.value)
        else {
            o.value = Math[fun](inp_a.value, inp_b.value)
        }

        // console.log(o)

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateStaticNumberNode() {
    var node = CurrentContext.CreateNode("Static Numbers", "A node that contains various static numbers.")

    node.default = true
    node.default_type = "static_numbers"
    node.SetAccent("ff6600")

    node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const fun = node.inputs["Value"].currentView.name

        if (Math.hasOwnProperty(fun))
            o.value = Math[fun]
        else {
            switch (fun) {
                default:
                    o.value = 0
            }
        }

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateRandomNumberNode() {
    var node = CurrentContext.CreateNode("Random Number", "A node that generates a random number between zero and one.")

    node.default = true
    node.default_type = "random_number"
    node.SetAccent("4444ff")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var o = node.AddOutput("Output", CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = Math.random()

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateValueViewerNode() {
    var node = CurrentContext.CreateNode("Value Viewer", "A node that will display a value.")

    node.default = true
    node.SetAccent("4488ff")
    node.default_type = "value_viewer"
    node.AddInput("Input", CreateAnyInput())
    node.AddOutput("Output", CreateNumberViewerOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)


    }

    return node
}

function CreateMathOperationsNode() {
    var node = CurrentContext.CreateNode("Math Operations", "A node that performs various math operations.")

    node.default = true
    node.default_type = "math_operations"
    node.SetAccent("dd00ff")

    node.AddInput("Mode", CreateSelectionInput(["Power", "Multiply", "Divide", "Add", "Subtract"]))
    var inp_a = node.AddInput("A", CreateNumberInput(0))
    var inp_b = node.AddInput("B", CreateNumberInput(0))
    var o = node.AddOutput("Output", CreateNumberOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const act = node.inputs["Mode"].currentView.name

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


        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function TypeToInput(type) {
    switch (type) {
        case "Boolean":
            return CreateBoolInput
        case "Number":
            return CreateNumberInput
        case "Array":
            return CreateArrayInput
        case "Any":
            return CreateAnyInput
        default:
            return CreateAnyInput
    }
}

function TypeToOutput(type) {
    switch (type) {
        case "Boolean":
            return CreateBoolOutput
        case "Number":
            return CreateNumberOutput
        case "Array":
            return CreateArrayOutput
        default:
            return CreateAnyOutput
    }
}

function CreateInternalInputsNode(inputs, context) {
    context = context || CurrentContext
    var node = context.CreateNode("Inputs", "An internal node.")

    node.default = false
    node.internal = true
    node.internal_type = "INPUT"
    node.SetAccent("ffffff")

    Object.keys(inputs).forEach(name => {
        node.default = inputs[name].parent.default
        node.AddOutput(name, TypeToOutput(inputs[name].type)(inputs[name].default_value))
    })

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateInternalOutputsNode(outputs, context) {
    context = context || CurrentContext
    var node = context.CreateNode("Outputs", "An internal node.")

    // allow adding and removing nodes (update parent node)
    node.default = false
    node.internal = true
    node.internal_type = "OUTPUT"
    node.SetAccent("ffffff")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    Object.keys(outputs).forEach(name => {
        node.default = outputs[name].parent.default
        node.AddInput(name, TypeToInput(outputs[name].type)(outputs[name].default_value))
    })

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)
    }

    return node
}

function CreateComparisonNode() {
    var node = CurrentContext.CreateNode("Number Comparison", "A node that compares two inputs.")

    node.default = true
    node.default_type = "comparison"
    node.SetAccent("ff2200")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var mode = node.AddInput("Mode", CreateSelectionInput(["==", ">", ">="]))
    var in1 = node.AddInput("A", CreateNumberInput())
    var in2 = node.AddInput("B", CreateNumberInput())
    var o = node.AddOutput("Output", CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const act = node.inputs["Mode"].currentView.name
        o.value = false

        switch (act) {
            case "==":
                if (in1.value == in2.value) o.value = true
                break
            case ">=":
                if (in1.value >= in2.value) o.value = true
                break
            case ">":
                if (in1.value > in2.value) o.value = true
                break
        }


        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}


function CreateBoolLogicNode() {
    var node = CurrentContext.CreateNode("Boolean Logic", "A node that compares two inputs.")

    node.default = true
    node.default_type = "bool_logic"
    node.SetAccent("ff4400")

    // node.AddInput("Value", CreateSelectionInput(["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"]))
    var mode = node.AddInput("Mode", CreateSelectionInput(["AND", "OR", "XOR", "NAND", "NOR", "XNOR"]))
    var in1 = node.AddInput("A", CreateBoolInput())
    var in2 = node.AddInput("B", CreateBoolInput())
    var o = node.AddOutput("Output", CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        const act = node.inputs["Mode"].currentView.name
        o.value = false

        switch (act) {
            case "AND":
                // if both are true
                o.value = (in1.value && in2.value)
                break
            case "OR":
                // if either is true
                o.value = (in1.value || in2.value)
                break
            case "XOR":
                // if one of them is true, and they don't equal each other
                o.value = ((in1.value || in2.value) && in1.value != in2.value)
                break
            case "NAND":
                // inverted AND
                o.value = !(in1.value && in2.value)
                break
            case "NOR":
                // inverted OR
                o.value = !(in1.value || in2.value)
                break
            case "XNOR":
                // if the two values are the same
                o.value = in1.value == in2.value
                break
        }

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreatePredicateNode() {
    var node = CurrentContext.CreateNode("Predicate Switch", "A node that switches between two inputs based on a bool predicate.")

    node.default = true
    node.default_type = "predicate_switch"
    node.SetAccent("ff8888")

    // TODO: ensure both input types match
    var in2 = node.AddInput("A", CreateAnyInput())
    var in3 = node.AddInput("B", CreateAnyInput())
    var in1 = node.AddInput("Predicate", CreateBoolInput())

    // TODO: change output type based on input type
    var o = node.AddOutput("Output", CreateAnyOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = in1.value == true ? in2.value : in3.value

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateBoolInverterNode() {
    var node = CurrentContext.CreateNode("Bool Inverter", "A node that inverts its input.")

    node.default = true
    node.default_type = "bool_inverter"
    node.SetAccent("ff6655")

    var in1 = node.AddInput("Input", CreateBoolInput())
    var o = node.AddOutput("Output", CreateBoolOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = !in1.value

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateObjectKeyNode() {
    var node = CurrentContext.CreateNode("Object Key", "A node that accesses a key from an object.")

    node.default = true
    node.default_type = "object_key"
    node.SetAccent("44aaee")

    var in1 = node.AddInput("Input", CreateObjectInput())
    // change this to a user string input
    var in2 = node.AddInput("Key", CreateSelectionInput())
    var o = node.AddOutput("Output", CreateAnyOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = in1.value[in2.value] || "null"

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                })
        }
    }

    return node
}

function CreateObjectNode() {
    var node = CurrentContext.CreateNode("Object", "A node that contains an object.")

    node.default = true
    node.default_type = "object"
    node.SetAccent("4466ee")
    var obj = {}

    // var in1 = node.AddInput("Input", CreateObjectInput())
    // change this to a user string input
    var in1 = node.AddInput("Key", CreateSelectionInput())
    var o = node.AddOutput("Output", CreateObjectOutput())

    node.execute = (finished) => {
        finished = finished || []
        if (finished.indexOf(node.id) != -1) return
        finished.push(node.id)

        o.value = obj

        for (var k in node.outputs) {
            var output = node.outputs[k]
            if (output.connections.length > 0)
                output.connections.forEach(con => {
                    // console.log(con)
                    con.value = output.value
                    if (finished.indexOf(con.parent.id) == -1)
                        Schedule.Schedule(con.parent, finished)
                    // eventually wait for execution of connections
                })
        }
    }

    return node
}

const node_types = {
    "comparison": CreateComparisonNode,
    "object": CreateObjectNode,
    "object_key": CreateObjectKeyNode,
    "bool_inverter": CreateBoolInverterNode,
    "predicate_switch": CreatePredicateNode,
    "bool_logic": CreateBoolLogicNode,
    "math_operations": CreateMathOperationsNode,
    "math_functions": CreateMathFunctionsNode,
    "static_numbers": CreateStaticNumberNode,
    "value_viewer": CreateValueViewerNode,
    "random_number": CreateRandomNumberNode
}
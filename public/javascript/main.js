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

var fast_mode = false
var draw_collision = false
var Mouse = {
    position: {
        x: 0,
        y: 0
    },
    buttons: {
        0: false,
        1: false
    },
    dragging: false,
    selecting: false,
    selected: [],
    slicing: false
}
context_path = [Manager]
window.CurrentContext = Manager
var startX = 25,
    startY = 25

var pause_execution = false
var step = false

function ToggleRenderMode() {
    fast_mode = !fast_mode

    document.getElementById("quality_button").innerText = fast_mode ? "Performance Mode" : "Quality Mode"

    UpdateAndDrawNodes()
}

function TogglePause() {
    pause_execution = !pause_execution

    document.getElementById("pause_button").innerText = pause_execution ? "Unpause" : "Pause"
    UpdateAndDrawNodes()
}

function SetStep() {
    step = true
}

function addnode() {
    // var d = document.getElementById("nodes")
    // d.innerHTML = ""
    var list = [CreateMathNode, CreateNumberNode, CreateViewerNode, CreateRandomNode, CreateOperationsNode]

    const new_node = list[Math.floor(Math.random() * list.length)]()
    new_node.position = {
        x: startX,
        y: startY
    }

    UpdateAndDrawNodes()

    startY += 125
    if (startY > canvas.height - 125)
        startY = 25, startX += 175
}

var canvas = document.getElementById("main")
var ctx = canvas.getContext("2d")

function InitCanvas() {
    // resize to be slightly smaller than the screen
    var c = document.getElementById("main")
    c.height = Math.round(window.innerHeight * 0.65)
    c.width = Math.round(window.innerWidth - 10)

    var con = document.getElementById("main_container")
    con.height = c.height
    con.width = c.width

    UpdateAndDrawNodes()
}

var bg_color = Manager.background_color

function ClearCanvas() {
    const oldFill = ctx.fillStyle

    ctx.fillStyle = CurrentContext.background_color.toHex()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = oldFill
}

// draw nodes

// OPTIMIZATIONS TO DO
// only redraw moving nodes
// clear area around node, redrawing any nearby nodes if they are inside of the area
function DrawNode(node) {
    // get node position eventually
    var position = node.position
    var scale = {
        x: 150,
        y: 25
    }

    // each node input/output should be approx 15px tall
    // 25px now lol
    scale.y += (Math.max(Object.keys(node.inputs).length, Object.keys(node.outputs).length) * 25)

    // draw shadow
    if (!fast_mode) {
        ctx.fillStyle = "rgba(0,0,0,0.15)"
        ctx.strokeStyle = "rgba(0,0,0,0.15)"
        roundRect(ctx, position.x + 5, position.y + 5, scale.x, scale.y, 5, true, false)
    }

    // draw outside w/ accent
    var acc = node.accent
    acc.a = 128

    if (fast_mode) acc = acc.divide(2), acc.a = 255

    var rgba_accent = `rgba(${acc.r},${acc.g},${acc.b}, ${acc.a / 255})`

    ctx.fillStyle = rgba_accent
    ctx.strokeStyle = rgba_accent
    roundRect(ctx, position.x, position.y, scale.x, scale.y, 5, true, false)

    if (!fast_mode) {
        const accentWidth = 5
        ctx.fillStyle = "rgba(1,1,1,0.5)"
        ctx.strokeStyle = "rgba(1,1,1,0.5)"
        roundRect(ctx, position.x + accentWidth, position.y, scale.x - accentWidth, scale.y, 5, true, false)
    }

    if (Array.isArray(Mouse.selected) && Mouse.selected.findIndex((n) => {
        return n.id == node.id
    }) >= 0) {
        // outline this node
        ctx.fillStyle = "rgba(0,255,128,0.1)"
        ctx.strokeStyle = "rgba(0,255,64,0.75)"
        roundRect(ctx, position.x - 1, position.y - 1, scale.x + 2, scale.y + 2, 5, false, true)
    }

    ctx.textAlign = "left"
    ctx.font = "bold 10px Arial"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.fillText(node.GetName(), position.x + 10, (position.y + scale.y) - 5)

    ctx.font = "bold 12px Arial"
    var nHeight = 20
    // draw inputs/outputs
    Object.keys(node.inputs).forEach(i => {
        var input = node.inputs[i]
        switch (input.type) {
            case "Selection":
                // draw the selection box
                const xpos = position.x + 10,
                    ypos = position.y + nHeight - 12

                ctx.fillStyle = "rgba(0,0,0,0.5)"
                ctx.strokeStyle = "white"
                roundRect(ctx, xpos, ypos, scale.x / 2 - 10, 15, 5, true, true)

                ctx.fillStyle = "white"
                ctx.strokeStyle = "white"
                ctx.fillText(input.currentView.name, position.x + 14, position.y + nHeight)
                break
            default:
                // draw default input
                ctx.fillStyle = "white"
                ctx.strokeStyle = "white"
                ctx.fillText(i, position.x + 10, position.y + nHeight)

                ctx.lineWidth = 2
                const color = GetColorByType(input.type)
                ctx.fillStyle = color.fill.toHex()
                ctx.strokeStyle = color.stroke.toHex()
                circle(ctx, position.x, (position.y + nHeight) - 4, 5, true, true)
                ctx.lineWidth = 1
        }

        nHeight += 25
    })

    nHeight = 20

    ctx.textAlign = "right"

    Object.keys(node.outputs).forEach(o => {
        var output = node.outputs[o]

        switch (output.type) {
            case "Viewer":
                // if the output type is a Viewer, eg Number Viewer
                ctx.fillStyle = "rgba(0,0,0,0.5)"
                ctx.strokeStyle = "white"

                roundRect(ctx, position.x + scale.x - 70, position.y + nHeight - 12, scale.x / 2 - 10, 15, 5, true, false)

                ctx.fillStyle = "white"
                ctx.strokeStyle = "white"
                ctx.textAlign = "left"

                var name = node.inputs["Input"].value.toString()
                const maxWidth = scale.x / 2 - 18

                while (ctx.measureText(name).width > maxWidth) name = name.substr(0, name.length - 1)

                ctx.fillText(name, position.x + scale.x - 66, position.y + nHeight)
                break
            default:
                // draw default output
                ctx.fillStyle = "white"
                ctx.strokeStyle = "white"
                ctx.fillText(o, position.x + scale.x - 10, position.y + nHeight)

                ctx.lineWidth = 2
                const color = GetColorByType(output.type)
                ctx.fillStyle = color.fill.toHex()
                ctx.strokeStyle = color.stroke.toHex()
                circle(ctx, position.x + scale.x, (position.y + nHeight) - 4, 5, true, true)
                ctx.lineWidth = 1
        }

        nHeight += 25
    })

    node.scale = scale
    node.MarkDirty(false)
}

function DrawNodeConnections(context) {
    context.GetNodes().forEach(node => {
        // draw this output's connections
        Object.keys(node.outputs).forEach(output => {
            if (node.outputs[output].hasOwnProperty("connections"))
                node.outputs[output].connections.forEach(con => {
                    DrawConnection(node.outputs[output].position, con.position)
                    con.parent.MarkDirty(true)
                })
        })
    })
}

function circle(ctx, x, y, radius, fill, stroke) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    // ctx.stroke()

    if (fill)
        ctx.fill()
    if (stroke)
        ctx.stroke()
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined')
        stroke = true
    if (typeof radius === 'undefined')
        radius = 5
    if (typeof radius === 'number')
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        }
    else {
        var defaultRadius = {
            tl: 0,
            tr: 0,
            br: 0,
            bl: 0
        }
        for (var side in defaultRadius)
            radius[side] = radius[side] || defaultRadius[side]

    }

    ctx.beginPath()
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()
    if (fill)
        ctx.fill()

    if (stroke)
        ctx.stroke()

}

function SetCursor(cursor) {
    canvas.style.cursor = cursor
}

function GetCursorByType(type) {
    // console.log(type)
    switch (type) {
        case "Node":
            return "grab"
        default:
            return "pointer"
    }
}

function GetColorByType(type) {
    switch (type) {
        case "Number":
            return {
                fill: Color.white,
                stroke: Color.FromHex("#0077bb")
            }
        case "Boolean":
            return {
                fill: Color.white,
                stroke: Color.FromHex("#ff6600")
            }
        case "Array":
            return {
                fill: Color.white,
                stroke: Color.FromHex("#eeee44")
            }
        case "Object":
            return {
                fill: Color.white,
                stroke: Color.FromHex("#4444ee")
            }
        default:
            return {
                fill: Color.white,
                stroke: Color.FromHex("#808080")
            }
    }
}

function DrawConnection(source, dest, shadow) {
    ctx.strokeStyle = Color.white.toHex()
    ctx.beginPath()
    ctx.moveTo(source.x, source.y)

    if (fast_mode) {
        ctx.lineTo(dest.x, dest.y)
        ctx.stroke()
    } else {

        var mid = {
            x: (source.x + dest.x) / 2,
            y: (source.y + dest.y) / 2
        }

        var c_point1 = {
            x: (mid.x + source.x) / 2,
            y: source.y
        }

        var c_point2 = {
            x: (mid.x + dest.x) / 2,
            y: dest.y
        }

        ctx.bezierCurveTo(source.x, source.y, c_point1.x, c_point1.y, mid.x, mid.y)
        ctx.bezierCurveTo(mid.x, mid.y, c_point2.x, c_point2.y, dest.x, dest.y)
        ctx.stroke()

        if (shadow && !fast_mode) {
            ctx.strokeStyle = "rgba(0,0,0,0.15)"
            ctx.beginPath()
            ctx.moveTo(source.x + 5, source.y + 5)
            ctx.bezierCurveTo(source.x + 5, source.y + 5, c_point1.x + 5, c_point1.y + 5, mid.x + 5, mid.y + 5)
            ctx.bezierCurveTo(mid.x + 5, mid.y + 5, c_point2.x + 5, c_point2.y + 5, dest.x + 5, dest.y + 5)
            ctx.stroke()
        }
    }


}

var mouse_previous = {},
    lastCheck = Date.now()

var making_connection = false,
    con1, con2

var inmenu = false

canvas.addEventListener("wheel", (e) => {
    // console.log(e)
    // only scroll menus if not holding control

    if (e.ctrlKey == false && MenuOverlay.active) {
        // eventually check to see if within the open menu
        // console.log(e)
        // scrolling menu
        MenuOverlay.scrollHeight -= e.deltaY
        // console.log(MenuOverlay)
        UpdateAndDrawNodes()
    }

    e.preventDefault()
})

canvas.addEventListener('mousemove', (e) => {
    if (Mouse.buttons[e.button]) Mouse.dragging = true
    var rect = canvas.getBoundingClientRect()

    Mouse.position = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }

    Mouse.velocity = {
        x: Mouse.position.x - mouse_previous.x,
        y: Mouse.position.y - mouse_previous.y
    }

    mouse_previous = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }

    // Mouse.target = GetOverlappedNode(Mouse.position)

    // console.log(Mouse.velocity)

    // check if mouse is within a node if not dragging
    if (!Mouse.dragging) {
        var t = GetOverlappedNode(Mouse.position)

        if (t) {
            Mouse.target = t
            SetCursor(GetCursorByType(Mouse.target.type))
            // canvas.style.cursor = Mouse.target.type == "Node" ? "grab" : "pointer"
            return false
        } else {
            Mouse.target = undefined
            SetCursor("auto")
        }
    }

    if (Mouse.target && Mouse.dragging) {
        CloseMenuOverlay()
        // dragging something

        if (Mouse.target.type == "Node") {
            // if we selected objects with the selection box, and are dragging a selected node
            if (Array.isArray(Mouse.selected) && Mouse.selected.length > 0 && Mouse.selected.findIndex((node) => {
                return node.id == Mouse.target.id
            }) != -1) {
                Mouse.target.BringToFront()
                SetCursor("grabbing")

                Mouse.selected.forEach(sel_node => {
                    var p = sel_node.position

                    if (!sel_node.hasOwnProperty("dragOffset")) {
                        sel_node.dragOffset = {
                            x: Mouse.position.x - p.x,
                            y: Mouse.position.y - p.y
                        }
                    }


                    sel_node.position = {
                        x: Mouse.position.x - sel_node.dragOffset.x,
                        y: Mouse.position.y - sel_node.dragOffset.y
                    }

                    UpdateNodePositions(sel_node)
                })

                UpdateAndDrawNodes()
            } else {
                // deselect any selected nodes
                ClearMouseSelection()
                // if the target is a node, we're trying to move it!
                Mouse.target.BringToFront()
                SetCursor("grabbing")
                var p = Mouse.target.position

                if (typeof dragOffset == "undefined") {
                    dragOffset = {
                        x: Mouse.position.x - p.x,
                        y: Mouse.position.y - p.y
                    }
                }

                Mouse.target.position = {
                    x: Mouse.position.x - dragOffset.x,
                    y: Mouse.position.y - dragOffset.y
                }

                // Mouse.target.MarkDirty(true)

                UpdateNodePositions(Mouse.target)

                UpdateAndDrawNodes()
            }
        } else if (Mouse.target.type != "Selection" && Mouse.target.type != "ContextMenuItem") {
            // if the target is not a selection, EG any input/output
            SetCursor("crosshair")

            ClearCanvas()
            var endpoint = Mouse.position

            UpdateAndDrawNodes()
            var t = GetOverlappedNode(Mouse.position)

            // making_connection = false

            // console.log(t, Mouse.target)

            if (typeof t != "undefined" && t.type != "Node" && t.type != "Selection" && t.direction != Mouse.target.direction && t.parent != Mouse.target.parent && (t.type == Mouse.target.type || t.type == "Any" || Mouse.target.type == "Any")) {
                endpoint = t.position
                con1 = Mouse.target
                con2 = t
                making_connection = true
            }

            if (endpoint == Mouse.position) making_connection = false


            DrawConnection(Mouse.target.position, endpoint, true)

            // only draw point if following the mouse
            if (endpoint == Mouse.position) {
                if (!fast_mode) {
                    ctx.fillStyle = "rgba(0,0,0,0.15)"
                    ctx.strokeStyle = "rgba(0,0,0,0.15)"
                    circle(ctx, endpoint.x + 5, endpoint.y + 5, 5, true, true)
                }

                ctx.lineWidth = 2
                const color = GetColorByType(Mouse.target.type)
                ctx.fillStyle = color.fill.toHex()
                ctx.strokeStyle = color.stroke.toHex()
                circle(ctx, endpoint.x, endpoint.y, 5, true, true)
                ctx.lineWidth = 1
            }
        }
    } else if (Mouse.dragging) {
        // e.preventDefault()
        // console.log(Mouse.startPosition)
        if ((e.shiftKey || e.ctrlKey) && !Mouse.selecting) Mouse.slicing = true
        if ((!Mouse.slicing || Mouse.selecting)) {
            // dragging selection box
            const width = Mouse.position.x - Mouse.startPosition.x,
                height = Mouse.position.y - Mouse.startPosition.y

            UpdateAndDrawNodes()

            ctx.fillStyle = "rgba(0,255,128,0.1)"
            ctx.strokeStyle = "rgba(0,255,64,0.75)"
            ctx.beginPath()
            ctx.fillRect(Mouse.startPosition.x, Mouse.startPosition.y, width, height)
            ctx.stroke()

            Mouse.selecting = true
            // console.log("Selecting")
        } else if (!Mouse.selecting || Mouse.slicing) {
            // cutting wires
            UpdateAndDrawNodes()
            ctx.fillStyle = "rgba(0,255,128,0.1)"
            ctx.strokeStyle = "rgba(0,255,64,0.75)"
            ctx.beginPath()
            ctx.moveTo(Mouse.startPosition.x, Mouse.startPosition.y)
            ctx.lineTo(Mouse.position.x, Mouse.position.y)
            ctx.stroke()

            Mouse.slicing = true
            // console.log("Slicing")
        }
    }

}, false)

const overlay_text = document.getElementById("overlay_text")

document.addEventListener("dragover", (e) => {
    e.preventDefault()

    overlay_text.style.display = "block"
})

document.addEventListener("dragleave", (e) => {
    e.preventDefault()
    overlay_text.style.display = "none"
})

document.addEventListener("drop", (e) => {
    var rect = canvas.getBoundingClientRect()

    Mouse.position = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }

    overlay_text.style.display = "none"

    e.preventDefault()

    if (e.dataTransfer.items) {
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                var file = e.dataTransfer.items[i].getAsFile()
                LoadFile(file)
            }
        }
    } else {
        for (var i = 0; i < e.dataTransfer.files.length; i++) {
            LoadFile(e.dataTransfer.files[i])
        }
    }
})

function LoadFile(file) {
    const reader = new FileReader()

    reader.onload = function () {
        // console.log(reader.result)
        var node = LoadNodeFromFile(reader.result)
        node.position = Mouse.position

        UpdateAndDrawNodes()

        nodeSelector.value = null
    }

    reader.readAsText(file)
}

function ClearMouseSelection(clean) {
    clean = clean || false
    if (Mouse.selected)
        Mouse.selected.forEach(n => {
            delete (n.dragOffset)
        })

    if (clean)
        Mouse.selected = []
}

// this function will check all visible objects
// Nodes, context menus, dropdowns
// right now only checks nodes
function GetOverlappedNode(point) {
    var target = undefined

    if (Array.isArray(MenuOverlay.collision) && MenuOverlay.collision.length > 0) {
        MenuOverlay.collision.every(col => {

            if (draw_collision) DrawCollision(col)

            const xbound = Mouse.position.x >= col.x && Mouse.position.x <= col.x + col.width,
                ybound = Mouse.position.y >= col.y && Mouse.position.y <= col.y + col.height
            if (xbound && ybound) {
                target = {
                    type: "ContextMenuItem",
                    function: col.function
                }
                return false
            }
            // console.log(col)

            return true
        })
    } else CurrentContext.GetNodes().every(node => {
        var t = CheckPointInNode(node, point)

        if (typeof t != "undefined") {
            target = t
            return false
        }
        return true
    })

    return target
}

function DrawCollision(rect) {
    ctx.lineWidth = 1
    ctx.strokeStyle = "rgba(0,255,64,255)"
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
}

function CheckPointInNode(node, point) {
    const pos = node.position,
        scale = node.scale

    var bounds = {
        x: {
            min: pos.x - 5,
            max: pos.x + scale.x + 5
        },
        y: {
            min: pos.y,
            max: pos.y + scale.y
        }
    }

    if (draw_collision) DrawCollision({
        x: pos.x,
        y: pos.y,
        width: scale.x,
        height: scale.y
    })

    var target = undefined
    if (point.x >= bounds.x.min && point.x <= bounds.x.max && point.y >= bounds.y.min && point.y <= bounds.y.max) {
        target = node
        // WITHIN THIS NODE!

        const inputs = node.inputs,
            outputs = node.outputs

        // check each input/output circle
        Object.keys(inputs).every((k, i) => {
            // calc y level
            var y = pos.y + (20 + (i * 25)) - 4

            inputs[k].position = {
                x: bounds.x.min + 5,
                y: y
            }

            if (inputs[k].type != "Selection") {

                var new_x = bounds.x.min,
                    new_y = y - 8

                if (draw_collision)
                    DrawCollision({
                        x: new_x,
                        y: new_y,
                        width: 15,
                        height: 15
                    })

                // console.log(y)
                if (point.x >= new_x && point.x <= new_x + 15) {
                    if (point.y >= new_y && point.y <= new_y + 15) {
                        // inputs[k].position = {
                        //     x: bounds.x.min + 5,
                        //     y: y
                        // }
                        target = inputs[k]
                        return false
                    }
                }
            } else if (inputs[k].type == "Selection") {
                // roundRect(ctx, position.x + 10, position.y + nHeight - 12, scale.x / 2 - 10, 15, 5, true, true)
                var y = pos.y + (20 + (i * 25)) - 5
                var minY = y - 10
                var maxY = y + 8
                var minX = pos.x + 10
                var width = scale.x / 2
                var maxX = pos.x + width

                if (draw_collision)
                    DrawCollision({
                        x: pos.x + 10,
                        y: minY + 2,
                        width: width - 10,
                        height: 16
                    })
                // console.log(y)
                if ((point.x >= minX && point.x <= maxX) && (point.y >= minY && point.y <= maxY)) {
                    target = inputs[k]
                    return false
                }
            }

            return true
        })

        Object.keys(outputs).every((k, i) => {
            if (outputs[k].type == "Viewer") return
            // calc y level
            var y = pos.y + (20 + (i * 25)) - 12

            var new_x = bounds.x.max - 15

            if (draw_collision)
                DrawCollision({
                    x: new_x,
                    y: y,
                    width: 15,
                    height: 15
                })

            // console.log(y)
            if (point.x >= bounds.x.max - 15 && point.x <= bounds.x.max) {
                if (point.y >= y && point.y <= y + 15) {
                    outputs[k].position = {
                        x: bounds.x.max - 5,
                        y: y + 8
                    }
                    target = outputs[k]
                    return false
                }
            }

            return true
        })
    }

    return target
}

function UpdateNodePositions(node) {
    const pos = node.position,
        scale = node.scale

    const inputs = node.inputs,
        outputs = node.outputs

    var bounds = {
        x: {
            min: pos.x - 5,
            max: pos.x + scale.x + 5
        },
        y: {
            min: pos.y,
            max: pos.y + scale.y
        }
    }

    Object.keys(inputs).forEach((k, i) => {
        if (inputs[k].type != "Selection") {

            var y = pos.y + (20 + (i * 25)) - 4

            inputs[k].position = {
                x: bounds.x.min + 5,
                y: y
            }
        }

        return true
    })

    Object.keys(outputs).forEach((k, i) => {

        var y = pos.y + (20 + (i * 25)) - 4

        outputs[k].position = {
            x: bounds.x.max - 5,
            y: y
        }
    })
}

var MenuOverlay = {
    scrollHeight: 0,
    active: false
}

function UpdateAndDrawNodes() {
    context = CurrentContext || Manager
    ClearCanvas()

    DrawNodeConnections(context)

    var nodes = context.GetNodes()
    for (var i = nodes.length - 1; i >= 0; --i) {
        // if (nodes[i].isDirty())
        DrawNode(nodes[i])
    }

    // draw currently active menu
    if (MenuOverlay.active) {
        MenuOverlay.funct()
    }
}

function HexToRGB(hex) {
    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16)

    return {
        r: r,
        g: g,
        b: b
    }
}

var dragOffset = undefined

canvas.addEventListener('mousedown', (e) => {
    Mouse.buttons[e.button] = true

    if (Mouse.buttons[0]) Mouse.startPosition = Mouse.position

    e.preventDefault()
    e.stopPropagation()
})

canvas.addEventListener('mouseup', (e) => {
    Mouse.buttons[e.button] = false

    var no_update = false

    if (e.button == 0) {
        if (!Mouse.dragging) ClearMouseSelection(!MenuOverlay.active)

        if (Mouse.slicing) {
            var sliced_connections = []
            console.log("Stop slicing")
            Mouse.slicing = false

            // check all wires for intersections
            CurrentContext.GetNodes().forEach(node => {
                if (Object.keys(node.outputs).length > 0)
                    Object.keys(node.outputs).forEach(o => {
                        var output = node.outputs[o]

                        if (output.connections && output.connections.length > 0)
                            output.connections.forEach((c) => {
                                // calculate bezier curve if NOT in fast mode,
                                // otherwise just check a straight line
                                if (!fast_mode) {
                                    var mid = {
                                        x: (output.position.x + c.position.x) / 2,
                                        y: (output.position.y + c.position.y) / 2
                                    }

                                    var c_point1 = {
                                        x: (mid.x + output.position.x) / 2,
                                        y: output.position.y
                                    }

                                    var c_point2 = {
                                        x: (mid.x + c.position.x) / 2,
                                        y: c.position.y
                                    }

                                    // bezier curve will be calculated with low resolution for speed
                                    for (var i = 0; i <= 64; i += 2) {
                                        const t = i / 64,
                                            t2 = (i + 2) / 64

                                        let p1 = CalculateBezier(t, output.position, c_point1, mid),
                                            p2 = CalculateBezier(t2, output.position, c_point1, mid)

                                        let p3 = CalculateBezier(t, mid, c_point2, c.position),
                                            p4 = CalculateBezier(t2, mid, c_point2, c.position)

                                        if (Intersecting(Mouse.startPosition, Mouse.position, p1, p2) || Intersecting(Mouse.startPosition, Mouse.position, p3, p4)) {
                                            console.log("INTERSECTION!")
                                            sliced_connections.push({
                                                base: output,
                                                connection: c
                                            })
                                            break
                                        }
                                    }
                                } else {
                                    if (Intersecting(Mouse.startPosition, Mouse.position, output.position, c.position)) {
                                        console.log("INTERSECTION!")
                                        sliced_connections.push({
                                            base: output,
                                            connection: c
                                        })
                                    }
                                }

                            })
                    })
            })

            console.log("SLICED", sliced_connections)

            sliced_connections.forEach(con => {
                CurrentContext.RemoveOutputConnection(con.base, con.connection)
            })

            UpdateAndDrawNodes()
        }

        if (Mouse.selecting) {
            ClearMouseSelection()

            const bounds = {
                x: {
                    min: Math.min(Mouse.position.x, Mouse.startPosition.x),
                    max: Math.max(Mouse.position.x, Mouse.startPosition.x)
                },
                y: {
                    min: Math.min(Mouse.position.y, Mouse.startPosition.y),
                    max: Math.max(Mouse.position.y, Mouse.startPosition.y)
                }
            }

            var selected = []

            CurrentContext.GetNodes().forEach(node => {
                var inSelection = false
                var minX = node.position.x,
                    maxX = node.position.x + node.scale.x

                var minY = node.position.y,
                    maxY = node.position.y + node.scale.y

                //                                                             || now AND instead of OR
                // check if the far corners are within the selection bounds    \/
                var xInBounds = (minX >= bounds.x.min && minX <= bounds.x.max) && (maxX >= bounds.x.min && maxX <= bounds.x.max)
                var yInBounds = (minY >= bounds.y.min && minY <= bounds.y.max) && (maxY >= bounds.y.min && maxY <= bounds.y.max)

                inSelection = xInBounds && yInBounds

                if (inSelection) selected.push(node)
            })

            console.log("Stop selecting")

            console.log("SELECTED", selected)
            Mouse.selected = selected
            Mouse.selecting = false
        }

        if (typeof Mouse.target != "undefined") {
            if (Mouse.target.type == "Node") {
                CloseMenuOverlay()
                ClearMouseSelection()
            } else if (Mouse.target.type == "ContextMenuItem") {
                // if hovering over a context menu item
                if (Mouse.target.hasOwnProperty("function") && typeof Mouse.target.function != "undefined")
                    Mouse.target.function(), CloseMenuOverlay()

                UpdateAndDrawNodes()
            } else if (Mouse.target.type == "Selection") {
                SetCursor("auto")
                UpdateAndDrawNodes()
                // no_update = true

                // open the selection dropdown
                // make this selection the active MENU
                const pos = {
                    x: Mouse.target.position.x,
                    y: Mouse.target.position.y
                }
                SetMenuOverlay(pos, DrawSelectionDropdown, {
                    views: Mouse.target.views,
                    selection: Mouse.target,
                    parent: Mouse.target.parent
                })
            }
        } else {
            // ClearMouseSelection()
            CloseMenuOverlay()
        }

        if (!Mouse.buttons[e.button]) Mouse.dragging = false, dragOffset = undefined, Mouse.target = undefined
        if (making_connection) {
            // complete the connections
            console.log("CONNECTING", con1.id, "AND", con2.id)
            if (con1.direction == "OUTPUT" && con2.connections.length == 0)
                con1.connections.push(con2), con2.connections.push(con1)
            else if (con2.direction == "OUTPUT" && con1.connections.length == 0)
                con2.connections.push(con1), con1.connections.push(con2)

            making_connection = false
        }

        if (!no_update)
            UpdateAndDrawNodes()
    } else if (e.button == 2) {
        // release right click
        CloseMenuOverlay()
        UpdateAndDrawNodes()
        Mouse.target = GetOverlappedNode(Mouse.position)

        if (typeof Mouse.target != "undefined") {
            let node = Mouse.target.type == "Node" ? Mouse.target : Mouse.target.parent
            let node_id = node.id
            // right clicked on something
            if (Mouse.target.type == "Node") {

                // Node context menu
                // make this context the active MENU
                var views = []

                const has_inputs = Object.keys(node.GetInputs()).length != 0
                const has_outputs = Object.keys(node.GetOutputs()).length != 0

                var wires = {
                    title: "Wires",
                    views: []
                }

                var input_views = []
                if (!node.default) {
                    if (node.internal) {
                        if (node.internal_type == "INPUT")
                            input_views.push({
                                title: "New input",
                                function: () => {
                                    var n_node = CurrentContext.GetNode(node_id)
                                    n_node.AddOutput("Input", CreateAnyOutput())
                                    n_node.parent.AddInput("Input", CreateAnyInput())
                                }
                            })
                        if (node.internal_type == "OUTPUT")
                            input_views.push({
                                title: "New output",
                                function: () => {
                                    var n_node = CurrentContext.GetNode(node_id)
                                    n_node.AddInput("Output", CreateAnyInput())
                                    n_node.parent.AddOutput("Output", CreateAnyOutput())
                                }
                            })
                    } else {
                        input_views.push({
                            title: "New input",
                            function: () => {
                                var n_node = CurrentContext.GetNode(node_id)
                                n_node.AddInput("Input", CreateAnyInput())

                                if (n_node.hasOwnProperty("internal_inputs"))
                                    node.internal_inputs.AddOutput("Input", CreateAnyOutput())
                            }
                        }, {
                            title: "New output",
                            function: () => {
                                var n_node = CurrentContext.GetNode(node_id)
                                n_node.AddOutput("Output", CreateAnyOutput())

                                if (n_node.hasOwnProperty("internal_outputs"))
                                    node.internal_outputs.AddInput("Output", CreateAnyInput())
                            }
                        })
                    }

                    views.push({
                        title: "Input/Output",
                        views: input_views
                    })
                }

                if (has_inputs) wires.views.push({
                    title: "Detach input wires",
                    function: () => {
                        var node = CurrentContext.GetNode(node_id)
                        Object.keys(node.inputs).forEach(i => {
                            CurrentContext.RemoveInputConnections(node.inputs[i])
                        })
                    }
                })
                if (has_outputs) wires.views.push({
                    title: "Detach output wires",
                    function: () => {
                        var node = CurrentContext.GetNode(node_id)
                        Object.keys(node.outputs).forEach(o => {
                            CurrentContext.RemoveInputConnections(node.outputs[o])
                        })
                    }
                })
                if (has_inputs && has_outputs) wires.views.push({
                    title: "Detach all wires",
                    function: () => {
                        var node = CurrentContext.GetNode(node_id)
                        Object.keys(node.inputs).forEach(i => {
                            CurrentContext.RemoveInputConnections(node.inputs[i])
                        })
                        Object.keys(node.outputs).forEach(o => {
                            CurrentContext.RemoveInputConnections(node.outputs[o])
                        })
                    }
                })
                if (has_inputs || has_outputs) views.push(wires)

                var node_views = {
                    title: "Node",
                    views: []
                }

                if (node.internal == false && node.default == false)
                    node_views.views.push({
                        title: "Enter node",
                        function: () => {
                            EnterNodeContext(node)
                        }
                    }, {
                        title: "Export node",
                        function: () => {
                            SaveNode(node)
                        }
                    }, {
                        title: "Rename node",
                        function: () => {
                            // open modal?
                        }
                    }, {
                        title: "Delete node" + (Mouse.selected.length > 1 ? "s" : ""),
                        function: () => {
                            ContextDeleteNode(node)
                        }
                    })
                else if (node.internal == false) node_views.views.push({
                    title: "Delete node" + (Mouse.selected.length > 1 ? "s" : ""),
                    function: () => {
                        ContextDeleteNode(node)
                    }
                })

                if (node.internal == false)
                    views.push(node_views)

                const pos = {
                    x: Mouse.position.x,
                    y: Mouse.position.y
                }
                SetMenuOverlay(pos, DrawContextMenu, views)
            } else {
                // input/output context menu
                // make this context the active MENU
                var views = []

                // preserve the target for functions
                const target = Mouse.target

                if (!node.default) views.push({
                    title: "Input/Output",
                    views: [
                        // disabling these for now, just because I don't want the code to be complete spaghetti
                        //     {
                        //     title: `New ${target.direction.toLowerCase()}`,
                        //     function: () => {
                        //         var n_node = CurrentContext.GetNode(node_id)
                        //         if (target.direction == "INPUT") {
                        //             n_node.AddInput("Input", CreateAnyInput())
                        //         }
                        //         else {
                        //             n_node.AddOutput("Output", CreateAnyOutput())
                        //         }
                        //     }
                        // }, {
                        //     title: "Duplicate this",
                        //     function: () => {
                        //         var n_node = CurrentContext.GetNode(node_id)
                        //         const dir = target.direction.toLowerCase() + "s"

                        //         var name = target.direction.toLowerCase()
                        //         // hacky way, but I need to to get the name somehow
                        //         Object.keys(n_node[dir]).every(key => {
                        //             if (n_node[dir][key].id == target.id) return false, name = key
                        //             return true
                        //         })

                        //         if (target.direction == "INPUT") {
                        //             n_node.AddInput(name, CreateAnyInput())
                        //         }
                        //         else {
                        //             n_node.AddOutput(name, CreateAnyOutput())
                        //         }
                        //     }
                        // }, 
                        {
                            title: "Delete this",
                            function: () => {
                                if (node.internal) {
                                    var n_node = CurrentContext.GetNode(node_id)
                                    var parentNode = n_node.parent
                                    console.log(parentNode)
                                    const dir = target.direction.toLowerCase() + "s"

                                    var name = target.direction.toLowerCase()
                                    // hacky way, but I need to to get the name somehow
                                    Object.keys(n_node[dir]).every(key => {
                                        if (n_node[dir][key].id == target.id) return false, name = key
                                        return true
                                    })

                                    switch (target.direction) {
                                        case "INPUT":
                                            CurrentContext.RemoveInputConnections(n_node[dir][name])
                                            parentNode.context.RemoveOutputConnections(parentNode.outputs[name])
                                            delete (parentNode.outputs[name])
                                            break
                                        case "OUTPUT":
                                            CurrentContext.RemoveOutputConnections(n_node[dir][name])
                                            parentNode.context.RemoveInputConnections(parentNode.inputs[name])
                                            delete (parentNode.inputs[name])
                                            break
                                    }

                                    delete (n_node[dir][name])
                                } else {
                                    var n_node = CurrentContext.GetNode(node_id)
                                    const dir = target.direction.toLowerCase() + "s"

                                    var name = target.direction.toLowerCase()
                                    // hacky way, but I need to to get the name somehow
                                    Object.keys(n_node[dir]).every(key => {
                                        if (n_node[dir][key].id == target.id) return false, name = key
                                        return true
                                    })

                                    switch (target.direction) {
                                        case "INPUT":
                                            CurrentContext.RemoveInputConnections(n_node[dir][name])
                                            if (n_node.hasOwnProperty("internal_inputs")) {
                                                n_node.InternalManager.RemoveOutputConnections(n_node.internal_inputs["outputs"][name])
                                                // delete output
                                                const internal = n_node.InternalManager.GetNode(n_node.internal_inputs.id)
                                                delete (internal.outputs[name])
                                            }
                                            break
                                        case "OUTPUT":
                                            CurrentContext.RemoveOutputConnections(n_node[dir][name])
                                            if (n_node.hasOwnProperty("internal_outputs")) {
                                                n_node.InternalManager.RemoveInputConnections(n_node.internal_outputs["inputs"][name])

                                                const internal = n_node.InternalManager.GetNode(n_node.internal_inputs.id)
                                                delete (internal.inputs[name])
                                            }
                                            break
                                    }

                                    delete (n_node[dir][name])
                                }

                                // TODO: fix floating wire issue when deleting an i/o above a connected i/o
                            }
                        }
                    ]
                })

                views.push({
                    title: "Wires",
                    views: [{
                        title: "Detach All Wires",
                        function: () => {
                            var n_node = CurrentContext.GetNode(node_id)
                            const dir = target.direction.toLowerCase() + "s"

                            var name = target.direction.toLowerCase()
                            // hacky way, but I need to to get the name somehow
                            Object.keys(n_node[dir]).every(key => {
                                if (n_node[dir][key].id == target.id) return false, name = key
                                return true
                            })

                            switch (target.direction) {
                                case "INPUT":
                                    CurrentContext.RemoveInputConnections(n_node[dir][name])
                                    break
                                case "OUTPUT":
                                    CurrentContext.RemoveOutputConnections(n_node[dir][name])
                                    break
                            }
                        }
                    }]
                })

                var node_views = {
                    title: "Node",
                    views: []
                }

                if (node.internal == false && node.default == false)
                    node_views.views.push({
                        title: "Enter node",
                        function: () => {
                            EnterNodeContext(node)
                        }
                    }, {
                        title: "Rename node",
                        function: () => {
                            // open modal?
                        }
                    }, {
                        title: "Delete node" + (Mouse.selected.length > 1 ? "s" : ""),
                        function: () => {
                            ContextDeleteNode(node)
                        }
                    })
                else node_views.views.push({
                    title: "Delete node" + (Mouse.selected.length > 1 ? "s" : ""),
                    function: () => {
                        ContextDeleteNode(node)
                    }
                })

                if (node.internal == false)
                    views.push(node_views)

                const pos = {
                    x: Mouse.position.x,
                    y: Mouse.position.y
                }
                SetMenuOverlay(pos, DrawContextMenu, views)
            }
        } else {
            // general context menu
            // make this context the active MENU
            const pos = {
                x: Mouse.position.x,
                y: Mouse.position.y
            }
            var views = [{
                title: "Nodes",
                views: [{
                    title: "Create empty node",
                    function: () => {
                        var n = CurrentContext.CreateNode()
                        // n.execute = () => { }
                        n.position = pos
                    }
                }, {
                    title: "Select all nodes",
                    function: () => {
                        Mouse.selected = CurrentContext.GetNodes()
                    }
                }]
            }]
            SetMenuOverlay(pos, DrawContextMenu, views)
        }
    }

    // prevent default right click actions
    e.preventDefault()
    e.stopPropagation()
})

function EnterNodeContext(node) {
    if (!node.InternalManager.hasOwnProperty("internal_nodes_created")) {
        var inputs = CreateInternalInputsNode(node.inputs, node.InternalManager)
        var outputs = CreateInternalOutputsNode(node.outputs, node.InternalManager)

        inputs.parent = node
        outputs.parent = node

        node.internal_inputs = inputs
        node.internal_outputs = outputs

        // center of screen
        var center = {
            x: canvas.width / 2,
            y: canvas.height / 2
        }

        inputs.position = {
            x: center.x - 150 - inputs.scale.x,
            y: center.y
        }

        outputs.position = {
            x: center.x + 150,
            y: center.y
        }

        node.InternalManager.internal_nodes_created = true
    }

    context_path.push(node.InternalManager)
    CurrentContext = node.InternalManager

    UpdateAndDrawNodes()
}

function ContextDeleteNode(node) {
    if (Mouse.selected.length > 1) CurrentContext.BatchDelete(Mouse.selected)
    else CurrentContext.DeleteNode(node.id)
}

function SetMenuOverlay(position, funct, data) {
    // menu collision set by rendering function
    MenuOverlay.collision = []
    // set the rendering function to use when drawing this menu
    MenuOverlay.funct = () => {
        funct(data, position)
    }
    MenuOverlay.active = true
    UpdateAndDrawNodes()
}

function CloseMenuOverlay() {
    MenuOverlay.active = false
    MenuOverlay.collision = []
    MenuOverlay.scrollHeight = 0
}

function DrawSelectionDropdown(data, position) {
    const views = data.views
    const parent = data.parent
    const selection = data.selection

    var calc_height = (views.length) * 15 + 5
    var height = Math.max(15, calc_height)
    var drawScroll = false
    if (height > 155) height = 155, drawScroll = true

    var end_height = (views.length - 1) * 15 + 5

    MenuOverlay.scrollHeight = Math.min(0, Math.max(-end_height + (9 * 15 + 5), MenuOverlay.scrollHeight))

    if (!fast_mode) {
        ctx.fillStyle = "rgba(0,0,0,0.15)"
        ctx.strokeStyle = "rgba(0,0,0,0.15)"
        roundRect(ctx, position.x + 20, position.y + 16, parent.scale.x * 0.75, height, 5, true, false)
    }

    ctx.strokeStyle = "white"
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    roundRect(ctx, position.x + 10, position.y + 6, parent.scale.x * 0.75, height, 5, true, true)

    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.textAlign = "left"

    MenuOverlay.collision = []

    views.every((view, i) => {
        const h = 20 + i * 15 + (drawScroll ? MenuOverlay.scrollHeight : 0)

        if (h >= 16 && h <= height + 2)
            ctx.fillText(view.name, position.x + 14, position.y + h),
                MenuOverlay.collision.push({
                    x: position.x + 10,
                    y: position.y + h - 12,
                    width: parent.scale.x * 0.75,
                    height: 15,
                    function: () => {
                        console.log(i)
                        selection.SetSelection(i)
                    }
                })
        return true
    })

    // something is wrong with collision detection so I'm disabling this
    // MenuOverlay.collision.push({
    //     x: position.x,
    //     y: position.y,
    //     width: parent.scale.x * 0.75,
    //     height: height
    // })

    if (drawScroll) {
        ctx.fillStyle = "rgba(128,128,128,0.25)"
        ctx.strokeStyle = "white"
        var new_height = position.y + 6

        // scroll bar shows up fine for the only Selection that has a scroll bar
        // but testing with any amount of items shows that it isn't generalized.
        // fix this!

        var c = MenuOverlay.scrollHeight,
            b = calc_height,
            y = height - (height / 3.75)

        var result = (c * y) / b

        new_height -= result

        roundRect(ctx, (position.x + 10) + (parent.scale.x * 0.75) - 8, new_height, 8, height / 2, 5, true, false)
    }
}

function DrawContextMenu(views, position) {
    var num = views.length
    views.forEach(v => {
        num += v.views.length
    })
    var calc_height = (num * 18) + 10
    var height = Math.max(15, calc_height)

    if (!fast_mode) {
        ctx.fillStyle = "rgba(0,0,0,0.15)"
        ctx.strokeStyle = "rgba(0,0,0,0.15)"
        roundRect(ctx, position.x + 10, position.y + 10, 170, height, 5, true, false)
    }

    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.strokeStyle = "white"
    roundRect(ctx, position.x, position.y, 170, height, 5, true, true)
    // var drawScroll = false
    // not sure why this is here

    ctx.font = "bold 12px Arial"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "white"
    ctx.textAlign = "left"
    var i = 0

    MenuOverlay.collision = []

    views.forEach((view) => {
        var h = 16 + i * 18

        if (view.title) {
            ctx.fillStyle = "gray"
            ctx.font = "bold 15px Arial"
            ctx.fillText(view.title, position.x + 6, position.y + h + 2)
            ctx.font = "bold 12px Arial"
            ctx.fillStyle = "white"
        }

        // console.log(view)
        i++

        view.views.forEach(element => {
            // console.log(element)
            h = 16 + i * 18
            ctx.fillText(element.title, position.x + 6, position.y + h)
            MenuOverlay.collision.push({
                x: position.x,
                y: position.y + h - 12,
                width: 170,
                height: 18,
                function: element.function
            })
            i++
        })
        // something is wrong with "collision" so I'm disabling this
        // add "collision" for the context menu so it doesn't close when you click inside the rectangle
        // MenuOverlay.collision.push({
        //     x: position.x,
        //     y: position.y,
        //     width: 170,
        //     height: height
        // })
    })
}

function CalculateBezier(t, p1, p2, p3) {
    // x = (1−t)2x1 + 2(1−t)tx2 + t2x3
    var n_x = Math.pow((1 - t), 2) * p1.x
    n_x += 2 * (1 - t) * t * p2.x
    n_x += Math.pow(t, 2) * p3.x

    // y = (1−t)2y1 + 2(1−t)ty2 + t2y3
    var n_y = Math.pow((1 - t), 2) * p1.y
    n_y += 2 * (1 - t) * t * p2.y
    n_y += Math.pow(t, 2) * p3.y

    return {
        t: t,
        x: n_x,
        y: n_y
    }
}

function OnLine(l1, l2, p) {
    if (p.x <= Math.max(l1.x, l2.x) && p.x <= Math.min(l1.x, l2.x) && (p.y <= Math.max(l1.y, l2.y) && p.y <= Math.min(l1.y, l2.y)))
        return true

    return false
}

function LineDirection(a, b, c) {
    var val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
    if (val == 0)
        return 0
    else if (val < 0)
        return 2
    return 1
}

function Intersecting(l1p1, l1p2, l2p1, l2p2) {
    var dir1 = LineDirection(l1p1, l1p2, l2p1),
        dir2 = LineDirection(l1p1, l1p2, l2p2),
        dir3 = LineDirection(l2p1, l2p2, l1p1),
        dir4 = LineDirection(l2p1, l2p2, l1p2)

    if (dir1 != dir2 && dir3 != dir4) return true
    if (dir1 == 0 && OnLine(l1p1, l1p2, l2p1)) return true
    if (dir2 == 0 && OnLine(l1p1, l1p2, l2p2)) return true
    if (dir3 == 0 && OnLine(l2p1, l2p2, l1p1)) return true
    if (dir4 == 0 && OnLine(l2p1, l2p2, l1p2)) return true

    return false
}

window.addEventListener("keydown", (e) => {
    if (event.isComposing || event.keyCode === 229)
        return

    if (e.ctrlKey) {
        switch (e.keyCode) {
            // CTRL+A = select all
            case 65:
                Mouse.selected = CurrentContext.GetNode()
                Mouse.selected = CurrentContext.GetNodes()
                console.log("SELECTED", Mouse.selected)
                UpdateAndDrawNodes()
                break
            // CTRL+S = save workspace
            case 83:
                SetCursor("wait")
                SaveWorkspace(Manager)
                SetCursor("default")
                break
        }

        e.preventDefault()
        return false
    }
})

window.addEventListener("keyup", (e) => {
    // backspace or delete
    if (e.keyCode == 8 || e.keyCode == 46) {
        if (Mouse.selected.length > 0) CurrentContext.BatchDelete(Mouse.selected), UpdateAndDrawNodes()

        // commenting this out for now
        // not sure how often you might unintentionally delete a node 
        // else {
        //     // check if hovering over a node
        //     var t = GetOverlappedNode(Mouse.position)

        //     if (t && t.type == "Node") CurrentContext.DeleteNode(t.id), UpdateAndDrawNodes()
        // }
    }
    // escape
    if (e.keyCode == 27) {
        // if context_path has more than one entry
        if (context_path.length > 1) {
            // remove the most recently added "context"
            context_path.pop()
            CurrentContext = context_path[context_path.length - 1]

            UpdateAndDrawNodes()
        } else if (CurrentContext != Manager) {
            CurrentContext = Manager

            UpdateAndDrawNodes()
        }
    }
    // space bar
    if (e.keyCode == 32) {
        if (e.shiftKey) SetStep()
        else TogglePause()

        e.preventDefault()
    }
})

// prevent default canvas context menu
canvas.addEventListener('contextmenu', (e) => {
    if (e.button == 2)
        e.preventDefault()
})

// reinit canvas if the window gets resized
// (recolor the background, basically)
window.addEventListener("resize", () => {
    InitCanvas()
})

// check for nodes that can be activated
setInterval(() => {
    var redraw_nodes = false

    if (step && !pause_execution) TogglePause(), step = false
    if (step && pause_execution) TogglePause()
    if (pause_execution) return

    // Iterate over previously scheduled nodes

    // check Manager, rather than CurrentContext because all internal contexts take input from Manager in the end
    Manager.GetNodes().forEach(node => {
        // sum all non selection inputs
        var inputs = 0,
            outputs = 0
        Object.keys(node.inputs).forEach(l => {
            if (node.inputs[l].type != "Selection") inputs++
        })
        // sum all outputs
        Object.keys(node.outputs).forEach(l => {
            if (node.outputs[l].hasOwnProperty("connections"))
                outputs += node.outputs[l].connections.length
        })

        // if this node has zero inputs, but some outputs
        // OR if this node has any inputs and outputs
        if ((inputs == 0 && outputs > 0) || outputs > 0) {
            try {
                // not scheduled because uhhh...
                // there's a good reason, and I'm sure there's logic that supports it
                node.execute()
            } catch (err) {
                console.log(err)
            }
            redraw_nodes = true
        }
    })

    Schedule.Iterate()

    // If the mouse isn't doing something
    if (redraw_nodes && (!Mouse.dragging && !Mouse.selecting && !Mouse.slicing)) UpdateAndDrawNodes()
}, 16)

InitCanvas()
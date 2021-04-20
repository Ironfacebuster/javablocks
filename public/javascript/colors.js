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

class Color {
    r = 0
    g = 0
    b = 0
    a = 255

    /**
     * Construct a Color
     * @param {Number} r The value of the R channel
     * @param {Number} g The value of the G channel
     * @param {Number} b The value of the B channel
     */
    constructor(r, g, b, a) {
        this.r = ClampColorChannel(r || 0)
        this.g = ClampColorChannel(g || 0)
        this.b = ClampColorChannel(b || 0)
        if (a) this.a = ClampColorChannel(a || 0)
    }

    /**
     * @returns {String} A hex color code
     */
    toHex() {
        var colorstring = "#" + this.r.toString(16).padStart(2, 0) + this.g.toString(16).padStart(2, 0) + this.b.toString(16).padStart(2, 0)

        if (this.a != 255) colorstring = colorstring + this.a.toString(16).padStart(2, 0)

        return colorstring
    }

    add(color) {
        if (typeof color == "string") color = Color.FromHex(color)
        var nColor = new Color()

        nColor.r = ClampColorChannel(this.r + color.r)
        nColor.g = ClampColorChannel(this.g + color.g)
        nColor.b = ClampColorChannel(this.b + color.b)

        return nColor
    }

    subtract(color) {
        if (typeof color == "string") color = Color.FromHex(color)
        var nColor = new Color()

        nColor.r = ClampColorChannel(this.r - color.r)
        nColor.g = ClampColorChannel(this.g - color.g)
        nColor.b = ClampColorChannel(this.b - color.b)

        return nColor
    }

    divide(amount) {
        var nColor = new Color()

        nColor.r = ClampColorChannel(this.r / amount)
        nColor.g = ClampColorChannel(this.g / amount)
        nColor.b = ClampColorChannel(this.b / amount)

        return nColor
    }

    multiply(amount) {
        var nColor = new Color()

        nColor.r = ClampColorChannel(this.r / amount)
        nColor.g = ClampColorChannel(this.g / amount)
        nColor.b = ClampColorChannel(this.b / amount)

        return nColor
    }

    /**
     * @returns {String} A hex color code
     */
    static get hex() {
        return this.toHex()
    }

    /**
     * Converts a hex color code to a color object.
     * @param {String} hex A hex color code
     * @returns {Color} A color Object
     */
    static FromHex(hex) {
        if (hex[0] == "#") hex = hex.substr(1)
        hex = hex.padEnd(6, 0)

        const r = parseInt(hex.substr(0, 2), 16),
            g = parseInt(hex.substr(2, 2), 16),
            b = parseInt(hex.substr(4, 2), 16)

        var a = 255
        if (hex.length > 6) a = parseInt(hex.substr(6, 2))

        return new Color(r, g, b, a)
    }

    static get white() {
        return new Color(255, 255, 255)
    }

    static lerp(a, b, t) {
        if (typeof a == "string") a = Color.FromHex(a)
        if (typeof b == "string") b = Color.FromHex(b)

        var final = new Color()

        final.r = (a.r * (1 - t) + b.r * t)
        final.g = (a.g * (1 - t) + b.g * t)
        final.b = (a.b * (1 - t) + b.b * t)
        final.a = (a.a * (1 - t) + b.a * t)

        return final
    }
}

function ClampColorChannel(i) {
    return Math.round(Math.min(Math.max(i, 0), 255))
}
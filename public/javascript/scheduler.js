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

class Scheduler {
    actions = []
    next = []
    constructor() {

    }

    /**
     * Schedule a Node's execution.
     * @param {Node} node 
     * @param {Array} finished 
     */
    Schedule(node, finished) {
        // Do not allow multiple scheduling
        if (this.actions.findIndex(a => { return a.node.id == node.id }) != -1) return

        finished = finished || []

        this.actions.push(new Action(node, finished))
    }

    Iterate() {
        // next scheduled actions become current actions
        // this.actions = [].concat(this.next)
        // this.next = []

        // iterate through all the actions
        this.actions.forEach(action => {
            action.node.execute(action.finished)
        })

        // clear actions
        this.actions = []
    }
}

class Action {
    constructor(node, finished) {
        // ID with length of 32 because why not
        // might lower it if the generate ID function slows down the loop too much
        this.id = GenerateID(32)
        this.node = node
        this.finished = finished
    }
}

window.Schedule = new Scheduler()
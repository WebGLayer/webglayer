// By Steve Hanov (2014)
// Released to public domain
//
// Minimum element is always on top.
// You can pass in an optional lessThan(a, b) function to the constructor.
// You may use .length to retrieve the length. Try not to set it though.

function Heap()
{
    if (arguments.length) {
        this.lessThan = arguments[0];
    } else {
        this.lessThan = function(a, b) {
            return a < b;
        };
    }
    this.length = 0;
    this.A = [];
}

Heap.prototype = {

    push: function(item) {
        var A = this.A;
        A.push(item);
        var i = A.length-1;
        while(i > 0 && !this.lessThan(A[i/2|0], A[i])) {
            var temp = A[i/2|0];
            A[i/2|0] = A[i];
            A[i] = temp;
            i = i/2|0;
        }

        this.length += 1;
    },

    pop: function() {
        var A = this.A;
        if (A.length === 0) {
            return;
        }

        var max = A[0];
        A[0] = A[A.length-1];
        this._heapify(0);
        A.length -= 1;
        this.length -= 1;
        return max;
    },

    _heapify: function(i) {
        i += 1;
        var l = 2 * i;
        var r = 2 * i + 1;
        var A = this.A;
        var largest;
        if (l <= A.length && this.lessThan(A[l-1], A[i-1])) {
            largest = l;
        } else {
            largest = i;
        }

        if (r <= A.length && this.lessThan(A[r-1], A[largest-1])) {
            largest = r;
        }

        if (largest !== i) {
            var temp = A[i-1];
            A[i-1] = A[largest-1];
            A[largest-1] = temp;
            this._heapify(largest-1);
        }
    }
};


// JavaScript source code

// A simple Timer class.
function Timer() {
    this.start_ = new Date();

    this.elapsed = function () {
        return (new Date()) - this.start_;
    }

    this.reset = function () {
        this.start_ = new Date();
    }
}

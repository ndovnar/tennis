/*var Ball = (function () {

 function Ball() {
 console.log(this);
 }

 return Ball;

 })();*/

var Ball = (function () {
    function Ball(self) {
        console.log(this);
        console.log(self);
    }

    return Ball;
})();

var Tennis = (function () {
    function Tennis() {
        this.init();
        //this.ball = undefined;
    }

    Tennis.prototype.init = function () {
        this.ball = new Ball(this);
    };


    return Tennis;
})();


var tennis = new Tennis;
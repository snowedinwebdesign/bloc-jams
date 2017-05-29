var animatePoints = function() {

           var points = document.getElementsByClassName('point');

           var revealPoint = function(num) {
               points[num].style.opacity = 1;
               points[num].style.transform = "scaleX(1) translateY(0)";
               points[num].style.msTransform = "scaleX(1) translateY(0)";
               points[num].style.WebkitTransform = "scaleX(1) translateY(0)";
           };
           for (var = 0; i < points.length; i++) {
             revealPoint(i);
           }
};

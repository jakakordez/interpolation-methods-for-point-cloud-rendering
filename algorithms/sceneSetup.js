import {Vector3} from '../src/math/Vector3.js'

export var FILENAME = "";
export var POSITION = new Vector3(0, 0, 0);
export var ROTATIONX = 0.0;
export var ROTATIONY = 0.0;
export var ROTATIONZ = 0.0;

var testCase = parseInt(window.location.search.substr(1))
console.log("Loading test case " + testCase)
switch(testCase)
{
    case 1:
        FILENAME = "test1.las";
        POSITION = new Vector3(-20.6, 243.8, 354);
        ROTATIONX = -0.96;
        ROTATIONY = -0.03;
        ROTATIONZ = -3.17;
        break;
    case 2:
        FILENAME = "test2.las";
        POSITION = new Vector3(60.9, 402.3, 284.5);
        ROTATIONX = 2.03;
        ROTATIONY = -2.02;
        ROTATIONZ = 0.19;
        break;
    case 3:
        FILENAME = "test3.las";
        POSITION = new Vector3(338.9, 243.8, 331);
        ROTATIONX = 0.15;
        ROTATIONY = 0.15;
        ROTATIONZ = 0;
        break;
    case 4:
        FILENAME = "test4.las";
        POSITION = new Vector3(275.9, 137.8, 176);
        ROTATIONX = 0.43;
        ROTATIONY = 0.04;
        ROTATIONZ = 0;
        break;
    case 5:
        FILENAME = "test5.las";
        POSITION = new Vector3(252.4, -5.7, 127.5);
        ROTATIONX = 0.84;
        ROTATIONY = 0;
        ROTATIONZ = 0;
        break;
    case 6:
        FILENAME = "test6.las";
        POSITION = new Vector3(252.4, -5.7, 58);
        ROTATIONX = 0.93;
        ROTATIONY = 0;
        ROTATIONZ = 0;
        break;
    case 7:
        FILENAME = "density.las";
        POSITION = new Vector3(104, 82, -183);
        ROTATIONX = -0.07;
        ROTATIONY = 3.12;
        ROTATIONZ = 3.15;
        break;
}
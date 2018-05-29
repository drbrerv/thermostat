$(document).ready(
    function () {
	if( typeof InstallTrigger !== 'undefined' ){
	    console.log("main() user agent: should be FireFox " + typeof InstallTrigger );
	    ffCheck = true;
	}
	browserLoad( ffCheck );
    }
);

var ffCheck = false;
var selectedElement = 0;
var currentX = 0;
var currentY = 0;
var currentAngle = 0;
var currentMouseAngle = 0;
var dragTrack = null;
var tempSetting = angleToTemp( currentMouseAngle );

function mouse_down( doevt )
{
    var radians = 0;

    if( ffCheck )
	doevt.preventDefault();

    $('#bezel-circle').css('cursor', 'url("/jstest/grabbing.svg"), move');

    selectedElement = doevt.target;

    [currentX, currentY] = domtoSVG( doevt.clientX, doevt.clientY );
    dragTrack = currentY;

    selectedElement.setAttributeNS( null, "onmousemove", "mouse_move(evt)");
    selectedElement.setAttributeNS( null, "onmouseup", "mouse_out(evt)");
    selectedElement.setAttributeNS( null, "onmouseout", "mouse_out(evt)");

    radians = calculateMouseRadians( [currentX, currentY] );
    currentMouseAngle = radiansToDegrees( radians );

}

function mouse_move( doevt )
{
    var rotateString = null, newRad = 0, evtX = null, evtY = null, rotateToAngle = 0,
	deg = 0, diff = 0, doCorrect = false;

    if( ffCheck )
	doevt.preventDefault();

    [evtX, evtY] = domtoSVG( doevt.clientX, doevt.clientY );
    /*
     * try to catch when the mouse goes over our problem spot 
    */
    doCorrect = trackMove( evtX, evtY );

    newRad = calculateMouseRadians( [evtX, evtY] );
    deg = radiansToDegrees( newRad );

    diff = (currentMouseAngle - deg) * -1;
    // console.log("mouse_move() diff: " + diff + " X: " + evtX + " Y: " + evtY + " doCorrect " + doCorrect );
    if( doCorrect == 1 ){
	diff += 360;
	// console.log("mouse_move() scenario 1 corrected diff: " + diff );
    }
    else if( doCorrect == 2 ){
	diff -= 360;
	// console.log("mouse_move() scenario 2 corrected diff: " + diff );
    }

    rotateToAngle = currentAngle + diff;

    // console.log("mouse_move() currentMouseAngle: " + currentMouseAngle + " deg: " + deg );
    // console.log("mouse_move() rotateToAngle: " + rotateToAngle );

    /*
    rotateString = 'rotate(' + rotateToAngle + ', 200, 200)';
    // console.log("mouse_move() currentAngle " + currentAngle );
    $('#rotate-group').attr( 'transform', rotateString );
    currentMouseAngle = deg;
    currentAngle = rotateToAngle;
    */

    if( rotateToAngle >= -90 && rotateToAngle <= 90 ){
	rotateString = 'rotate(' + rotateToAngle + ', 200, 200)';
	// console.log("mouse_move() currentAngle " + currentAngle );
	$('#rotate-group').attr( 'transform', rotateString );
	currentAngle = rotateToAngle;
    }
    else if( rotateToAngle > 90 && currentAngle != 90 ){
	rotateString = 'rotate(90, 200, 200)';
	$('#rotate-group').attr( 'transform', rotateString );
	currentAngle = 90;
    }
    else if( rotateToAngle < -90 && currentAngle != -90 ){
	rotateString = 'rotate(-90, 200, 200)';
	$('#rotate-group').attr( 'transform', rotateString );
	currentAngle = -90;
    }

    tempSetting = angleToTemp( currentAngle );
    // console.log("mouse_move() currentAngle " + currentAngle + " temp is (maybe?): " + tempSetting );
    currentMouseAngle = deg;

}

function mouse_out( doevt )
{
    // console.log("mouse_out() currentAngle: " + currentAngle );
    $('#bezel-circle').css('cursor', 'url("/jstest/grab.svg"), move');
    selectedElement.removeAttributeNS( null, "onmousemove" );
    selectedElement.removeAttributeNS( null, "onmouseup" );
    selectedElement.removeAttributeNS( null, "onmouseout" );
    selectedElement = 0;
    dragTrack = null;
    alert("Your temp setting: " + tempSetting );
}

function trackMove( x, y )
{
    var retval = 0;

    /*
     * 2 scenarios to correct:
     *
     * 1.) mouse is dragging clockwise:
     *   - Y coordinate increases toward 200
     *   - when Y crosses 200, "diff" needs to get
     *     corrected by adding 360
     *
     * 2.) mouse drags counter-clockwise:
     *   - Y coordinate decreases toward 200
     *   - when Y crosses 200, diff needs to get
     *     corrected by adding 360
     *
     * otherwise:
     *
     * Add Y coordinate to the end of the list because the
     * mouse is in the "zone," but has not yet crossed the line
     *
     */

    if( x < 250 ){
	retval = 0;
    }
    else if( dragTrack < 200 && y >= 200 ){
	// scenario 1:
	retval = 1;
    }
    else if( dragTrack > 200 && y <= 200 ){
	// scenario 2:
	retval = 2;
    }

    dragTrack = y;
    return retval;

}

function calculateMouseRadians( p1 )
{
    var x = 0, y = 0;

    x = p1[0] - 200;
    y = p1[1] - 200;

    return Math.atan2( y, x );

}

function radiansToDegrees( rad )
{
    var deg = rad * 180 / Math.PI;

    if( deg < 0 ){
	return 360 - (-1 * deg);
    }
    else{
	return deg;
    }

}

function domtoSVG( x, y )
{
    var svg = document.getElementById('thermostat'), pt = svg.createSVGPoint(),
    tSvg = null;

    pt.x = x;
    pt.y = y;

    tSvg = pt.matrixTransform( svg.getScreenCTM().inverse() );

    return [ tSvg.x, tSvg.y ];

}

function dragStart( drgevt )
{
    var mevt = drgevt || event;
    mevt.preventDefault();
    return false;
}

function browserLoad( fireFox = false )
{
    var numbers = [ '50', '60', '70', '80', '90' ];
    var scaleHTML = numbers[0] + ' ';

    for( var z = 1; z < numbers.length; z++ )
	if( fireFox == true )
	    scaleHTML += '<tspan dx="1.2em">' + numbers[z] + '</tspan> ';
	else
	    scaleHTML += numbers[z] + ' ';

    $('#therm-scale').html( scaleHTML );

    if( fireFox == true ){
	// $('#logo-text').attr('textLength', '108.6');
	var logoText = document.getElementById('logo-text');
	var bezelCircle = document.getElementById('bezel-circle');

	logoText.setAttributeNS( null, 'textLength', '108.6' );
	bezelCircle.setAttributeNS( null, 'draggable', 'false' );
	bezelCircle.setAttributeNS( null, 'ondragstart', 'dragStart(evt)' );
    }

}

function angleToTemp( angle )
{
    return round( ((angle + 90) / 3) + 40, 2 );
}

function round( number, precision = 0 )
{
    var shift = function( number, exponent ){
	var numArray = ("" + number).split('e');
	return +(numArray[0] + 'e' + (numArray[1] ? (+numArray[1] + exponent) : exponent ));
    };
    return shift( Math.round( shift(number, +precision)), -precision );
}

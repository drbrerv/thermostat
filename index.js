$(document).ready(
    function () {
	new Clipboard('#another');

	if( typeof InstallTrigger !== 'undefined' ){
	    console.log("main() user agent: should be FireFox " + typeof InstallTrigger );
	    ffCheck = true;
	}
	browserLoad( ffCheck );

	mybutt();

    }
);

function calcAngle()
{
    var xstr = null, ystr = null, x = null, y = null;

    /*
     * https://gamedev.stackexchange.com/questions/14602/what-are-atan-and-atan2-used-for-in-games
     *
     * http://www.gamefromscratch.com/post/2012/11/18/GameDev-math-recipes-Rotating-to-face-a-point.aspx
     *
    */

    xstr = $('#x-coord').val();
    ystr = $('#y-coord').val();

    console.log("calcAngle() xstr: "+ xstr + " ystr: " + ystr );

    x = parseFloat( xstr );
    y = parseFloat( ystr );

    if( typeof(x) == 'number' && typeof(y) == 'number' ){
	var rad = Math.atan2( y, x );
	var deg = rad * (180 / Math.PI);
	console.log("calcAngle() radians is: " + rad + " degrees: " + deg   );
    }

}

class RequestMaker
{
    construct()
    {
	this.rm_msg = '';
    }

    slow_request()
    {
	var inst = this;
	var msg = null;
	return new Promise( resolve => {
	    var rs = function( msg ){
		resolve( msg + "...and then this thingy was added by 'resolver()'");
	    }
	    this.actual_request( rs );
	});
    }

    actual_request( rfunc )
    {

	$.ajax({
	    url: '/php/slow.php',
	    // async: false,
	    method: 'GET',
	    success: function ( result ) {
		rfunc( result + "...that came from the website, this was added by AJAX");
	    }
	});

    }

}

function mybutt(){
   $("#myButt").click( async function (){
       var rm = new RequestMaker();
       console.log("Hang on a sec.  I have a feeling this will take a while");
       var stuff = await rm.slow_request();
       console.log("mybutt() got stuff: " + stuff );
   });
 }

var globObj = {
    k_list: [
	'one', 'two', 'three', 'four', 'five', 'six', 'seven', 
	'eight', 'nine', 'ten'
    ],
    d_obj: {},
    r_obj: []
};

function reftest( bclik )
{
    for( var z = 0; z < globObj.k_list.length; z++ ){
	var y = (z + 5) * 40;
	globObj.d_obj[globObj.k_list[z]] = y;
	console.log("set dataobject " + globObj.k_list[z] + " to " + y);
    }
    var lobj = globObj.d_obj;
    console.log("Done.");
    var klist = Object.keys( globObj.d_obj );
    for( var z = 0; z < klist.length; z++ ){
	console.log("klist key: " + klist[z] + " local object: " + lobj[klist[z]]);
	lobj[klist[z]] *= 50;
    }
    console.log("Done2.");
    for( var z = 0; z < klist.length; z++ ){
	console.log("klist key: " + klist[z] + " global object: " + globObj.d_obj[klist[z]] );
    }
}

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

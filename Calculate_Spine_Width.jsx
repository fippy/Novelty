﻿/* A quick sketch to estimate spine widths from Griffin */

#target indesign;

var papers = new Array();

papers.push({
	name:"Griffin Paperback Cream 65gsm",
	glue: 0.51,
	thickness: 0.07,
	units: 2053991795
},{
	name:"Griffin Paperback Cream 50gsm",
	glue: 0.51,
	thickness: 0.06,
	units: 2053991795
});

function getPropList( obj, key ) {
    var len = obj.length;
    var propList = new Array();
    for (var i = 0; i < len; i++) {
        propList[i] = obj[i][key];
    }
    return propList;
}

function calculateSpine( paper, extend ) {
	return (paper.thickness * parseInt(extend)) + paper.glue;
}

function displayDialog() {

	var w = new Window ("dialog");
		w.alignChildren = "left";

	var preset = w.add ("group");
	var paperDrop = preset.add ("dropdownlist", undefined, getPropList(papers,"name"));
		paperDrop.selection = 0;

	var myInputGroup = w.add ("group");
		myInputGroup.add ("statictext", undefined, "Extend:");
	var extend = myInputGroup.add ("edittext", undefined, "96");
		extend.characters = 5;
		extend.active = true;
	var mySpineLabel = myInputGroup.add ("statictext", undefined, " Spine:");
		//mySpineLabel.characters = 6;
	var spine  = myInputGroup.add ("edittext", undefined, "0");
		spine.characters = 6;
		extend.active = false;
	var units = myInputGroup.add ("statictext", undefined, "mm");

	var buttons = w.add ("group")
		buttons.add ("button", undefined, "OK", {name: "ok"});
		buttons.add ("button", undefined, "Cancel", {name: "cancel"});

	// Add functionality
	function updateSpine() {
		spine.text = calculateSpine(papers[paperDrop.selection.index],parseInt(extend.text));
	}

	paperDrop.onChange = function () {
		updateSpine();
	}
	extend.onChange = function () {
		updateSpine();
	}

	w.show ();

}

try {
	displayDialog();
} catch ( err ) {
	alert( err.description );
}

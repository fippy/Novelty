﻿// Frame_2_Margin.jsx
// An InDesign JavaScript by Bruno Herfst 2013
// Version 1.1

#target indesign

var error = false;
var story = false;

main();

if(error){
	alert(error);
} else if(story) {
	alert("Done!");
}

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		var myDoc = app.activeDocument;
		var ruler = new safeRuler(myDoc, RulerOrigin.pageOrigin);
		if(app.selection.length != 0){
			//Get the first item in the selection.
			for(var i=0;i<app.selection.length;i++){
				var mySelection = app.selection[i];
				switch(mySelection.constructor.name){
				    case "Rectangle":
                    case "TextFrame":
				        break;
				    case "InsertionPoint":
				    case "Text":
				    case "Character":
				    case "Paragraph":
				    case "Word":
				    case "TextStyleRange":
				    case "Line":
				    	var doStory = confirm("Do you want to do all text frames in this story?");
                    	if(doStory) {
                    		story = true;
                    		fitSelection(mySelection.parentStory.textContainers);
                    	} else {
                    		fitSelection(mySelection.parentTextFrames);
                    	}
                    	exit();
				        break;
					 default:
						var ws = mySelection.constructor.name;
						alert("This is a "+ws+" \rThis type is currently not supported.");
						exit();
				}
			}
			fitSelection(app.selection);
			ruler.restore();
		}else{
			alert("Please select a Rectangle or TextFrame and try again.");
		}
	}else{
		alert("Please open a document and try again.");
	}
}

function safeRuler(doc, newRulerOrigin){
	// sample newRulerOrigin: RulerOrigin.pageOrigin
	var _this = this;
	this.doc = doc;
	this.originalRuler = this.doc.viewPreferences.rulerOrigin;
	doc.viewPreferences.rulerOrigin = newRulerOrigin;
	this.newRuler = newRulerOrigin;
	this.restore = function(){
		_this.doc.viewPreferences.rulerOrigin = _this.originalRuler;
	}
}

function fitSelection(selection){
	for(var i=0;i<selection.length;i++){
		fitObj(selection[i]);
	}
}

function fitObj(obj){
	// Needs RulerOrigin.pageOrigin
	var myPage = obj.parentPage;
	if (myPage != null){
		var marginBounds = getMarginBounds(myPage);
		setBounds(obj, marginBounds);
	} else {
		error = "Some objects did not have a parent page.";
	}
}


function setBounds(obj,bounds){
	obj.geometricBounds = bounds;
}

function getMarginBounds(thisPage){
    pH = doRound(thisPage.bounds[2]-thisPage.bounds[0], 3);
    pW = doRound(thisPage.bounds[3]-thisPage.bounds[1], 3);
    
	if(thisPage.side == PageSideOptions.LEFT_HAND){
		return [thisPage.marginPreferences.top, pW-thisPage.marginPreferences.left, pH-thisPage.marginPreferences.bottom, thisPage.marginPreferences.right];	
	} else { // PageSideOptions.SINGLE_SIDED or PageSideOptions.RIGHT_HAND
		return [thisPage.marginPreferences.top, pW-thisPage.marginPreferences.right, pH-thisPage.marginPreferences.bottom, thisPage.marginPreferences.left];
	}    
    
}

function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}

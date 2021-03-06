﻿// Bounds_Memory.jsx
// An InDesign JavaScript by Bruno Herfst 2016
// Version 1.0

// Copy and paste bounds values

#target indesign

var memoryLabel = "BoundsMemory";

function main(){
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if(app.documents.length != 0){
        var myDoc = app.activeDocument;
        if(app.selection.length == 1){
            //Get object bounds
            var mySelection = app.selection[0];
            switch(mySelection.constructor.name){
                case "Rectangle":
                case "TextFrame":
                case "Polygon":
                case "Oval":
                case "Group":
                    showUI(myDoc, mySelection);
                    break;
                 default:
                    var ws = mySelection.constructor.name;
                    alert("This is a "+ws+" \rThis type is currently not supported.");
                    exit();
            }
        }else{
            alert("Please select exactly 1 page item.");
        }
    }else{
        alert("Open a document before running this script.");
    }
}

function saveBounds( theseBounds ){
    app.insertLabel( memoryLabel, theseBounds.toString() );
}

function applyBounds( pageItem, theseBounds ){
    pageItem.geometricBounds = theseBounds;
}

function showUI (myDoc, mySelection) {
    var selBounds  = mySelection.geometricBounds;
    var prevBounds = app.extractLabel(memoryLabel);
    if(prevBounds.length > 4) {
    	prevBounds = (new Function("return [" + prevBounds + "];")());
    }

    var myDialog = new Window ("dialog", "Bounds Bounce");
        myDialog.orientation   = "row";
        myDialog.alignment     = "left";
        myDialog.alignChildren = "left";
        myDialog.margins       = [20,20,20,25];

    //Buttons
    //-------
    var copyBut   = myDialog.add ("button", undefined, "Copy",   {name:"copy"}   );
    copyBut.onClick = function() {
        this.parent.close(1);
    }

    if(prevBounds.constructor === Array) {
        var pasteBut  = myDialog.add ("button", undefined, "Paste",  {name:"paste"}  );
        pasteBut.onClick = function() {
            this.parent.close(2);
        }
    }

    var returnVal = myDialog.show();
    if ( returnVal == 1) {
        saveBounds( selBounds );
    } else if ( returnVal == 2) {
        applyBounds( mySelection, prevBounds );
    } // else user pressed cancel
}

main();


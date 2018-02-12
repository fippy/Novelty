﻿/*
	Place_Image_References.jsx
	Version: 1.0
	
	Bruno Herfst 2016
	
	This script finds image references in text and places the pic on that page
	Wishlist:
	+ Place on location options (based on x-y location of found text or page/margin)
	+ Place inline option
	+ Layer options
	+ PLace fitting options
	+ REGEX presets
	+ Remove ref in doc
*/

#target indesign;

function placeFileOnPage(myFile, myPage) {
	if(!myFile.fileRef.exists){
		alert("Can't find file " + myFile.name + "!");
		// Open dialog? (With cancel button would be nice)
		return false;
	}
	try {
		var rect = myPage.rectangles.add({geometricBounds:[myPage.bounds[0]/3,myPage.bounds[1],myPage.bounds[2]/3,myPage.bounds[3]]});
        rect.geometricBounds = [myPage.bounds[0]/3,myPage.bounds[1],myPage.bounds[2]/3,myPage.bounds[3]];
        rect.place(myFile.fileRef, false);
        rect.fit(FitOptions.PROPORTIONALLY);
	} catch(r) {
		alert(r.description);
		return false;
	}
	return true;
}

function saveToMyFiles(myFileRef) {
	myFiles.push({ name: myFileRef.displayName, path: myFileRef.absoluteURI, fileRef: myFileRef });
}

/**
 * Calls the callback function for each descendant file of the specified folder.
 * The callback should accept a single argument that is a File object.
 * 
 * @param {Folder} folder The folder to search in.
 * @param {Function} callback The function to call for each file.
 */
function forEachFileIn(folder, callback) {
    var aChildren = folder.getFiles();
    for (var i = 0; i < aChildren.length; i++) {
        var child = aChildren[i];
        if (child instanceof File) {
            callback(child);
        }
        else if (child instanceof Folder) {
            this.forEachFileIn(child, callback);
        }
        else {
            throw new Error("The object at \"" + child.fullName + "\" is a child of a folder and yet is not a file or folder.");
        }
    }
}

/**
 * Returns the file path that belongs to the file name.
 * If no files are found we will look again but case insensitive.
 *
 * @param {String} fileName
 * @return {File} || null
 */

function getFile(fileName) {
	var len = myFiles.length;
	for (i = 0; i < len; i++) {
    	if(myFiles[i].name == fileName) {
    		return myFiles[i];
    	}
	}
	return null;
}

try {
	var doc = app.activeDocument;
	var docPath = doc.filePath;
	var docFolder = (new File(docPath)).parent;
	var myFiles = new Array();
	var placedLen = 0;

	forEachFileIn(docFolder, saveToMyFiles);
	
	if(myFiles.length <= 0){
		throw new Error("Can't find any files in document location " + docFolder);
	}

	// Make the dialog box for the change case search
	var the_dialog = app.dialogs.add({name:"Place Image References"});
	with(the_dialog.dialogColumns.add()){
		with(dialogRows.add()){
			staticTexts.add({staticLabel:"Search for (GREP):"});
			var grep_string = textEditboxes.add({editContents:"^JC_\\d+\\.tif",minWidth:200});      
		}
	}

	//the_dialog.show();
	if(the_dialog.show() == true){
		doc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
		go();
	}else{
		the_dialog.destroy();
		exit;
	}
} catch(err) {
	alert(err.description);
}

function go(){
	// Set find grep preferences to find text with the grep value entered in the dialog
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeLockedLayersForFind = true;
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;
	app.findChangeGrepOptions.includeMasterPages = true;
	
	app.findGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = grep_string.editContents;
	app.findGrepPreferences.appliedParagraphStyle = NothingEnum.nothing;

	// Search
	var found_refs = doc.findGrep();
	var found_len = found_refs.length;
	// Loop through references and try and find the link from the links folder

	if(found_len != 0) {
		for (var i=0; i<found_len; i++) {
			// Search for name in files
			var filename = String(found_refs[i].contents);
			//var pageNumber = parseInt(found_refs[i].parentTextFrames[0].parentPage.name);
			var myPage = found_refs[i].parentTextFrames[0].parentPage;

			if(myPage.isValid){
				var myFile = getFile(filename);
				if(myFile !== null) {
					if(placeFileOnPage(myFile, myPage)){
						placedLen++;
					}
				}
			}
		}
		alert("Done!\n" + found_len + " references found.\n" + placedLen + " links placed.");
	} else {
		alert("No matches found!");
	}
}
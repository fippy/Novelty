﻿#targetengine "session"

var selfName = "StyleMaster";
var allowCustomGrep = false;

var styleMapTemplate = {
    findParaStyle  : "",
    regex          : "^.+",
    useRegex       : false,
    apply_master   : "",
    masterOffset   : 1,
    ignore_masters : ["[None]"],
    replace_master : ""
}

// Helper functions
// ----------------
function updateObj ( Old_Obj, New_Obj ) {
    for ( var key in New_Obj ) {
        if( Old_Obj.hasOwnProperty(key) ) {
            New_Obj[key] = Old_Obj[key];
        }
    }
    return New_Obj;
}

function inArray ( element, arr ) {
    for(var i = arr.length; i--; ) {
        if(arr[i] == element) return true;
    }
    return false;
}

function heroZero(haystack, needle) {
    for (var i = 0; i < haystack.length; i++) {
        if(haystack[i] == needle) return i;
    }
    // Return the first element if nothing is found
    return 0;
}

function loadSettings( inSettings ) {

    // init settings object
    var Settings = { styleMaps  : [styleMapTemplate],
                     liveUpdate : false }

    if( inSettings == undefined ) {
        var inSettings = Settings;
        var doc = app.documents[0];
        if (doc.isValid) {
            var dSettings = doc.extractLabel('master2style'); //Always returns a string
            if( dSettings.length > 0 ){
                inSettings = eval( dSettings );
            }
        }
    }
    
    // Check and update Settings (based on inSettings)
    if( typeof inSettings == 'object' && inSettings.hasOwnProperty('styleMaps')) {
        if(typeof inSettings.styleMaps == 'array') {
            var len = inSettings.styleMaps.length;
            for (var i = 0; i < arrayLength; i++) {
                inSettings.styleMaps[i] = updateObj( inSettings.styleMaps[i], Settings.standardMap );
            }
            Settings = updateObj( inSettings, Settings );
        }
    }

    return Settings;
}

function show_setup_UI() {
    var doc = app.documents.item(0);
    if(!doc.isValid) {
        alert("Open a document before running this script.");
        return false;
    }

    var Settings = loadSettings();

    // Create a list of paragraph styles
    var list_of_paragraph_styles = doc.paragraphStyles.everyItem().name;
    list_of_paragraph_styles.unshift("--ANY STYLE--");

    // Create a list of master pages
    var list_of_master_pages = doc.masterSpreads.everyItem().name;
    list_of_master_pages.unshift("[None]");

    function add_exception(given_group, initMap) {

    }
    
    function add_measure_group( given_group, initMap ) {
        if( initMap == undefined ) {
            initMap = styleMapTemplate;
        }

        var group = given_group.panel.add( "panel");
            group.orientation = "row";
            group.alignChildren = "top";

        group.findParaStyle_drop = group.add("dropDownList", undefined, list_of_paragraph_styles);
        group.findParaStyle_drop.selection = heroZero(list_of_paragraph_styles, initMap.findParaStyle);
        
        if(allowCustomGrep) {
            group.myGREPCheckbox = group.add("checkbox"); //checkboxControls.add({staticLabel:"Custom GREP:", checkedState:Settings.useRegex});
            group.myGREPCheckbox.value = initMap.useRegex;
            group.myGREPField = group.add("edittext", undefined, initMap.regex);
            group.myGREPField.characters = 20;
        }

        group.master_offset = group.add("dropDownList", undefined, ["Page Before", "Page", "Page After"]);
        group.master_offset.selection = initMap.masterOffset;

        group.apply_master_drop = group.add("dropDownList", undefined, list_of_master_pages);
        group.apply_master_drop.selection = heroZero(list_of_master_pages, initMap.apply_master);

        // End with Plus and Minus Buttons
        group.add_exception = group.add("button", undefined, "Add Exception");
        group.add_exception.preferredSize = [110,25];
        group.add_exception.onClick = function(){
            add_exception_text(given_group, initMap);
        }

        group.index = given_group.panel.children.length - 1;
        group.plus = group.add("button", undefined, "+");
        group.plus.margins = 0;
        group.plus.characters = 1;
        group.plus.preferredSize = [25,25];
        group.plus.onClick = function(){
            add_measure_group(given_group, initMap);
        }
        group.minus = group.add("button", undefined, "-");
        group.minus.margins = 0;
        group.minus.characters = 1;
        group.minus.preferredSize = [25,25];
        group.minus.onClick = minus_btn(given_group); 
        win.layout.layout( true ); 
        return group; 
    }

    function add_btn( given_group ) {
        return function () {
            return add_measure_group( given_group );
        }
    }

    function minus_btn ( given_group ) {
        return function () {   
            var ix = this.parent.index;
            if(ix == 0 && given_group.panel.children.length == 1) {
                // Don't remove the last one
            } else {
                given_group.panel.remove( given_group.panel.children[ix] );    
            }
            // update indexes
            for(var i = 0; i < given_group.panel.children.length; i++){
                given_group.panel.children[i].index = i;
            }
            win.layout.layout( true );
        }
    }

    function create_group(location, groupName){
        // param location: InDesign UI Window, panels or group
        // param group name (string): e.g: "panel" or "group"
        var newGroup                     = new Object();
            newGroup.panel               = location.add(groupName);
            newGroup.panel.orientation   = "column";
            newGroup.panel.alignChildren = "left";
            newGroup.add_btn             = add_btn(newGroup, 0);
            newGroup.minus_btn           = minus_btn(newGroup);
        return newGroup;
    }

    var win = new Window("dialog", "Master Style Mapper");
        win.orientation = "column";
        win.alignChildren = "left";
        win.margins = 10;
    
    var contentGroup = win.add("group");
        contentGroup.orientation = "row";
        contentGroup.alignChildren = "top";

    var styleMapGroup = create_group(contentGroup, "group");
    var buttonGroup   = create_group(contentGroup, "group");

    buttonGroup.panel.add ("button", undefined, "OK");
    var helpBut = buttonGroup.panel.add ("button", undefined, "Help");
        helpBut.onClick = function(){ visitURL("http://master2style.brunoherfst.com/?from=Plugin") };
    buttonGroup.panel.add ("button", undefined, "Cancel");

    for(var i = 0; i < Settings.styleMaps.length; i++){
        add_measure_group( styleMapGroup, Settings.styleMaps[i] );
    }

    var userFeedback = win.show();

}

function visitURL(/*str*/ url) {
    /*
    Thanks to Gerald Singelmann and Marc Autret for the visitURL function
    The advantage of this approach is that it works event while InDesign is locked in a modal state...
    https://forums.adobe.com/message/3180866
    */
    var isMac = (File.fs == "Macintosh"),
      fName = 'tmp' + (+new Date()) + (isMac ? '.webloc' : '.url'),
      fCode = isMac ?
           ('<?xml version="1.0" encoding="UTF-8"?>\r'+
           '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" '+
           '"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\r'+
           '<plist version="1.0">\r'+
           '<dict>\r'+
                '\t<key>URL</key>\r'+
                '\t<string>%url%</string>\r'+
           '</dict>\r'+
           '</plist>') :
           '[InternetShortcut]\rURL=%url%\r';

    var f = new File(Folder.temp.absoluteURI + '/' + fName);
    if(! f.open('w') ) return false;

    f.write(fCode.replace('%url%',url));
    f.close();
    f.execute();
    $.sleep(500);     // 500 ms timer
    f.remove();
    return true;
}
show_setup_UI();

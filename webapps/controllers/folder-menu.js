var groovyTree = null;
var jarTree = null;
// window.onload = function() {

var tree_menu = {
    'packageMenu': {
        elements : [
            // {
            //     text: 'Create Class',
            //     icon: 'images/add.png',
            //     action: function (node) {
            //         node.createChildNode('NewClass', false, 'images/file.png', null, 'packageMenu');
            //     }
            // },
            // {
            //     text: 'View/Edit',
            //     icon: 'images/edit.png',
            //     action: function (node) {
            //        console.log(node);
            //         loadTabbar(node.obj._id,4);
            //     }
            // },
            {
                text: 'Delete Package',
                icon: 'images/delete.png',
                action: function (node) {
                    deleteNodes(node,node.obj);


                }
            }
        ]
    },
    'emptyMenu': {
        elements : [

        ]
    }
}

var tree_menu_class = {
    'emptyMenu': {
        elements : [

        ]
    },
    'packageMenu': {
        elements : [
            // {
            //     text: 'Create Class',
            //     icon: 'images/add.png',
            //     action: function (node) {
            //         node.createChildNode('NewClass', false, 'images/file.png', null, 'packageMenu');
            //     }
            // },
            // {
            //     text: 'View/Edit',
            //     icon: 'images/edit.png',
            //     action: function (node) {
            //        console.log(node);
            //         loadTabbar(node.obj._id,4);
            //     }
            // },
            {
                text: 'Delete Class',
                icon: 'images/delete.png',
                action: function (node) {
                    deleteNodes(node,node.obj);

                }
            }
        ]
    }
}


function loadGroovyTreeMenu(obj) {
    var GROOVY_CODE = obj;
    //Creating the tree
    groovyTree = createTree('groovy_tree', 'white', tree_menu_class);

//Setting custom events
    groovyTree.nodeBeforeOpenEvent = function (node) {

    }

    groovyTree.nodeAfterOpenEvent = function (node) {


    }

    groovyTree.nodeBeforeCloseEvent = function (node) {

    }

//Loop to create test nodes
    for (var i = 0; i < GROOVY_CODE.length; i++) {
        node1 = groovyTree.createNode(GROOVY_CODE[i].packageName, false, GROOVY_CODE[i].domainKey == DOMAIN_KEY ? 'images/folder.png' : 'images/folder_16.png', null, null, GROOVY_CODE[i].domainKey == DOMAIN_KEY ? 'packageMenu' : 'emptyMenu', GROOVY_CODE[i], 1);
        for (var j = 0; j < GROOVY_CODE[i].classes.length; j++) {
            var className = GROOVY_CODE[i].classes[j].name;
            node2 = node1.createChildNode(GROOVY_CODE[i].classes[j].name, false, 'images/file.png', null, 'classMenu', GROOVY_CODE[i].classes[j], 2);
            for (var k = 0; k < GROOVY_CODE[i].classes[j].methods.length; k++) {

                var methodObj = GROOVY_CODE[i].classes[j].methods[k];
                var str = "";

                GROOVY_CODE[i].classes[j].methods[k]['className'] = className;

                if (methodObj.returnType.type.indexOf(".") !== -1) {
                    var splitStr = methodObj.returnType.type.split(".")
                    str = splitStr[splitStr.length - 1] + " " + methodObj.name;
                } else {
                    str = methodObj.returnType.type + " " + methodObj.name;
                }

                if (methodObj.arguments.length === 0) {
                    str = str + ' ()'
                }

                node3 = node2.createChildNode(str, false, 'images/code.png', null, null, GROOVY_CODE[i].classes[j].methods[k], 3);

                for (var l = 0; l < GROOVY_CODE[i].classes[j].methods[k].arguments.length; l++) {
                    node4 = node3.createChildNode(GROOVY_CODE[i].classes[j].methods[k].arguments[l].name + ' - ' + GROOVY_CODE[i].classes[j].methods[k].arguments[l].type.type, false, 'images/key_green.png', null, null, GROOVY_CODE[i].classes[j].methods[k], 4);
                }
            }
        }
    }

    groovyTree.drawTree();


}

function loadJarTreeMenu(obj) {
    console.log(obj)
    var GROOVY_CODE = obj;
    //Creating the tree
    jarTree = createTree('jar_tree', 'white', tree_menu);

//Setting custom events
    jarTree.nodeBeforeOpenEvent = function (node) {

    }

    jarTree.nodeAfterOpenEvent = function (node) {


    }

    jarTree.nodeBeforeCloseEvent = function (node) {

    }

//Loop to create test nodes
    for (var i = 0; i < GROOVY_CODE.length; i++) {
        node1 = jarTree.createNode(GROOVY_CODE[i].file, false, GROOVY_CODE[i].domainKey == DOMAIN_KEY ? 'images/folder.png' : 'images/folder_16.png', null, null, GROOVY_CODE[i].domainKey == DOMAIN_KEY ? 'packageMenu' : 'emptyMenu', GROOVY_CODE[i], 5);
    }

    jarTree.drawTree();


}

/*
function expand_all() {
    tree.expandTree();
}


function collapse_all() {
    tree.collapseTree();

}*/

function loadPackageCode(obj) {

    var str = "";
    var codeObj = obj.obj;

    if(boodskapEditor){

        if (obj.type === 2) {

            console.log(codeObj);

            loadTabbar(codeObj._id,1)
        }

    }else {


        if (obj.type === 1) {
            str = 'import ' + codeObj.packageName + ".*;\n";




            if (scriptTerminal) {

                if($(".editorBlock").hasClass('rshow')) {
                    var editorText = codeEditor.getSession().getValue();
                    editorText = str + '\n' + editorText;
                    codeEditor.setValue(editorText);
                    codeEditor.clearSelection();
                    codeEditor.focus();
                    var session = codeEditor.getSession();
                    var count = session.getLength();
                    codeEditor.gotoLine(2, session.getLine(count - 1).length);
                }else{
                    scriptTerminal.insert(str);
                    scriptTerminal.focus();
                }
            }else{
                if (codeEditor) {
                    var editorText = codeEditor.getSession().getValue();

                    editorText = str + '\n' + editorText;
                    codeEditor.setValue(editorText);
                    codeEditor.clearSelection();
                    codeEditor.focus();
                    var session = codeEditor.getSession();
                    var count = session.getLength();
                    codeEditor.gotoLine(2, session.getLine(count - 1).length);
                }
            }

        }
        else if (obj.type === 2) {

            var className = codeObj.name;
            var variableName = className.charAt(0).toLowerCase() + className.substr(1);
            var initialize = "\n" + className + " " + variableName + " = new " + className + "();\n"
            var initializeTerminal = className + " " + variableName + " = new " + className + "();"


            if (scriptTerminal) {

                if($(".editorBlock").hasClass('rshow')) {
                    var cursorPosition = codeEditor.getCursorPosition();
                    codeEditor.session.insert(cursorPosition, initialize);
                }else{
                    scriptTerminal.insert(initializeTerminal);
                    scriptTerminal.focus();
                }
            }else{
                if (codeEditor) {
                    var cursorPosition = codeEditor.getCursorPosition();
                    // Insert text (second argument) with given position
                    codeEditor.session.insert(cursorPosition, initialize);
                }
            }


        }
        else if (obj.type === 3) {

            var method = "";

            var className = codeObj.className;
            var variableName = className.charAt(0).toLowerCase() + className.substr(1);

            method = variableName + "." + codeObj.name;

            if (codeObj.arguments.length === 0) {
                method = method + '();\n';
            } else {

                var arg = '';
                for (var j = 0; j < codeObj.arguments.length; j++) {
                    var argObj = codeObj.arguments[j];
                    arg = arg + argObj.type.type + " " + argObj.name;
                    if (j !== codeObj.arguments.length - 1) {
                        arg = arg + ", "
                    }

                }

                arg = '(' + arg + ');\n';
                method = method + arg;

            }



            if (scriptTerminal) {

                if($(".editorBlock").hasClass('rshow')) {
                    var cursorPosition = codeEditor.getCursorPosition();
                    codeEditor.session.insert(cursorPosition, "\n" + method);
                }else{
                    scriptTerminal.insert(method);
                    scriptTerminal.focus();
                }
            }else{
                if (codeEditor) {
                    var cursorPosition = codeEditor.getCursorPosition();
                    // Insert text (second argument) with given position
                    codeEditor.session.insert(cursorPosition, "\n" + method);
                }
            }


        }
        else if (obj.type === 4) {
            console.log('argument')
        }
    }


}


function deleteNodes(node,obj){

    var searchType = $("input[name='fileType']:checked").val();

    var isPublic = searchType == 'GROOVY' ? false : true;



    if($("#codeType").val() == 'JAR'){
        $.ajax({
            url: API_BASE_PATH + "/groovy/delete/jar/" + API_TOKEN_ALT + "/" + isPublic + "/" + obj.file,
            contentType: 'application/json',
            type: 'DELETE',
            success: function (data) {
                //called when successful
                node.removeNode();
            },
            error: function (e) {
                //called when there is an error
                //console.log(e.message);
            }
        });
    }else{
        $.ajax({
            url: API_BASE_PATH + "/groovy/delete/script/" + API_TOKEN_ALT + "/" + isPublic + "/" + obj.packageName,
            contentType: 'application/json',
            type: 'DELETE',
            success: function (data) {
                //called when successful
                node.removeNode();
            },
            error: function (e) {
                //called when there is an error
                //console.log(e.message);
            }
        });
    }

}

/*
 * Licenced under MIT
 * Author: Wang Yu <bigeyex@gmail.com>
 * github: https://github.com/bigeyex/brackets-wordhint
*/

/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        CodeHintManager     = brackets.getModule("editor/CodeHintManager");
    
    var phpBuiltins         = require("php-predefined-functions");

    
    /**
     * @constructor
     */
    function WordHints() {
        this.lastLine = 0;
        this.cachedPhpVariables =       [];
        this.cachedPhpConstants =       [];
        this.cachedPhpKeywords  =       [];
        this.cachedPhpFunctions =       [];
        this.cachedLocalVariables =     [];
        this.tokenVariable =            /[$][\a-zA-Z_][a-zA-Z0-9_]*/g;
    }

    WordHints.prototype.hasHints = function (editor, implicitChar) {
        this.editor = editor;
        var currentToken = "",
            i,
            cursor = editor.getCursorPos();
        
        currentToken = this.editor._codeMirror.getTokenAt(cursor);
        // if implicitChar or 1 letter token is $, we *always* have hints so return immediately
        if (implicitChar === "$"  || currentToken.string.charAt(0) === "$") {
            console.log("$");
            return true;
        }

        if (currentToken.string.length > 1) {
            for (i = 0; i < this.cachedPhpKeywords.length; i++) {
                if (this.cachedPhpKeywords[i].indexOf(currentToken.string) === 0) {
                    return true;
                }
            }

            for (i = 0; i < this.cachedPhpConstants.length; i++) {
                if (this.cachedPhpConstants[i].indexOf(currentToken.string) === 0) {
                    return true;
                }
            }

            for (i = 0; i < this.cachedPhpFunctions.length; i++) {
                if (this.cachedPhpFunctions[i].indexOf(currentToken.string) === 0) {
                    return true;
                }
            }
        }
        
        
        return false;
    };

    WordHints.prototype.getHints = function (implicitChar) {
        var currentToken = "",
            i,
            cursor = this.editor.getCursorPos();

        currentToken = this.editor._codeMirror.getTokenAt(cursor);
        var hintList = [];
        if (currentToken === null) {
            return null;
        }
        if (this.cachedLocalVariables === null) {
            return null;
        }
        for (i = 0; i < this.cachedLocalVariables.length; i++) {
            if (this.cachedLocalVariables[i].indexOf(symbolBeforeCursorArray[0]) === 0) {
                hintList.push(this.cachedLocalVariables[i]);
            }
        }

        return {
            hints: hintList,
            match: symbolBeforeCursorArray[0],
            selectInitial: true,
            handleWideResults: false
        };
    };
    
    /**
     * Complete the word
     * 
     * @param {String} hint 
     * The hint to be inserted into the editor context.
     * 
     * @return {Boolean} 
     * Indicates whether the manager should follow hint insertion with an
     * additional explicit hint request.
     */
    WordHints.prototype.insertHint = function (hint) {
        var cursor = this.editor.getCursorPos();
        var lineBeginning = {line: cursor.line, ch: 0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var indexOfTheSymbol = textBeforeCursor.search(this.currentTokenDefinition);
        var replaceStart = {line: cursor.line, ch: indexOfTheSymbol};
        if (indexOfTheSymbol === -1) {
            return false;
        }
        this.editor.document.replaceRange(hint, replaceStart, cursor);
        console.log("hint: " + hint + " | lineBeginning: " + lineBeginning.line + ', ' + lineBeginning.ch + " | textBeforeCursor: " + textBeforeCursor + " | indexOfTheSymbol: " + indexOfTheSymbol + " | replaceStart: " + replaceStart.line + ', ' + replaceStart.ch);
        
        return false;
    };
    
    AppInit.appReady(function () {
        var i;
        var wordHints = new WordHints();
        var functions = phpBuiltins.predefinedFunctions;
        for (i = 0; i < functions.length; i++) {
            var phpFunction = functions[i];
            if (wordHints.cachedPhpFunctions.indexOf(phpFunction) === -1) {
                wordHints.cachedPhpFunctions.push(phpFunction);
            }
        }
        var keywords = phpBuiltins.keywords;
        for (i = 0; i < keywords.length; i++) {
            var phpKeyword = keywords[i];
            if (wordHints.cachedPhpKeywords.indexOf(phpKeyword) === -1) {
                wordHints.cachedPhpKeywords.push(phpKeyword);
            }
        }
        var constants = phpBuiltins.predefinedConstants;
        console.log(constants.length);
        for (i = 0; i < constants.length; i++) {
            var phpConstant = constants[i];
            if (wordHints.cachedPhpConstants.indexOf(phpConstant) === -1) {
                wordHints.cachedPhpConstants.push(phpConstant);
            }
        }
        var variables = phpBuiltins.predefinedVariables;
        for (i = 0; i < variables.length; i++) {
            var phpVariable = variables[i];
            if (wordHints.cachedPhpVariables.indexOf(phpVariable) === -1) {
                wordHints.cachedPhpVariables.push(phpVariable);
            }
        }
        CodeHintManager.registerHintProvider(wordHints, ["php"], 10);
    });
});

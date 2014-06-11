/*global glb, console, escape, alert*/

/**
@namespace glb.feed
**/
(function (window, document) {
    'use strict';

    var _escapeElement = document.createElement('textarea');

    function unescapeHTML(html) {
        _escapeElement.innerHTML = html;
        return _escapeElement.value;
    }

    function escapeHTML(html) {
        _escapeElement.innerHTML = html;
        return _escapeElement.innerHTML;
    }

    function TextToken(text) {
        this.text = text;
        this.type = 'text';
    }

    TextToken.prototype.render = function render() {
        return this.text;
    };

    function EmoteToken(emote) {
        this.emote = emote;
        this.text = emote;
        this.type = 'emote';
    }

    EmoteToken.prototype.render = function render() {
        return glb.feed.emoticons.renderEmote(this.emote);
    };

    /**
    Provides methods for parsing emoticons

    @class emoticons
    @module feed
    @submodule emoticons
    **/
    glb.feed.emoticons = {

        config: {
            emotes: {
                angry: ">:(",
                ball: ":bola",
                big_smile_drop: ":'D",
                big_smile: ":D",
                clever: "¬¬)",
                davi: ":davi",
                deep_sad_drop: "<'(",
                dead: "x.x",
                distrust: "¬¬",
                fe: ":fe",
                hipster: ":E",
                laught_drop: ":')",
                laught: ":lol",
                lek: ":lek",
                love: "S2",
                kiss: ":*",
                mad: "><",
                mauricio: ":mau",
                notfunny: "¬¬(",
                nerd: "8|",
                poker: ":|",
                reject: "|(",
                roda: ":roda",
                sad_drop: ":'(",
                sad: ":(",
                shit: ":coco",
                smile: ":)",
                spy: "8-E",
                sunglasses: "8)",
                surprise: ":O",
                winky_tongue: ";P",
                winky: ";)"
            }
        },

        /**
        Parses a html string replacing emoticons for emoticon elements

        @method parseHTML
        @return String
        **/
        parseHTML: function parseHTML(html) {
            var element = document.createElement('p');
            element.innerHTML = html;
            element = this.parseElement(element);
            return element.innerHTML;
        },

        /**
        Parses a DOMElement replacing emoticons for emoticon elements

        @method parseElement
        @return {Object} DOMElement
        **/
        parseElement: function parseElement(element) {
            var oNode, transformedData,
                newElement = element.cloneNode();
            if (!element.hasChildNodes()) {
                return element;
            }
            newElement.innerHTML = '';
            for (oNode = element.firstChild; oNode; oNode = oNode.nextSibling) {
                if (oNode.nodeName === '#text') {
                    transformedData = this.parseText(oNode.nodeValue);
                    newElement.innerHTML += transformedData;
                } else {
                    newElement.appendChild(oNode);
                }
            }
            return newElement;
        },

        /**
        Parses a string replacing emoticons for emoticon elements

        @method parseText
        @return String
        **/
        parseText: function parseText(text) {
            var tokenList, token = new TextToken(unescapeHTML(text));
            tokenList = this.processTokens(token);
            return this.renderTokens(tokenList);
        },

        processTokens: function processTokens(token) {
            var graph, match,
                firstToken, lastToken,
                compiledRegexp = this.compileRegexp(),
                tokenList = [];

            match = compiledRegexp.exec(token.text);
            if (match !== null) {
                graph = match[0];
                firstToken = token.text.slice(0, match.index);
                lastToken = token.text.slice(match.index + graph.length);
                if (firstToken.length > 0) {
                    tokenList = tokenList.concat(this.processTokens(new TextToken(firstToken)));
                }
                tokenList.push(new EmoteToken(this.regexToName[graph]));
                if (lastToken.length > 0) {
                    tokenList = tokenList.concat(this.processTokens(new TextToken(lastToken)));
                }
            } else {
                tokenList.push(token);
            }
            return tokenList;
        },

        renderTokens: function renderTokens(tokenList) {
            var i, html = '';
            for (i = 0; i < tokenList.length; i += 1) {
                html += tokenList[i].render();
            }
            return html;
        },

        processEmote: function processEmote(html, emoteName, emoteGraph) {
            return html.replace(this.graph2RegExp(emoteGraph), this.getEmoteHTML(emoteName, emoteGraph));
        },

        renderEmote: function renderEmote(emote) {
            return this.getEmoteHTML(emote, this.config.emotes[emote]);
        },

        getEmoteHTML: function getEmoteHTML(emoteName, emoteGraph) {
            return '<i class="feed-emot emot-' + emoteName.replace(/_/g, '-') + '" title="' + escapeHTML(emoteGraph) + '"></i>';
        },

        graph2RegExp: function  graph2RegExp(emoteGraph) {
            return '(' + emoteGraph.replace(/([()<>\^|*])/g, '\\$1') + ')';
        },

        compileRegexp: function compileRegexp() {
            var emoteGraphs = [],
                graph,
                emote,
                regexList = [],
                i;
            if (this.compiledRegexp) {
                return this.compiledRegexp;
            }

            this.compiledRegexp = '';
            this.regexToName = {};
            for (emote in this.config.emotes) {
                if (this.config.emotes.hasOwnProperty(emote)) {
                    graph = this.config.emotes[emote];
                    emoteGraphs.push(graph);
                    this.regexToName[graph] = emote;
                }
            }
            emoteGraphs.sort(function(a, b) {
                return b.length - a.length;
            });

            for (i = 0; i < emoteGraphs.length; i += 1) {
                graph = emoteGraphs[i];
                regexList.push(this.graph2RegExp(graph));
            }
            this.compiledRegexp = regexList.join('|');
            this.compiledRegexp = new RegExp(this.compiledRegexp);
            return this.compiledRegexp;
        },

        addEmote: function addEmote(emoteName, graph) {
            this.config.emotes[emoteName] = graph;
            this.compiledRegexp = null;
            this.compileRegexp();
        }
    };

}(window, document));

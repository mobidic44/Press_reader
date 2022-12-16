var NewsReader;
(function (NewsReader) {
    var PopupPosition;
    (function (PopupPosition) {
        PopupPosition[PopupPosition["under"] = 0] = "under";
        PopupPosition[PopupPosition["over"] = 1] = "over";
    })(PopupPosition = NewsReader.PopupPosition || (NewsReader.PopupPosition = {}));
    var TargetWindowType;
    (function (TargetWindowType) {
        TargetWindowType[TargetWindowType["iframe"] = 0] = "iframe";
        TargetWindowType[TargetWindowType["new_tab"] = 1] = "new_tab";
    })(TargetWindowType = NewsReader.TargetWindowType || (NewsReader.TargetWindowType = {}));
    var Setting = /** @class */ (function () {
        function Setting() {
        }
        Setting.g_appEnabled = true;
        Setting.g_popupWidth = 600;
        Setting.g_popupHeight = 400;
        Setting.g_popupPosition = PopupPosition.under;
        return Setting;
    }());
    NewsReader.Setting = Setting;
    var Data;
    (function (Data) {
        var Urls = /** @class */ (function () {
            function Urls() {
            }
        
            Urls.List = [
                {
                    id: 1,
                    name: "인물 프로필",
                    tooltip: "인물 검색하기",
                    urlFormat: 'https://search.daum.net/search?w=tot&DA=YZR&t__nil_searchbox=btn&sug=&sugo=&q={searchtext:endode}',
                    urlImg: chrome.extension.getURL("img/icon-human32.png"),
                    enabled: true,
                    targetWindow: TargetWindowType.iframe 
                    //iframe으로 팝업창 띄우기
                },
                  {
                    id: 2,
                    name: "단어 검색",
                    tooltip: "국어사전으로 단어 뜻 제공하기",
                    urlFormat: 'https://dic.daum.net/search.do?q={searchtext:endode}',
                    urlImg: chrome.extension.getURL("img/icon-keyword32.png"),
                    enabled: true,
                    targetWindow: TargetWindowType.iframe
                },
            ];
            return Urls;
        }());
        Data.Urls = Urls;
        ;
    })(Data = NewsReader.Data || (NewsReader.Data = {}));
    var StringHelper = /** @class */ (function () {
        function StringHelper() {
        }
        StringHelper.checkSpace = function (str) {
            if (str.search(/\s/) != -1) {
                return true;
            }
            else
                return false;
        };
        StringHelper.checkSpecial = function (str) {
            var pattern = /[~!@\#$%^&*\()\-=+_']/gi;
            return pattern.test(str);
        };
        StringHelper.checkHangul = function (str) {
            var pattern = /^[가-힝]*$/; ///^[0-9a-zA-Z가-힝]*$/;
            return pattern.test(str);
        };
        return StringHelper;
    }());
    NewsReader.StringHelper = StringHelper;
    ;
    var Converter = /** @class */ (function () {
        function Converter() {
        }
        Converter.URLFormatToURL = function (urlFormat, searchtext) {
            var trans = "";
            if (urlFormat.indexOf("{searchtext:endode}") >= 0)
                trans = urlFormat.replace("{searchtext:endode}", encodeURIComponent(searchtext));
            return trans;
        };
        return Converter;
    }());
    NewsReader.Converter = Converter;
    ;
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.getSelectionText = function () {
            var text = "";
            var activeEl = document.activeElement;
            var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
            if ((activeElTagName == "textarea") || (activeElTagName == "input" &&
                /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
                (typeof activeEl.selectionStart == "number")) {
                // 입력창의 경우에는 제외
                text = "";
            }
            else if (window.getSelection) {
                text = window.getSelection().toString();
            }
            return text;
        };
        Utils.getSelectionTextRect = function () {
            var sel = window.getSelection();
            var range = sel.getRangeAt(0).cloneRange();
            var rects = range.getClientRects();
            var minTop = 99999;
            var minLeft = 99999;
            var maxRight = 0;
            var maxBottom = 0;
            if (rects.length == 0)
                return null;
            for (var i = 0; i < rects.length; i++) {
                var item = rects[i];
                minTop = Math.min(minTop, item.top);
                minLeft = Math.min(minLeft, item.left);
                maxRight = Math.max(maxRight, item.right);
                maxBottom = Math.max(maxBottom, item.bottom);
            }
            return { top: minTop, right: maxRight, bottom: maxBottom, left: minLeft };
        };
        return Utils;
    }());
    NewsReader.Utils = Utils;
    var Popup = /** @class */ (function () {
        function Popup(options) {
            this.elementID = options.elementID;
            this.onClickItem = options.onClickItem;
        }
        Popup.prototype.isOpen = function () {
            if ($("#" + this.elementID).dialog("instance") == undefined)
                return false;
            return $("#" + this.elementID).dialog("isOpen");
        };
        Popup.prototype.close = function () {
            //console.log("mini close()");
            $("#" + this.elementID).dialog("close");
            $("#" + this.elementID).remove();
        };
        Popup.prototype.show = function () {
            //console.log("mini show()");
            var pos_my = "";
            var pos_at = "";
            switch (NewsReader.Setting.g_popupPosition) {
                case NewsReader.PopupPosition.under:
                    pos_my = "center top+5";
                    pos_at = "center bottom";
                    break;
                case NewsReader.PopupPosition.over:
                    pos_my = "center bottom-5";
                    pos_at = "center top";
                    break;
            }
            // dialog 방식
            $("#" + this.elementID).dialog({
                draggable: false,
                resizable: false,
                modal: false,
                position: {
                    //아래
                    my: pos_my,
                    at: pos_at,
                    of: "#divSelectedText",
                    collision: "flip",
                    using: function (position, feedback) {
                        $(this).css(position);
                        $("<div>")
                            .addClass("arrow")
                            .addClass(feedback.vertical)
                            .addClass(feedback.horizontal)
                            .appendTo(this);
                    }
                },
                width: "auto",
                minHeight: "auto",
                show: { effect: "fade", duration: 500 },
                hide: { effect: "fade", duration: 500 },
                classes: {
                    "ui-dialog": "ui-dialog-mini-popup"
                },
                create: function (event, ui) {
                    $('.ui-dialog-titlebar').hide();
                    $('.ui-dialog-mini-popup').css("zIndex", 99999);
                },
            });
        };
        Popup.prototype.create = function (selectedText, popupItems) {
            //console.log("mini create()");
            var _this = this;
            this.selectedText = selectedText;
            var $container = $("<div>")
                .attr("id", this.elementID)
                .addClass("dpd-popup-box")
                .appendTo(document.body);
            popupItems.forEach(function (item, index, array) {
                $("<img>")
                    .addClass("dpd-popup-box-img")
                    .attr("src", item.urlImg)
                    .attr("title", item.tooltip)
                    .button()
                    .click(function () {
                    if (_this.onClickItem)
                        _this.onClickItem(item);
                })
                    .appendTo($container);
            });
            this.show();
        };
        return Popup;
    }());
    NewsReader.Popup = Popup;
    var PopupEx = /** @class */ (function () {
        function PopupEx(eleID) {
            this.elementID = eleID;
        }
        PopupEx.prototype.isOpen = function () {
            if ($("#" + this.elementID).dialog("instance") == undefined)
                return false;
            return $("#" + this.elementID).dialog("isOpen");
        };
        PopupEx.prototype.close = function () {
            //console.log("popupEx close()");
            var newPopupWidth = $("#" + this.elementID).dialog("option", "width");
            var newPopupHeight = $("#" + this.elementID).dialog("option", "height");
            chrome.storage.sync.set({
                popupWidth: newPopupWidth,
                popupHeight: newPopupHeight,
            }, function () {
                // Empty
            });
            NewsReader.Setting.g_popupWidth = newPopupWidth;
            NewsReader.Setting.g_popupHeight = newPopupHeight;
            $("#" + this.elementID).dialog("close");
            $("#" + this.elementID).remove();
        };
        PopupEx.prototype.show = function () {
            //console.log("popupEx show()");
            var pos_my = "";
            var pos_at = "";
            switch (NewsReader.Setting.g_popupPosition) {
                case NewsReader.PopupPosition.under:
                    pos_my = "center top+5";
                    pos_at = "center bottom";
                    break;
                case NewsReader.PopupPosition.over:
                    pos_my = "center bottom-5";
                    pos_at = "center top";
                    break;
            }
            // dialog 방식
            $("#" + this.elementID).dialog({
                draggable: false,
                modal: false,
                position: {
                    //아래
                    my: pos_my,
                    at: pos_at,
                    of: "#divSelectedText",
                    collision: "flip",
                    using: function (position, feedback) {
                        // 팝업이 움직일 경우 화살표가 여러개 생기는 문제
                        $(this).find('.arrow-searchpopup').remove();
                        $(this).css(position);
                        $("<div>")
                            .addClass("arrow-searchpopup")
                            .addClass(feedback.vertical)
                            .addClass(feedback.horizontal)
                            .appendTo(this);
                    }
                },
                width: NewsReader.Setting.g_popupWidth,
                height: NewsReader.Setting.g_popupHeight,
                minWidth: 600,
                minHeight: 400,
                show: { effect: "fade", duration: 500 },
                hide: { effect: "fade", duration: 500 },
                create: function (event, ui) {
                    $('.ui-dialog-titlebar').hide();
                    $('.ui-dialog-titlebar').parent().css("zIndex", 99999);
                },
            });
        };
        PopupEx.prototype.create = function (selectedText, newURL) {
            //console.log("popupEx create()");
            var _this = this;
            var $container = $("<div>")
                .attr("id", this.elementID)
                .addClass("dpd-popup-result-container")
                .appendTo(document.body);
            $("<iframe>")
                .attr("id", "iframePopup")
                .addClass("dpd-popup-result-iframe")
                .on("load", function (event) {
                if (_this.isOpen())
                    return;
                _this.show();
            })
                .attr("src", newURL)
                .appendTo($container);
        };
        return PopupEx;
    }());
    NewsReader.PopupEx = PopupEx;
})(NewsReader || (NewsReader = {}));
$(document).ready(function () {
    // 설정값 가져오기
    chrome.storage.sync.get({
        appEnabled: NewsReader.Setting.g_appEnabled,
        popupWidth: NewsReader.Setting.g_popupWidth,
        popupHeight: NewsReader.Setting.g_popupHeight,
        popupPosition: NewsReader.Setting.g_popupPosition
    }, function (items) {
        NewsReader.Setting.g_appEnabled = items.appEnabled;
        NewsReader.Setting.g_popupWidth = items.popupWidth;
        NewsReader.Setting.g_popupHeight = items.popupHeight;
        NewsReader.Setting.g_popupPosition = parseInt(items.popupPosition);
        if (NewsReader.Setting.g_popupWidth < 600)
            NewsReader.Setting.g_popupWidth = 600;
        if (NewsReader.Setting.g_popupHeight < 400)
            NewsReader.Setting.g_popupHeight = 400;
    });
    // 설정 값들 변경 가능 
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
            var storageChange = changes[key];
            if (key == "appEnabled") {
                NewsReader.Setting.g_appEnabled = storageChange.newValue;
            }
            else if (key == "popupPosition") {
                NewsReader.Setting.g_popupPosition = parseInt(storageChange.newValue);
            }
        }
    });
    document.addEventListener("selectionchange", function () {
        isSelectionChanged = true;
        if (popupMini && popupMini.isOpen()) {
            popupMini.close();
            $("#divSelectedText").remove();
        }
        if (popupIframe && popupIframe.isOpen()) {
            popupIframe.close();
            $("#divSelectedText").remove();
        }
    });
    var isSelectionChanged = false;
    var popupMini = null;
    var popupIframe = null;
    $(document.body).mouseup(function () {
        if (isSelectionChanged === false)
            return;
        var selectedText = NewsReader.Utils.getSelectionText().trim();
        // 단어 체크
        if (selectedText == "")
            return;
        // 띄어쓰기, 특수문자 체크
        if (NewsReader.StringHelper.checkSpecial(selectedText))
            return;
        // 활성화되지 않으면 stop한다
        if (NewsReader.Setting.g_appEnabled == false)
            return;     
        $("#divSelectedText").remove();
        var rect = NewsReader.Utils.getSelectionTextRect();
        if (rect == null)
            return;
        $("<div>")
            .attr("id", "divSelectedText")
            .css("left", rect.left + window.scrollX)
            .css("top", rect.top + window.scrollY)
            .css("width", rect.right - rect.left)
            .css("height", rect.bottom - rect.top)
            .css("position", "absolute")
            .appendTo(document.body);

        if (!popupMini) {
            popupMini = new NewsReader.Popup({
                elementID: "divMiniPopup",
                onClickItem: popupMini_onClickItem
            });
        }
        var enabledItems = NewsReader.Data.Urls.List.filter(function (item, index, array) {
            return item.enabled;
        });
        popupMini.create(selectedText, enabledItems);
        isSelectionChanged = false;
    });
    function popupMini_onClickItem(item) {// 팝업창 끄기 위함
        popupMini.close(); // 동작
        var urlConverted = NewsReader.Converter.URLFormatToURL(item.urlFormat, popupMini.selectedText);
        switch (item.targetWindow) {
            case NewsReader.TargetWindowType.iframe:
                {
                    if (popupIframe === null) {
                        popupIframe = new NewsReader.PopupEx("divPopup");
                    }
                    popupIframe.create(popupMini.selectedText, urlConverted);
                }
                break;
            case NewsReader.TargetWindowType.new_tab:
                {
                    window.open(urlConverted);
                }
                break;
        }
    }
  
});
//# sourceMappingURL=contentscripts.js.map
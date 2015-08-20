"use strict";
function promisifyRequest(e) {
    return new Promise(function(s, t) {
        function i() {
            s(e.result),
            a()
        }
        function n() {
            t(e.error),
            a()
        }
        function a() {
            e.removeEventListener("complete", i),
            e.removeEventListener("success", i),
            e.removeEventListener("error", n),
            e.removeEventListener("abort", n)
        }
        e.addEventListener("complete", i),
        e.addEventListener("success", i),
        e.addEventListener("error", n),
        e.addEventListener("abort", n)
    }
    )
}
function IndexDBWrapper(e, s, t) {
    var i = indexedDB.open(e, s);
    this.ready = promisifyRequest(i),
    i.onupgradeneeded = function(e) {
        t(i.result, e.oldVersion)
    }
}
function onPushSubscription(e) {
    console.log("pushSubscription = ", e.endpoint),
    window.PushDemo.ui.showGCMPushOptions(!0),
    window.PushDemo.ui.setPushSwitchDisabled(!1),
    console.log("pushSubscription: ", e);
    var s = document.querySelector(".js-xhr-button");
    s.addEventListener("click", function() {
        var s = new FormData
          , t = e.endpoint;
        "subscriptionId" in e && (t.includes(e.subscriptionId) || (t += "/" + e.subscriptionId)),
        s.append("endpoint", t),
        fetch(PUSH_SERVER_URL + "/send_push", {
            method: "post",
            body: s
        }).then(function(e) {
            console.log("Response = ", e)
        }
        )["catch"](function(e) {
            console.log("Fetch Error :-S", e)
        }
        )
    }
    );
    var t = e.endpoint
      , i = "curl -I -X POST " + e.endpoint;
    if (0 === t.indexOf("https://android.googleapis.com/gcm/send")) {
        t = "https://android.googleapis.com/gcm/send";
        var n = null ;
        if (e.subscriptionId)
            n = e.subscriptionId;
        else {
            var a = e.endpoint.split("/");
            n = a[a.length - 1]
        }
        i = 'curl --header "Authorization: key=' + API_KEY + '" --header Content-Type:"application/json" ' + t + ' -d "{\\"registration_ids\\":[\\"' + n + '\\"]}"'
    }
    var o = document.querySelector(".js-curl-code");
    o.innerHTML = i
}
function subscribeDevice() {
    window.PushDemo.ui.setPushSwitchDisabled(!0),
    navigator.serviceWorker.ready.then(function(e) {
        e.pushManager.subscribe({
            userVisibleOnly: !0
        }).then(onPushSubscription)["catch"](function(e) {
            "permissions" in navigator ? navigator.permissions.query({
                name: "push",
                userVisibleOnly: !0
            }).then(function(s) {
                if (console.log("subscribe() Error: Push permission status = ", s),
                window.PushDemo.ui.setPushChecked(!1),
                "denied" === s.status)
                    window.PushDemo.ui.showError("Ooops Notifications are Blocked", "Unfortunately you just permanently blocked notifications. Please unblock / allow them to switch on push notifications.");
                else {
                    if ("prompt" === s.status)
                        return void window.PushDemo.ui.setPushSwitchDisabled(!1);
                    window.PushDemo.ui.showError("Ooops Push Couldn't Register", '<p>When we tried to get the subscription ID for GCM, something went wrong, not sure why.</p><p>Have you defined "gcm_sender_id" and "gcm_user_visible_only" in the manifest?</p><p>Error message: ' + e.message + "</p>"),
                    window.PushDemo.ui.setPushSwitchDisabled(!1),
                    window.PushDemo.ui.setPushChecked(!1)
                }
            }
            )["catch"](function(e) {
                window.PushDemo.ui.showError("Ooops Push Couldn't Register", '<p>When we tried to get the subscription ID for GCM, something went wrong, not sure why.</p><p>Have you defined "gcm_sender_id" and "gcm_user_visible_only" in the manifest?</p><p>Error message: ' + e.message + "</p>"),
                window.PushDemo.ui.setPushSwitchDisabled(!1),
                window.PushDemo.ui.setPushChecked(!1)
            }
            ) : ("denied" === Notification.permission ? (window.PushDemo.ui.showError("Ooops Notifications are Blocked", "Unfortunately you just permanently blocked notifications. Please unblock / allow them to switch on push notifications."),
            window.PushDemo.ui.setPushSwitchDisabled(!0)) : (window.PushDemo.ui.showError("Ooops Push Couldn't Register", '<p>When we tried to get the subscription ID for GCM, something went wrong, not sure why.</p><p>Have you defined "gcm_sender_id" and "gcm_user_visible_only" in the manifest?</p><p>Error message: ' + e.message + "</p>"),
            window.PushDemo.ui.setPushSwitchDisabled(!1)),
            window.PushDemo.ui.setPushChecked(!1))
        }
        )
    }
    )
}
function unsubscribeDevice() {
    window.PushDemo.ui.setPushSwitchDisabled(!0),
    navigator.serviceWorker.ready.then(function(e) {
        e.pushManager.getSubscription().then(function(e) {
            return e ? (console.log("Unsubscribe from push"),
            void e.unsubscribe().then(function(e) {
                console.log("Unsubscribed from push: ", e),
                e || console.error("We were unable to unregister from push"),
                window.PushDemo.ui.setPushSwitchDisabled(!1),
                window.PushDemo.ui.showGCMPushOptions(!1)
            }
            )["catch"](function(e) {
                console.log("Unsubscribtion error: ", e),
                window.PushDemo.ui.setPushSwitchDisabled(!1),
                window.PushDemo.ui.showGCMPushOptions(!0),
                window.PushDemo.ui.setPushChecked(!0)
            }
            )) : (window.PushDemo.ui.setPushSwitchDisabled(!1),
            window.PushDemo.ui.setPushChecked(!1),
            void window.PushDemo.ui.showGCMPushOptions(!1))
        }
        .bind(this))["catch"](function(e) {
            console.error("Error thrown while revoking push notifications. Most likely because push was never registered", e)
        }
        )
    }
    )
}
function permissionStatusChange(e) {
    switch (console.log("permissionStatusChange = ", e),
    e.status) {
    case "denied":
        window.PushDemo.ui.showError("Ooops Push has been Blocked", "Unfortunately the user permanently blocked push. Please unblock / allow them to switch on push notifications."),
        window.PushDemo.ui.setPushChecked(!1),
        window.PushDemo.ui.setPushSwitchDisabled(!0);
        break;
    case "granted":
        window.PushDemo.ui.setPushSwitchDisabled(!1);
        break;
    case "prompt":
        window.PushDemo.ui.setPushChecked(!1),
        window.PushDemo.ui.setPushSwitchDisabled(!1)
    }
}
function setUpPushPermission() {
    navigator.permissions.query({
        name: "push",
        userVisibleOnly: !0
    }).then(function(e) {
        permissionStatusChange(e),
        e.onchange = function() {
            permissionStatusChange(this)
        }
        ,
        navigator.serviceWorker.ready.then(function(e) {
            e.pushManager.getSubscription().then(function(e) {
                return e ? (window.PushDemo.ui.setPushChecked(!0),
                void onPushSubscription(e)) : void console.log("No subscription given")
            }
            )["catch"](function(e) {
                console.log("An error occured while calling getSubscription()", e)
            }
            )
        }
        )
    }
    )["catch"](function(e) {
        console.error(e),
        window.PushDemo.ui.showError("Ooops Unable to check the permission", "Unfortunately the permission for push notifications couldn't be checked. Are you on Chrome 43+?")
    }
    )
}
function setUpNotificationPermission() {
    return "denied" === Notification.permission ? void window.PushDemo.ui.showError("Ooops Notifications are Blocked", "Unfortunately notifications are permanently blocked. Please unblock / allow them to switch on push notifications.") : "default" === Notification.permission ? (window.PushDemo.ui.setPushChecked(!1),
    void window.PushDemo.ui.setPushSwitchDisabled(!1)) : void navigator.serviceWorker.ready.then(function(e) {
        e.pushManager.getSubscription().then(function(e) {
            return e ? (window.PushDemo.ui.setPushChecked(!0),
            void onPushSubscription(e)) : (window.PushDemo.ui.setPushChecked(!1),
            void window.PushDemo.ui.setPushSwitchDisabled(!1))
        }
        )["catch"](function(e) {
            console.log("An error occured while calling getSubscription()", e)
        }
        )
    }
    )
}
function initialiseState() {
    return "PushManager" in window ? "permissions" in navigator ? void setUpPushPermission() : void setUpNotificationPermission() : void window.PushDemo.ui.showError("Ooops Push Isn't Supported", 'If this isn\'t an expected error please get in touch with <a href="https://twitter.com/gauntface">@gauntface</a> as the demo is probably broken.')
}
function UIHandler() {
    var e = document.querySelector(".js-enable-push")
      , s = new MaterialSwitch(document.querySelector(".wsk-js-switch"))
      , t = document.querySelector(".js-send-push-options")
      , i = document.querySelector(".js-xhr-button");
    new MaterialButton(i);
    var n = document.querySelector(".js-copy-curl-button");
    n.disabled = !document.queryCommandSupported("copy"),
    n.addEventListener("click", function() {
        var e = document.querySelector(".js-curl-code")
          , s = document.createRange();
        s.selectNode(e),
        window.getSelection().addRange(s);
        try {
            document.execCommand("copy")
        } catch (t) {
            console.log("Oops, unable to copy", t)
        }
        window.getSelection().removeAllRanges()
    }
    ),
    new MaterialButton(n),
    this.getPushSwitchElement = function() {
        return e
    }
    ,
    this.getWrappedPushSwitch = function() {
        return s
    }
    ,
    this.getSendPushOptionsElement = function() {
        return t
    }
}
function MaterialAnimation(e) {
    this.element_ = e,
    this.position_ = this.Constant_.STARTING_POSITION,
    this.moveable_ = this.element_.querySelector("." + this.CssClasses_.DEMO_JS_MOVABLE_AREA),
    this.init()
}
function MaterialButton(e) {
    this.element_ = e,
    this.init()
}
function MaterialCheckbox(e) {
    this.element_ = e,
    this.init()
}
function MaterialColumnLayout(e) {
    this.element_ = e,
    this.init()
}
function MaterialIconToggle(e) {
    this.element_ = e,
    this.init()
}
function MaterialItem(e) {
    this.element_ = e,
    this.init()
}
function MaterialRadio(e) {
    this.element_ = e,
    this.init()
}
function MaterialSlider(e) {
    this.element_ = e,
    this.isIE_ = window.navigator.msPointerEnabled,
    this.init()
}
function MaterialSpinner(e) {
    this.element_ = e,
    this.init()
}
function MaterialSwitch(e) {
    this.element_ = e,
    this.init()
}
function MaterialTabs(e) {
    this.element_ = e,
    this.init()
}
function MaterialTab(e, s) {
    if (e) {
        if (s.element_.classList.contains(s.CssClasses_.RIPPLE_EFFECT)) {
            var t = document.createElement("span");
            t.classList.add(s.CssClasses_.RIPPLE_CONTAINER),
            t.classList.add(s.CssClasses_.RIPPLE_EFFECT);
            var i = document.createElement("span");
            i.classList.add(s.CssClasses_.RIPPLE),
            t.appendChild(i),
            e.appendChild(t)
        }
        e.addEventListener("click", function(t) {
            t.preventDefault();
            var i = e.href.split("#")[1]
              , n = document.querySelector("#" + i);
            s.resetTabState_(),
            s.resetPanelState_(),
            e.classList.add(s.CssClasses_.IS_ACTIVE),
            n.classList.add(s.CssClasses_.IS_ACTIVE)
        }
        )
    }
}
function MaterialTextfield(e) {
    this.element_ = e,
    this.maxRows = this.Constant_.NO_MAX_ROWS,
    this.init()
}
function MaterialTooltip(e) {
    this.element_ = e,
    this.init()
}
function MaterialLayout(e) {
    this.element_ = e,
    this.init()
}
function MaterialLayoutTab(e, s, t, i) {
    if (e) {
        if (i.tabBar_.classList.contains(i.CssClasses_.JS_RIPPLE_EFFECT)) {
            var n = document.createElement("span");
            n.classList.add(i.CssClasses_.RIPPLE_CONTAINER),
            n.classList.add(i.CssClasses_.JS_RIPPLE_EFFECT);
            var a = document.createElement("span");
            a.classList.add(i.CssClasses_.RIPPLE),
            n.appendChild(a),
            e.appendChild(n)
        }
        e.addEventListener("click", function(n) {
            n.preventDefault();
            var a = e.href.split("#")[1]
              , o = i.content_.querySelector("#" + a);
            i.resetTabState_(s),
            i.resetPanelState_(t),
            e.classList.add(i.CssClasses_.ACTIVE_CLASS),
            o.classList.add(i.CssClasses_.ACTIVE_CLASS)
        }
        )
    }
}
function MaterialRipple(e) {
    this.element_ = e,
    this.init()
}
IndexDBWrapper.supported = "indexedDB" in self;
var IndexDBWrapperProto = IndexDBWrapper.prototype;
IndexDBWrapperProto.transaction = function(e, s, t) {
    return this.ready.then(function(i) {
        var n = "readonly";
        s.apply ? t = s : s && (n = s);
        var a, o = i.transaction(e, n), r = t(o, i), l = promisifyRequest(o);
        return r ? (a = r[0] && "result" in r[0] ? Promise.all(r.map(promisifyRequest)) : promisifyRequest(r),
        l.then(function() {
            return a
        }
        )) : l
    }
    )
}
,
IndexDBWrapperProto.get = function(e, s) {
    return this.transaction(e, function(t) {
        return t.objectStore(e).get(s)
    }
    )
}
,
IndexDBWrapperProto.put = function(e, s, t) {
    return this.transaction(e, "readwrite", function(i) {
        i.objectStore(e).put(t, s)
    }
    )
}
,
IndexDBWrapperProto["delete"] = function(e, s) {
    return this.transaction(e, "readwrite", function(t) {
        t.objectStore(e)["delete"](s)
    }
    )
}
;
/*!
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
var API_KEY = "AIzaSyBBh4ddPa96rQQNxqiq_qQj7sq1JdsNQUQ"
  , PUSH_SERVER_URL = "https://simple-push-demo.appspot.com";
window.addEventListener("UIReady", function() {
    var e = document.querySelector(".js-enable-push");
    e.addEventListener("change", function(e) {
        e.target.checked ? subscribeDevice() : unsubscribeDevice()
    }
    ),
    "serviceWorker" in navigator ? navigator.serviceWorker.register("/service-worker.js", {
        scope: "./"
    }).then(initialiseState) : (window.PushDemo.ui.showError("Ooops Service Workers aren't Supported", 'Service Workers aren\'t supported in this browser. For this demo be sure to use <a href="https://www.google.co.uk/chrome/browser/canary.html">Chrome Canary</a> or version 42.'),
    window.PushDemo.ui.showOnlyError())
}
),
UIHandler.prototype.showError = function(e, s) {
    var t = document.querySelector(".js-error-message-container")
      , i = t.querySelector(".js-error-title")
      , n = t.querySelector(".js-error-message");
    i.innerHTML = e,
    n.innerHTML = s,
    t.style.opacity = 1;
    var a = this.getSendPushOptionsElement();
    a.style.display = "none"
}
,
UIHandler.prototype.showOnlyError = function() {
    var e = document.querySelector(".js-push-switch-container");
    e.style.display = "none"
}
,
UIHandler.prototype.setPushChecked = function(e) {
    console.log("Set Checked State = " + e);
    var s = this.getPushSwitchElement();
    s.checked = e,
    this.getWrappedPushSwitch().onChange_()
}
,
UIHandler.prototype.setPushSwitchDisabled = function(e) {
    console.log("Set disabled State = " + e);
    var s = this.getPushSwitchElement();
    s.disabled = e,
    this.getWrappedPushSwitch().onChange_()
}
,
UIHandler.prototype.showGCMPushOptions = function(e) {
    var s = this.getSendPushOptionsElement()
      , t = e ? 1 : 0;
    s.style.opacity = t
}
,
window.addEventListener("load", function() {
    window.PushDemo = window.PushDemo || {},
    window.PushDemo.ui = new UIHandler;
    var e = new CustomEvent("UIReady");
    window.dispatchEvent(e)
}
);
var componentHandler = function() {
    function e(e, s) {
        for (var t = 0; t < o.length; t++)
            if (o[t].className === e)
                return void 0 !== s && (o[t] = s),
                o[t];
        return !1
    }
    function s(s, i) {
        if (void 0 === i) {
            var n = e(s);
            n && (i = n.cssClass)
        }
        for (var a = document.querySelectorAll("." + i), o = 0; o < a.length; o++)
            t(a[o], s)
    }
    function t(s, t) {
        var i = s.getAttribute("data-upgraded");
        if (null  === i || -1 === i.indexOf(t)) {
            null  === i && (i = ""),
            s.setAttribute("data-upgraded", i + "," + t);
            var n = e(t);
            n ? (r.push(new n.classConstructor(s)),
            n.callbacks.forEach(function(e) {
                e(s)
            }
            )) : r.push(new window[t](s))
        }
    }
    function i(s) {
        var t = {
            classConstructor: s.constructor,
            className: s.classAsString,
            cssClass: s.cssClass,
            callbacks: []
        }
          , i = e(s.classAsString, t);
        i || o.push(t)
    }
    function n(s, t) {
        var i = e(s);
        i && i.callbacks.push(t)
    }
    function a() {
        for (var e = 0; e < o.length; e++)
            s(o[e].className)
    }
    var o = []
      , r = [];
    return {
        upgradeDom: s,
        upgradeElement: t,
        upgradeAllRegistered: a,
        registerUpgradedCallback: n,
        register: i
    }
}
();
window.addEventListener("load", function() {
    "classList" in document.createElement("div") && "querySelector" in document && "addEventListener" in window && Array.prototype.forEach ? (document.documentElement.classList.add("wsk-js"),
    componentHandler.upgradeAllRegistered()) : componentHandler.upgradeElement = componentHandler.register = function() {}
}
),
window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
        window.setTimeout(e, 1e3 / 60)
    }
}
(),
MaterialAnimation.prototype.Constant_ = {
    STARTING_POSITION: 1
},
MaterialAnimation.prototype.CssClasses_ = {
    DEMO_JS_MOVABLE_AREA: "demo-js-movable-area",
    DEMO_POSITION_PREFIX: "demo-position-"
},
MaterialAnimation.prototype.handleClick_ = function() {
    this.moveable_.classList.remove(this.CssClasses_.DEMO_POSITION_PREFIX + this.position_),
    this.position_++,
    this.position_ > 6 && (this.position_ = 1),
    this.moveable_.classList.add(this.CssClasses_.DEMO_POSITION_PREFIX + this.position_)
}
,
MaterialAnimation.prototype.init = function() {
    if (this.element_) {
        if (!this.moveable_)
            return void console.error("Was expecting to find an element with class name .demo-js-movable-area in side of: ", this.element_);
        this.element_.addEventListener("click", this.handleClick_.bind(this))
    }
}
,
componentHandler.register({
    constructor: MaterialAnimation,
    classAsString: "MaterialAnimation",
    cssClass: "demo-js-clickable-area"
}),
MaterialButton.prototype.Constant_ = {},
MaterialButton.prototype.CssClasses_ = {
    WSK_JS_RIPPLE_EFFECT: "wsk-js-ripple-effect",
    WSK_BUTTON_RIPPLE_CONTAINER: "wsk-button__ripple-container",
    WSK_RIPPLE: "wsk-ripple"
},
MaterialButton.prototype.blurHandlerGenerator_ = function(e) {
    return function() {
        e.blur()
    }
}
,
MaterialButton.prototype.init = function() {
    if (this.element_) {
        var e = this.blurHandlerGenerator_(this.element_);
        if (this.element_.classList.contains(this.CssClasses_.WSK_JS_RIPPLE_EFFECT)) {
            var s = document.createElement("span");
            s.classList.add(this.CssClasses_.WSK_BUTTON_RIPPLE_CONTAINER);
            var t = document.createElement("span");
            t.classList.add(this.CssClasses_.WSK_RIPPLE),
            s.appendChild(t),
            t.addEventListener("mouseup", e),
            this.element_.appendChild(s)
        }
        this.element_.addEventListener("mouseup", e)
    }
}
,
"undefined" != typeof componentHandler && componentHandler.register({
    constructor: MaterialButton,
    classAsString: "MaterialButton",
    cssClass: "wsk-js-button"
}),
MaterialCheckbox.prototype.Constant_ = {
    TINY_TIMEOUT: .001
},
MaterialCheckbox.prototype.CssClasses_ = {
    INPUT: "wsk-checkbox__input",
    BOX_OUTLINE: "wsk-checkbox__box-outline",
    FOCUS_HELPER: "wsk-checkbox__focus-helper",
    TICK_OUTLINE: "wsk-checkbox__tick-outline",
    RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    RIPPLE_CONTAINER: "wsk-checkbox__ripple-container",
    RIPPLE_CENTER: "wsk-ripple--center",
    RIPPLE: "wsk-ripple",
    IS_FOCUSED: "is-focused",
    IS_DISABLED: "is-disabled",
    IS_CHECKED: "is-checked",
    IS_UPGRADED: "is-upgraded"
},
MaterialCheckbox.prototype.onChange_ = function() {
    this.updateClasses_(this.btnElement_, this.element_)
}
,
MaterialCheckbox.prototype.onFocus_ = function() {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED)
}
,
MaterialCheckbox.prototype.onBlur_ = function() {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
}
,
MaterialCheckbox.prototype.onMouseUp_ = function() {
    this.blur_()
}
,
MaterialCheckbox.prototype.updateClasses_ = function(e, s) {
    e.disabled ? s.classList.add(this.CssClasses_.IS_DISABLED) : s.classList.remove(this.CssClasses_.IS_DISABLED),
    e.checked ? s.classList.add(this.CssClasses_.IS_CHECKED) : s.classList.remove(this.CssClasses_.IS_CHECKED)
}
,
MaterialCheckbox.prototype.blur_ = function() {
    window.setTimeout(function() {
        this.btnElement_.blur()
    }
    .bind(this), this.Constant_.TINY_TIMEOUT)
}
,
MaterialCheckbox.prototype.init = function() {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector("." + this.CssClasses_.INPUT);
        var e = document.createElement("span");
        e.classList.add(this.CssClasses_.BOX_OUTLINE);
        var s = document.createElement("span");
        s.classList.add(this.CssClasses_.FOCUS_HELPER);
        var t = document.createElement("span");
        t.classList.add(this.CssClasses_.TICK_OUTLINE),
        e.appendChild(t),
        this.element_.appendChild(s),
        this.element_.appendChild(e);
        var i;
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
            i = document.createElement("span"),
            i.classList.add(this.CssClasses_.RIPPLE_CONTAINER),
            i.classList.add(this.CssClasses_.RIPPLE_EFFECT),
            i.classList.add(this.CssClasses_.RIPPLE_CENTER);
            var n = document.createElement("span");
            n.classList.add(this.CssClasses_.RIPPLE),
            i.appendChild(n),
            this.element_.appendChild(i),
            i.addEventListener("mouseup", this.onMouseUp_.bind(this))
        }
        this.btnElement_.addEventListener("change", this.onChange_.bind(this)),
        this.btnElement_.addEventListener("focus", this.onFocus_.bind(this)),
        this.btnElement_.addEventListener("blur", this.onBlur_.bind(this)),
        this.element_.addEventListener("mouseup", this.onMouseUp_.bind(this)),
        this.updateClasses_(this.btnElement_, this.element_),
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
    }
}
,
componentHandler.register({
    constructor: MaterialCheckbox,
    classAsString: "MaterialCheckbox",
    cssClass: "wsk-js-checkbox"
}),
MaterialColumnLayout.prototype.Constant_ = {
    INVISIBLE_WRAPPING_ELEMENT_COUNT: 3
},
MaterialColumnLayout.prototype.CssClasses_ = {
    INVISIBLE_WRAPPING_ELEMENT: "wsk-column-layout__wrap-hack"
},
MaterialColumnLayout.prototype.init = function() {
    if (this.element_)
        for (var e = 0; e < this.Constant_.INVISIBLE_WRAPPING_ELEMENT_COUNT; e++) {
            var s = document.createElement("div");
            s.classList.add(this.CssClasses_.INVISIBLE_WRAPPING_ELEMENT),
            this.element_.appendChild(s)
        }
}
,
componentHandler.register({
    constructor: MaterialColumnLayout,
    classAsString: "MaterialColumnLayout",
    cssClass: "wsk-column-layout"
}),
MaterialIconToggle.prototype.Constant_ = {
    TINY_TIMEOUT: .001
},
MaterialIconToggle.prototype.CssClasses_ = {
    INPUT: "wsk-icon-toggle__input",
    JS_RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    RIPPLE_CONTAINER: "wsk-icon-toggle__ripple-container",
    RIPPLE_CENTER: "wsk-ripple--center",
    RIPPLE: "wsk-ripple",
    IS_FOCUSED: "is-focused",
    IS_DISABLED: "is-disabled",
    IS_CHECKED: "is-checked",
    IS_UPGRADED: "is-upgraded"
},
MaterialIconToggle.prototype.onChange_ = function() {
    this.updateClasses_(this.btnElement_, this.element_)
}
,
MaterialIconToggle.prototype.onFocus_ = function() {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED)
}
,
MaterialIconToggle.prototype.onBlur_ = function() {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
}
,
MaterialIconToggle.prototype.onMouseUp_ = function() {
    this.blur_()
}
,
MaterialIconToggle.prototype.updateClasses_ = function(e, s) {
    e.disabled ? s.classList.add(this.CssClasses_.IS_DISABLED) : s.classList.remove(this.CssClasses_.IS_DISABLED),
    e.checked ? s.classList.add(this.CssClasses_.IS_CHECKED) : s.classList.remove(this.CssClasses_.IS_CHECKED)
}
,
MaterialIconToggle.prototype.blur_ = function() {
    window.setTimeout(function() {
        this.btnElement_.blur()
    }
    .bind(this), this.Constant_.TINY_TIMEOUT)
}
,
MaterialIconToggle.prototype.init = function() {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector("." + this.CssClasses_.INPUT);
        var e;
        if (this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
            e = document.createElement("span"),
            e.classList.add(this.CssClasses_.RIPPLE_CONTAINER),
            e.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT),
            e.classList.add(this.CssClasses_.RIPPLE_CENTER);
            var s = document.createElement("span");
            s.classList.add(this.CssClasses_.RIPPLE),
            e.appendChild(s),
            this.element_.appendChild(e),
            e.addEventListener("mouseup", this.onMouseUp_.bind(this))
        }
        this.btnElement_.addEventListener("change", this.onChange_.bind(this)),
        this.btnElement_.addEventListener("focus", this.onFocus_.bind(this)),
        this.btnElement_.addEventListener("blur", this.onBlur_.bind(this)),
        this.element_.addEventListener("mouseup", this.onMouseUp_.bind(this)),
        this.updateClasses_(this.btnElement_, this.element_),
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
    }
}
,
componentHandler.register({
    constructor: MaterialIconToggle,
    classAsString: "MaterialIconToggle",
    cssClass: "wsk-js-icon-toggle"
}),
MaterialItem.prototype.Constant_ = {},
MaterialItem.prototype.CssClasses_ = {
    WSK_ITEM_RIPPLE_CONTAINER: "wsk-item--ripple-container",
    WSK_RIPPLE: "wsk-ripple"
},
MaterialItem.prototype.init = function() {
    if (this.element_) {
        var e = document.createElement("span");
        e.classList.add(this.CssClasses_.WSK_ITEM_RIPPLE_CONTAINER);
        var s = document.createElement("span");
        s.classList.add(this.CssClasses_.WSK_RIPPLE),
        e.appendChild(s),
        this.element_.appendChild(e)
    }
}
,
componentHandler.register({
    constructor: MaterialItem,
    classAsString: "MaterialItem",
    cssClass: "wsk-js-ripple-effect"
}),
MaterialRadio.prototype.Constant_ = {
    TINY_TIMEOUT: .001
},
MaterialRadio.prototype.CssClasses_ = {
    JS_RADIO: "wsk-js-radio",
    RADIO_BTN: "wsk-radio__button",
    RADIO_OUTER_CIRCLE: "wsk-radio__outer-circle",
    RADIO_INNER_CIRCLE: "wsk-radio__inner-circle",
    RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    RIPPLE_CONTAINER: "wsk-radio__ripple-container",
    RIPPLE_CENTER: "wsk-ripple--center",
    RIPPLE: "wsk-ripple",
    IS_FOCUSED: "is-focused",
    IS_DISABLED: "is-disabled",
    IS_CHECKED: "is-checked",
    IS_UPGRADED: "is-upgraded"
},
MaterialRadio.prototype.onChange_ = function() {
    this.updateClasses_(this.btnElement_, this.element_);
    for (var e = document.getElementsByClassName(this.CssClasses_.JS_RADIO), s = 0; s < e.length; s++) {
        var t = e[s].querySelector("." + this.CssClasses_.RADIO_BTN);
        t.getAttribute("name") === this.btnElement_.getAttribute("name") && this.updateClasses_(t, e[s])
    }
}
,
MaterialRadio.prototype.onFocus_ = function() {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED)
}
,
MaterialRadio.prototype.onBlur_ = function() {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
}
,
MaterialRadio.prototype.onMouseup_ = function() {
    this.blur_()
}
,
MaterialRadio.prototype.updateClasses_ = function(e, s) {
    e.disabled ? s.classList.add(this.CssClasses_.IS_DISABLED) : s.classList.remove(this.CssClasses_.IS_DISABLED),
    e.checked ? s.classList.add(this.CssClasses_.IS_CHECKED) : s.classList.remove(this.CssClasses_.IS_CHECKED)
}
,
MaterialRadio.prototype.blur_ = function() {
    window.setTimeout(function() {
        this.btnElement_.blur()
    }
    .bind(this), this.Constant_.TINY_TIMEOUT)
}
,
MaterialRadio.prototype.init = function() {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector("." + this.CssClasses_.RADIO_BTN);
        var e = document.createElement("span");
        e.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);
        var s = document.createElement("span");
        s.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE),
        this.element_.appendChild(e),
        this.element_.appendChild(s);
        var t;
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
            t = document.createElement("span"),
            t.classList.add(this.CssClasses_.RIPPLE_CONTAINER),
            t.classList.add(this.CssClasses_.RIPPLE_EFFECT),
            t.classList.add(this.CssClasses_.RIPPLE_CENTER);
            var i = document.createElement("span");
            i.classList.add(this.CssClasses_.RIPPLE),
            t.appendChild(i),
            this.element_.appendChild(t),
            t.addEventListener("mouseup", this.onMouseup_.bind(this))
        }
        this.btnElement_.addEventListener("change", this.onChange_.bind(this)),
        this.btnElement_.addEventListener("focus", this.onFocus_.bind(this)),
        this.btnElement_.addEventListener("blur", this.onBlur_.bind(this)),
        this.element_.addEventListener("mouseup", this.onMouseup_.bind(this)),
        this.updateClasses_(this.btnElement_, this.element_),
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
    }
}
,
componentHandler.register({
    constructor: MaterialRadio,
    classAsString: "MaterialRadio",
    cssClass: "wsk-js-radio"
}),
MaterialSlider.prototype.Constant_ = {},
MaterialSlider.prototype.CssClasses_ = {
    IE_CONTAINER: "wsk-slider__ie-container",
    SLIDER_CONTAINER: "wsk-slider__container",
    BACKGROUND_FLEX: "wsk-slider__background-flex",
    BACKGROUND_LOWER: "wsk-slider__background-lower",
    BACKGROUND_UPPER: "wsk-slider__background-upper",
    IS_LOWEST_VALUE: "is-lowest-value",
    IS_UPGRADED: "is-upgraded"
},
MaterialSlider.prototype.onInput_ = function() {
    this.updateValue_()
}
,
MaterialSlider.prototype.onChange_ = function() {
    this.updateValue_()
}
,
MaterialSlider.prototype.onMouseUp_ = function(e) {
    e.target.blur()
}
,
MaterialSlider.prototype.updateValue_ = function() {
    var e = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
    0 === e ? this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE) : this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE),
    this.isIE_ || (this.backgroundLower_.style.flex = e,
    this.backgroundLower_.style.webkitFlex = e,
    this.backgroundUpper_.style.flex = 1 - e,
    this.backgroundUpper_.style.webkitFlex = 1 - e)
}
,
MaterialSlider.prototype.init = function() {
    if (this.element_) {
        if (this.isIE_) {
            var e = document.createElement("div");
            e.classList.add(this.CssClasses_.IE_CONTAINER),
            this.element_.parentElement.insertBefore(e, this.element_),
            this.element_.parentElement.removeChild(this.element_),
            e.appendChild(this.element_)
        } else {
            var s = document.createElement("div");
            s.classList.add(this.CssClasses_.SLIDER_CONTAINER),
            this.element_.parentElement.insertBefore(s, this.element_),
            this.element_.parentElement.removeChild(this.element_),
            s.appendChild(this.element_);
            var t = document.createElement("div");
            t.classList.add(this.CssClasses_.BACKGROUND_FLEX),
            s.appendChild(t),
            this.backgroundLower_ = document.createElement("div"),
            this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER),
            t.appendChild(this.backgroundLower_),
            this.backgroundUpper_ = document.createElement("div"),
            this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER),
            t.appendChild(this.backgroundUpper_)
        }
        this.element_.addEventListener("input", this.onInput_.bind(this)),
        this.element_.addEventListener("change", this.onChange_.bind(this)),
        this.element_.addEventListener("mouseup", this.onMouseUp_.bind(this)),
        this.updateValue_(),
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
    }
}
,
componentHandler.register({
    constructor: MaterialSlider,
    classAsString: "MaterialSlider",
    cssClass: "wsk-js-slider"
}),
MaterialSpinner.prototype.Constant_ = {
    WSK_SPINNER_LAYER_COUNT: 4
},
MaterialSpinner.prototype.CssClasses_ = {
    WSK_SPINNER_LAYER: "wsk-spinner__layer",
    WSK_SPINNER_CIRCLE_CLIPPER: "wsk-spinner__circle-clipper",
    WSK_SPINNER_CIRCLE: "wsk-spinner__circle",
    WSK_SPINNER_GAP_PATCH: "wsk-spinner__gap-patch",
    WSK_SPINNER_LEFT: "wsk-spinner__left",
    WSK_SPINNER_RIGHT: "wsk-spinner__right"
},
MaterialSpinner.prototype.createLayer = function(e) {
    var s = document.createElement("div");
    s.classList.add(this.CssClasses_.WSK_SPINNER_LAYER),
    s.classList.add(this.CssClasses_.WSK_SPINNER_LAYER + "-" + e);
    var t = document.createElement("div");
    t.classList.add(this.CssClasses_.WSK_SPINNER_CIRCLE_CLIPPER),
    t.classList.add(this.CssClasses_.WSK_SPINNER_LEFT);
    var i = document.createElement("div");
    i.classList.add(this.CssClasses_.WSK_SPINNER_GAP_PATCH);
    var n = document.createElement("div");
    n.classList.add(this.CssClasses_.WSK_SPINNER_CIRCLE_CLIPPER),
    n.classList.add(this.CssClasses_.WSK_SPINNER_RIGHT);
    for (var a = [t, i, n], o = 0; o < a.length; o++) {
        var r = document.createElement("div");
        r.classList.add(this.CssClasses_.WSK_SPINNER_CIRCLE),
        a[o].appendChild(r)
    }
    s.appendChild(t),
    s.appendChild(i),
    s.appendChild(n),
    this.element_.appendChild(s)
}
,
MaterialSpinner.prototype.stop = function() {
    this.element_.classlist.remove("is-active")
}
,
MaterialSpinner.prototype.start = function() {
    this.element_.classlist.add("is-active")
}
,
MaterialSpinner.prototype.init = function() {
    if (this.element_) {
        for (var e = 1; e <= this.Constant_.WSK_SPINNER_LAYER_COUNT; e++)
            this.createLayer(e);
        this.element_.classList.add("is-upgraded")
    }
}
,
componentHandler.register({
    constructor: MaterialSpinner,
    classAsString: "MaterialSpinner",
    cssClass: "wsk-js-spinner"
}),
MaterialSwitch.prototype.Constant_ = {
    TINY_TIMEOUT: .001
},
MaterialSwitch.prototype.CssClasses_ = {
    INPUT: "wsk-switch__input",
    TRACK: "wsk-switch__track",
    THUMB: "wsk-switch__thumb",
    FOCUS_HELPER: "wsk-switch__focus-helper",
    RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    RIPPLE_CONTAINER: "wsk-switch__ripple-container",
    RIPPLE_CENTER: "wsk-ripple--center",
    RIPPLE: "wsk-ripple",
    IS_FOCUSED: "is-focused",
    IS_DISABLED: "is-disabled",
    IS_CHECKED: "is-checked",
    IS_UPGRADED: "is-upgraded"
},
MaterialSwitch.prototype.onChange_ = function() {
    this.updateClasses_(this.btnElement_, this.element_)
}
,
MaterialSwitch.prototype.onFocus_ = function() {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED)
}
,
MaterialSwitch.prototype.onBlur_ = function() {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
}
,
MaterialSwitch.prototype.onMouseUp_ = function() {
    this.blur_()
}
,
MaterialSwitch.prototype.updateClasses_ = function(e, s) {
    e.disabled ? s.classList.add(this.CssClasses_.IS_DISABLED) : s.classList.remove(this.CssClasses_.IS_DISABLED),
    e.checked ? s.classList.add(this.CssClasses_.IS_CHECKED) : s.classList.remove(this.CssClasses_.IS_CHECKED)
}
,
MaterialSwitch.prototype.blur_ = function() {
    window.setTimeout(function() {
        this.btnElement_.blur()
    }
    .bind(this), this.Constant_.TINY_TIMEOUT)
}
,
MaterialSwitch.prototype.init = function() {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector("." + this.CssClasses_.INPUT);
        var e = document.createElement("div");
        e.classList.add(this.CssClasses_.TRACK);
        var s = document.createElement("div");
        s.classList.add(this.CssClasses_.THUMB);
        var t = document.createElement("span");
        t.classList.add(this.CssClasses_.FOCUS_HELPER),
        s.appendChild(t),
        this.element_.appendChild(e),
        this.element_.appendChild(s);
        var i;
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
            i = document.createElement("span"),
            i.classList.add(this.CssClasses_.RIPPLE_CONTAINER),
            i.classList.add(this.CssClasses_.RIPPLE_EFFECT),
            i.classList.add(this.CssClasses_.RIPPLE_CENTER);
            var n = document.createElement("span");
            n.classList.add(this.CssClasses_.RIPPLE),
            i.appendChild(n),
            this.element_.appendChild(i),
            i.addEventListener("mouseup", this.onMouseUp_.bind(this))
        }
        this.btnElement_.addEventListener("change", this.onChange_.bind(this)),
        this.btnElement_.addEventListener("focus", this.onFocus_.bind(this)),
        this.btnElement_.addEventListener("blur", this.onBlur_.bind(this)),
        this.element_.addEventListener("mouseup", this.onMouseUp_.bind(this)),
        this.updateClasses_(this.btnElement_, this.element_),
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
    }
}
,
"undefined" != typeof componentHandler && componentHandler.register({
    constructor: MaterialSwitch,
    classAsString: "MaterialSwitch",
    cssClass: "wsk-js-switch"
}),
MaterialTabs.prototype.Constant_ = {},
MaterialTabs.prototype.CssClasses_ = {
    TAB: "wsk-tabs__tab",
    PANEL: "wsk-tabs__panel",
    RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_CONTAINER: "wsk-tabs__ripple-container",
    RIPPLE: "wsk-ripple",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    IS_ACTIVE: "is-active",
    IS_UPGRADED: "is-upgraded"
},
MaterialTabs.prototype.initTabs_ = function() {
    this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT) && this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS),
    this.tabs_ = this.element_.querySelectorAll("." + this.CssClasses_.TAB),
    this.panels_ = this.element_.querySelectorAll("." + this.CssClasses_.PANEL);
    for (var e = 0; e < this.tabs_.length; e++)
        new MaterialTab(this.tabs_[e],this);
    this.element_.classList.add(this.CssClasses_.IS_UPGRADED)
}
,
MaterialTabs.prototype.resetTabState_ = function() {
    for (var e = 0; e < this.tabs_.length; e++)
        this.tabs_[e].classList.remove(this.CssClasses_.IS_ACTIVE)
}
,
MaterialTabs.prototype.resetPanelState_ = function() {
    for (var e = 0; e < this.panels_.length; e++)
        this.panels_[e].classList.remove(this.CssClasses_.IS_ACTIVE)
}
,
MaterialTabs.prototype.init = function() {
    this.element_ && this.initTabs_()
}
,
componentHandler.register({
    constructor: MaterialTabs,
    classAsString: "MaterialTabs",
    cssClass: "wsk-js-tabs"
}),
MaterialTextfield.prototype.Constant_ = {
    NO_MAX_ROWS: -1,
    MAX_ROWS_ATTRIBUTE: "maxrows"
},
MaterialTextfield.prototype.CssClasses_ = {
    WSK_TEXT_EXP_ICO_RIP_CONTAINER: "wsk-textfield-expandable-icon__ripple__container",
    WSK_JS_RIPPLE_EFFECT: "wsk-js-ripple-effect",
    WSK_RIPPLE_CENTER: "wsk-ripple--center",
    WSK_RIPPLE: "wsk-ripple",
    IS_DIRTY: "is-dirty"
},
MaterialTextfield.prototype.expandableIcon_ = function(e) {
    if (!e.getAttribute("data-upgraded")) {
        var s = document.createElement("span");
        s.classList.add(this.CssClasses_.WSK_TEXT_EXP_ICO_RIP_CONTAINER),
        s.classList.add(this.CssClasses_.WSK_JS_RIPPLE_EFFECT),
        s.classList.add(this.CssClasses_.WSK_RIPPLE_CENTER);
        var t = document.createElement("span");
        t.classList.add(this.CssClasses_.WSK_RIPPLE),
        s.appendChild(t),
        e.appendChild(s),
        e.setAttribute("data-upgraded", "")
    }
}
,
MaterialTextfield.prototype.onInputChange_ = function(e) {
    e.target.value && e.target.value.length > 0 ? e.target.classList.add(this.CssClasses_.IS_DIRTY) : e.target.classList.remove(this.CssClasses_.IS_DIRTY)
}
,
MaterialTextfield.prototype.onKeyDown_ = function(e) {
    var s = e.target.value.split("\n").length;
    13 === e.keyCode && s >= this.maxRows && e.preventDefault()
}
,
MaterialTextfield.prototype.init = function() {
    if (this.element_) {
        for (var e = document.querySelectorAll(".wsk-textfield-expandable-icon"), s = 0; s < e.length; ++s)
            this.expandableIcon_(e[s]);
        this.element_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE) && (this.maxRows = parseInt(this.element_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE), 10),
        isNaN(this.maxRows) && (console.log("maxrows attribute provided, but wasn't a number: " + this.maxRows),
        this.maxRows = this.Constant_.NO_MAX_ROWS)),
        this.element_.addEventListener("input", this.onInputChange_.bind(this)),
        this.maxRows !== this.Constant_.NO_MAX_ROWS && this.element_.addEventListener("keydown", this.onKeyDown_.bind(this))
    }
}
,
componentHandler.register({
    constructor: MaterialTextfield,
    classAsString: "MaterialTextfield",
    cssClass: "wsk-js-textfield"
}),
MaterialTooltip.prototype.Constant_ = {},
MaterialTooltip.prototype.CssClasses_ = {
    IS_ACTIVE: "is-active"
},
MaterialTooltip.prototype.handleMouseEnter_ = function(e) {
    e.stopPropagation();
    var s = e.target.getBoundingClientRect();
    this.element_.style.left = s.left + s.width / 2 + "px",
    this.element_.style.marginLeft = -1 * (this.element_.offsetWidth / 2) + "px",
    this.element_.style.top = s.top + s.height + 10 + "px",
    this.element_.classList.add(this.CssClasses_.IS_ACTIVE)
}
,
MaterialTooltip.prototype.handleMouseLeave_ = function(e) {
    e.stopPropagation(),
    this.element_.classList.remove(this.CssClasses_.IS_ACTIVE)
}
,
MaterialTooltip.prototype.init = function() {
    if (this.element_) {
        var e = this.element_.getAttribute("for")
          , s = document.getElementById(e);
        s.addEventListener("mouseenter", this.handleMouseEnter_.bind(this), !1),
        s.addEventListener("mouseleave", this.handleMouseLeave_.bind(this))
    }
}
,
componentHandler.register({
    constructor: MaterialTooltip,
    classAsString: "MaterialTooltip",
    cssClass: "wsk-tooltip"
}),
MaterialLayout.prototype.Constant_ = {
    MAX_WIDTH: "(max-width: 850px)"
},
MaterialLayout.prototype.Mode_ = {
    STANDARD: 0,
    SEAMED: 1,
    WATERFALL: 2,
    SCROLL: 3
},
MaterialLayout.prototype.CssClasses_ = {
    HEADER: "wsk-layout__header",
    DRAWER: "wsk-layout__drawer",
    CONTENT: "wsk-layout__content",
    DRAWER_BTN: "wsk-layout__drawer-button",
    JS_RIPPLE_EFFECT: "wsk-js-ripple-effect",
    RIPPLE_CONTAINER: "wsk-layout__tab-ripple-container",
    RIPPLE: "wsk-ripple",
    RIPPLE_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    HEADER_SEAMED: "wsk-layout__header--seamed",
    HEADER_WATERFALL: "wsk-layout__header--waterfall",
    HEADER_SCROLL: "wsk-layout__header--scroll",
    FIXED_HEADER: "wsk-layout--fixed-header",
    OBFUSCATOR: "wsk-layout__obfuscator",
    TAB_BAR: "wsk-layout__tab-bar",
    TAB_CONTAINER: "wsk-layout__tab-bar-container",
    TAB: "wsk-layout__tab",
    TAB_BAR_BUTTON: "wsk-layout__tab-bar-button",
    TAB_BAR_LEFT_BUTTON: "wsk-layout__tab-bar-left-button",
    TAB_BAR_RIGHT_BUTTON: "wsk-layout__tab-bar-right-button",
    PANEL: "wsk-layout__tab-panel",
    SHADOW_CLASS: "is-casting-shadow",
    COMPACT_CLASS: "is-compact",
    SMALL_SCREEN_CLASS: "is-small-screen",
    DRAWER_OPEN_CLASS: "is-visible",
    ACTIVE_CLASS: "is-active",
    UPGRADED_CLASS: "is-upgraded"
},
MaterialLayout.prototype.contentScrollHandler_ = function() {
    this.content_.scrollTop > 0 ? (this.header_.classList.add(this.CssClasses_.SHADOW_CLASS),
    this.header_.classList.add(this.CssClasses_.COMPACT_CLASS)) : (this.header_.classList.remove(this.CssClasses_.SHADOW_CLASS),
    this.header_.classList.remove(this.CssClasses_.COMPACT_CLASS))
}
,
MaterialLayout.prototype.screenSizeHandler_ = function() {
    this.screenSizeMediaQuery_.matches ? this.element_.classList.add(this.CssClasses_.SMALL_SCREEN_CLASS) : (this.element_.classList.remove(this.CssClasses_.SMALL_SCREEN_CLASS),
    this.drawer_ && this.drawer_.classList.remove(this.CssClasses_.DRAWER_OPEN_CLASS))
}
,
MaterialLayout.prototype.drawerToggleHandler_ = function() {
    this.drawer_.classList.toggle(this.CssClasses_.DRAWER_OPEN_CLASS)
}
,
MaterialLayout.prototype.resetTabState_ = function(e) {
    for (var s = 0; s < e.length; s++)
        e[s].classList.remove(this.CssClasses_.ACTIVE_CLASS)
}
,
MaterialLayout.prototype.resetPanelState_ = function(e) {
    for (var s = 0; s < e.length; s++)
        e[s].classList.remove(this.CssClasses_.ACTIVE_CLASS)
}
,
MaterialLayout.prototype.init = function() {
    if (this.element_) {
        var e = document.createElement("div");
        e.classList.add("wsk-layout__container"),
        this.element_.parentElement.insertBefore(e, this.element_),
        this.element_.parentElement.removeChild(this.element_),
        e.appendChild(this.element_),
        this.header_ = this.element_.querySelector("." + this.CssClasses_.HEADER),
        this.drawer_ = this.element_.querySelector("." + this.CssClasses_.DRAWER),
        this.tabBar_ = this.element_.querySelector("." + this.CssClasses_.TAB_BAR),
        this.content_ = this.element_.querySelector("." + this.CssClasses_.CONTENT);
        var s = this.Mode_.STANDARD;
        if (this.screenSizeMediaQuery_ = window.matchMedia(this.Constant_.MAX_WIDTH),
        this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this)),
        this.screenSizeHandler_(),
        this.header_ && (this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED) ? s = this.Mode_.SEAMED : this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL) ? s = this.Mode_.WATERFALL : this.element_.classList.contains(this.CssClasses_.HEADER_SCROLL) && (s = this.Mode_.SCROLL),
        s === this.Mode_.STANDARD ? (this.header_.classList.add(this.CssClasses_.SHADOW_CLASS),
        this.tabBar_ && this.tabBar_.classList.add(this.CssClasses_.SHADOW_CLASS)) : s === this.Mode_.SEAMED || s === this.Mode_.SCROLL ? (this.header_.classList.remove(this.CssClasses_.SHADOW_CLASS),
        this.tabBar_ && this.tabBar_.classList.remove(this.CssClasses_.SHADOW_CLASS)) : s === this.Mode_.WATERFALL && (this.content_.addEventListener("scroll", this.contentScrollHandler_.bind(this)),
        this.contentScrollHandler_())),
        this.drawer_) {
            var t = document.createElement("div");
            t.classList.add(this.CssClasses_.DRAWER_BTN),
            t.addEventListener("click", this.drawerToggleHandler_.bind(this)),
            this.element_.classList.contains(this.CssClasses_.FIXED_HEADER) ? this.header_.insertBefore(t, this.header_.firstChild) : this.element_.insertBefore(t, this.content_);
            var i = document.createElement("div");
            i.classList.add(this.CssClasses_.OBFUSCATOR),
            this.element_.appendChild(i),
            i.addEventListener("click", this.drawerToggleHandler_.bind(this))
        }
        if (this.tabBar_) {
            var n = document.createElement("div");
            n.classList.add(this.CssClasses_.TAB_CONTAINER),
            this.element_.insertBefore(n, this.tabBar_),
            this.element_.removeChild(this.tabBar_);
            var a = document.createElement("div");
            a.classList.add(this.CssClasses_.TAB_BAR_BUTTON),
            a.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON),
            a.addEventListener("click", function() {
                this.tabBar_.scrollLeft -= 100
            }
            .bind(this));
            var o = document.createElement("div");
            o.classList.add(this.CssClasses_.TAB_BAR_BUTTON),
            o.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON),
            o.addEventListener("click", function() {
                this.tabBar_.scrollLeft += 100
            }
            .bind(this)),
            n.appendChild(a),
            n.appendChild(this.tabBar_),
            n.appendChild(o);
            var r = function() {
                this.tabBar_.scrollLeft > 0 ? a.classList.add(this.CssClasses_.ACTIVE_CLASS) : a.classList.remove(this.CssClasses_.ACTIVE_CLASS),
                this.tabBar_.scrollLeft < this.tabBar_.scrollWidth - this.tabBar_.offsetWidth ? o.classList.add(this.CssClasses_.ACTIVE_CLASS) : o.classList.remove(this.CssClasses_.ACTIVE_CLASS)
            }
            .bind(this);
            this.tabBar_.addEventListener("scroll", r),
            r(),
            this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT) && this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            for (var l = this.tabBar_.querySelectorAll("." + this.CssClasses_.TAB), _ = this.content_.querySelectorAll("." + this.CssClasses_.PANEL), h = 0; h < l.length; h++)
                new MaterialLayoutTab(l[h],l,_,this)
        }
        this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS)
    }
}
,
componentHandler.register({
    constructor: MaterialLayout,
    classAsString: "MaterialLayout",
    cssClass: "wsk-js-layout"
}),
MaterialRipple.prototype.Constant_ = {
    INITIAL_SCALE: "scale(0.0001, 0.0001)",
    INITIAL_SIZE: "1px",
    INITIAL_OPACITY: "0.4",
    FINAL_OPACITY: "0",
    FINAL_SCALE: ""
},
MaterialRipple.prototype.CssClasses_ = {
    WSK_RIPPLE_CENTER: "wsk-ripple--center",
    WSK_JS_RIPPLE_EFFECT_IGNORE_EVENTS: "wsk-js-ripple-effect--ignore-events",
    WSK_RIPPLE: "wsk-ripple",
    IS_ANIMATING: "is-animating"
},
MaterialRipple.prototype.downHandler_ = function(e) {
    if ("mousedown" === e.type && this.ignoringMouseDown_)
        this.ignoringMouseDown_ = !1;
    else {
        "touchstart" === e.type && (this.ignoringMouseDown_ = !0);
        var s = this.getFrameCount();
        if (s > 0)
            return;
        this.setFrameCount(1);
        var t, i, n = e.currentTarget.getBoundingClientRect();
        if (0 === e.clientX && 0 === e.clientY)
            t = Math.round(n.width / 2),
            i = Math.round(n.height / 2);
        else {
            var a = e.clientX ? e.clientX : e.touches[0].clientX
              , o = e.clientY ? e.clientY : e.touches[0].clientY;
            t = Math.round(a - n.left),
            i = Math.round(o - n.top)
        }
        this.setRippleXY(t, i),
        this.setRippleStyles(!0),
        window.requestAnimFrame(this.animFrameHandler.bind(this))
    }
}
,
MaterialRipple.prototype.init = function() {
    if (this.element_) {
        var e = this.element_.classList.contains(this.CssClasses_.WSK_RIPPLE_CENTER);
        if (!this.element_.classList.contains(this.CssClasses_.WSK_JS_RIPPLE_EFFECT_IGNORE_EVENTS)) {
            if (this.rippleElement_ = this.element_.querySelector("." + this.CssClasses_.WSK_RIPPLE),
            this.frameCount_ = 0,
            this.rippleSize_ = 0,
            this.x_ = 0,
            this.y_ = 0,
            this.ignoringMouseDown_ = !1,
            this.rippleElement_) {
                var s = this.element_.getBoundingClientRect();
                this.rippleSize_ = 2 * Math.max(s.width, s.height),
                this.rippleElement_.style.width = this.rippleSize_ + "px",
                this.rippleElement_.style.height = this.rippleSize_ + "px"
            }
            this.element_.addEventListener("mousedown", this.downHandler_.bind(this)),
            this.element_.addEventListener("touchstart", this.downHandler_.bind(this)),
            this.getFrameCount = function() {
                return this.frameCount_
            }
            ,
            this.setFrameCount = function(e) {
                this.frameCount_ = e
            }
            ,
            this.getRippleElement = function() {
                return this.rippleElement_
            }
            ,
            this.setRippleXY = function(e, s) {
                this.x_ = e,
                this.y_ = s
            }
            ,
            this.setRippleStyles = function(t) {
                if (null  !== this.rippleElement_) {
                    var i, n, a, o = "translate(" + this.x_ + "px, " + this.y_ + "px)";
                    t ? (n = this.Constant_.INITIAL_SCALE,
                    a = this.Constant_.INITIAL_SIZE) : (n = this.Constant_.FINAL_SCALE,
                    a = this.rippleSize_ + "px",
                    e && (o = "translate(" + s.width / 2 + "px, " + s.height / 2 + "px)")),
                    i = "translate(-50%, -50%) " + o + n,
                    this.rippleElement_.style.webkitTransform = i,
                    this.rippleElement_.style.msTransform = i,
                    this.rippleElement_.style.transform = i,
                    t ? (this.rippleElement_.style.opacity = this.Constant_.INITIAL_OPACITY,
                    this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING)) : (this.rippleElement_.style.opacity = this.Constant_.FINAL_OPACITY,
                    this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING))
                }
            }
            ,
            this.animFrameHandler = function() {
                this.frameCount_-- > 0 ? window.requestAnimFrame(this.animFrameHandler.bind(this)) : this.setRippleStyles(!1)
            }
        }
    }
}
,
"undefined" != typeof componentHandler && componentHandler.register({
    constructor: MaterialRipple,
    classAsString: "MaterialRipple",
    cssClass: "wsk-js-ripple-effect"
});


Pace.options.ajax.trackWebSockets = false;
var platformTour = null;
var boodskapEditor = false;
$(document).ready(function () {
    loadGoogleAnalytics();
    loadStatistics();


});

if (!DEBUG) {
    console.log("Boodskap IoT Platform 2.0...!");
    console.log("Powered by https://boodskap.io"), window.console || (window.console = {});
    for (var methods = ["log", "debug", "warn", "info", "error"], i = 0; i < methods.length; i++) console[methods[i]] = function () {
    }

}


var DOMAIN_ADMIN_ACCESS = false;

if (USER_OBJ) {
    USER_OBJ = JSON.parse(USER_OBJ);
    API_TOKEN = USER_OBJ.token;
    DOMAIN_KEY = USER_OBJ.domainKey;
    API_KEY = USER_OBJ.apiKey;
    USER_ROLE = USER_OBJ.user ? USER_OBJ.user.roles : [];

    for (var i = 0; i < USER_ROLE.length; i++) {
        if ('admin' === USER_ROLE[i]) {
            ADMIN_ACCESS = true;
        }
        if ('domainadmin' === USER_ROLE[i]) {
            DOMAIN_ADMIN_ACCESS = true;
        }
    }

} else {
    if ($.trim($('#isPublic').val()) === 'false') {
        var current_location = window.location.href;
        if (current_location.indexOf('login') === -1) {
            if (current_location.indexOf('register') === -1) {
                document.location = '/login';
            }
        }
    }
}


function showNotification(msg, type, time) {

    if (!time) time = 2500;

    // create the notification
    var notification = new NotificationFx({
        message: msg,
        layout: 'growl',
        effect: 'jelly',
        type: type, // notice, warning, error or success
        ttl: time
    });

    // show the notification
    notification.show();
}

//Notifications
function errorMsg(msg) {

    // $(".errorFeedBack").html("<i class='fa fa-exclamation-triangle'></i> "+msg);
    $("#snackbar").html("<i class='fa fa-exclamation-triangle'></i> " + msg);
    var width = $(".errorFeedBack").outerWidth();
    var totalWidth = $(document).width();
    var position = (parseInt(totalWidth) - parseInt(width)) / 2;
    $(".errorFeedBack").css({
        'left': position - 10
    });

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".errorFeedBack").css('top', 105);

    $(".errorFeedBack").show().delay(2500).fadeOut();

    snackBar();
    // $.growl.error({title:"<i class='fa fa-exclamation-triangle'></i> Error", message: msg });
}


function snackBar() {
    $("#snackbar").addClass('show');
    setTimeout(function () {
        $("#snackbar").removeClass('show');
    }, 2000);
}

function errorMsgBorder(msg, id) {

    // $(".errorFeedBack").html("<i class='fa fa-exclamation-triangle'></i> "+msg);
    $("#snackbar").html("<i class='fa fa-exclamation-triangle'></i> " + msg);
    var width = $(".errorFeedBack").outerWidth();
    var totalWidth = $(document).width();
    var position = (parseInt(totalWidth) - parseInt(width)) / 2;
    $(".errorFeedBack").css({
        'left': position - 25
    });

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".errorFeedBack").css('top', 105);

    $(".errorFeedBack").show().delay(2500).fadeOut();

    $("#" + id).css("border", "1px solid red");

    setTimeout(function () {
        $("#" + id).css("border", "1px solid #ccc");

    }, 2000);
    snackBar();

}

function successMsg(feedText) {
    // $(".feedBack").html('<i class="fa fa-check"></i>  '+feedText);
    $("#snackbar").html('<i class="fa fa-check"></i>  ' + feedText);
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".feedBack").css('top', 100);


    $window.scroll(function () {
        var windowTop = $window.scrollTop();
        if (windowTop > 35) {
            //$(".feedBack").css('top', 0);
        } else {
            //$(".feedBack").css('top', 60);
        }
    });
    $(".feedBack").show().delay(1900).fadeOut();

    snackBar();
}

function feedback(feedText) {

    // $(".feedBack").html(feedText);
    $("#snackbar").html(feedText);
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".feedBack").css('top', 100);


    $window.scroll(function () {
        var windowTop = $window.scrollTop();
        if (windowTop > 35) {
            //$(".feedBack").css('top', 0);
        } else {
            //$(".feedBack").css('top', 60);
        }
    });
    $(".feedBack").show().delay(1900).fadeOut();

    snackBar();
}


function loading(feedText) {
    $(".feedBack").html('<img src="images/loader/loader.png" style="margin-top:-2px;" border="0" alt=""> &nbsp;Loading...');
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".feedBack").css('top', 10);

    $(".feedBack").show();
}


function closeLoading() {
    $(".feedBack").hide();
}

function preLoading(feedText) {

    $(".monitorFeedBack").html('<i class="fa fa-spinner fa-spin"></i> &nbsp;' + feedText);
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');
    var windowTop = $window.scrollTop();
//	    $(".monitorFeedBack").css('top', 5);
    $(".monitorFeedBack").show();
}

function closePreLoading() {
    $(".monitorFeedBack").hide();
}


function positionFeedback() {
    var width = $(".feedBack").outerWidth();
    var totalWidth = $(document).width();
    var position = (parseInt(totalWidth) - parseInt(width)) / 2;
    $(".feedBack").css({
        'left': position - 25
    });
}

jQuery.fn.center = function () {
    this.css("left", ($(document).width() - this.width()) / 2.2 + $(window).scrollLeft() + "px");
    return this;
}


function avoidSpaces(obj) {
    $(obj).val($(obj).val().replace(/\s/g, ""));
}

function validateCron() {

    var cronReg = '^\\s*($|#|\\w+\\s*=|(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[01]?\\d|2[0-3])(?:(?:-|\/|\\,)(?:[01]?\\d|2[0-3]))?(?:,(?:[01]?\\d|2[0-3])(?:(?:-|\/|\\,)(?:[01]?\\d|2[0-3]))?)*)\\s+(\\?|\\*|(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?(?:,(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?)*)\\s+(\\?|\\*|(?:[1-9]|1[012])(?:(?:-|\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?)*|\\?|\\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\\s+(\\?|\\*|(?:[0-6])(?:(?:-|\/|\\,|#)(?:[0-6]))?(?:L)?(?:,(?:[0-6])(?:(?:-|\/|\\,|#)(?:[0-6]))?(?:L)?)*|\\?|\\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\\s)+(\\?|\\*|(?:|\\d{4})(?:(?:-|\/|\\,)(?:|\\d{4}))?(?:,(?:|\\d{4})(?:(?:-|\/|\\,)(?:|\\d{4}))?)*))$';
    var patt = new RegExp(cronReg);
    var str = $('#sch_pattern').val();
    var res = patt.test(str);
    var fdbk = '';
    if (str) {
        if (res) {
            fdbk = '<span style=\'color:green;\'><i class=\'fa fa-check-circle\'></i> Valid Cron Expression</span>';
            $('#pattren_desc').html(fdbk);
            return true;
        } else {
            fdbk = '<span style=\'color:red;\'><i class=\'fa fa-times\'></i> Invalid Cron Expression</span>';
            $('#pattren_desc').html(fdbk);
            return false;
        }
    } else {
        fdbk = '<span style=\'color:red;\'><i class=\'fa fa-times\'></i> Cron Expression is Required!</span>';
        $('#pattren_desc').html(fdbk);
        return false;
    }

}

function openNav() {
    if ($("#mySidenav").hasClass('barwidth')) {
        $(".barmenu").html('<i class="icon-bars"></i>')
        $("#mySidenav").removeClass('barwidth')
    } else {
        $(".barmenu").html('<i class="icon-close2"></i>')
        $("#mySidenav").addClass('barwidth')
    }


}

function playSound() {
    var sound = document.getElementById("beepAudio");
    sound.play()
}

function blockSpecialChar(e) {
    var value = e.key;
    var regex = /^[0-9a-zA-Z\_]+$/;
    return regex.test(value);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

$(document).ready(function () {
    $('.container-fluid').click(function (e) {
        if ($("#mySidenav").hasClass('barwidth')) {
            $(".barmenu").html('<i class="icon-bars"></i>')
            $("#mySidenav").removeClass('barwidth')
        }
    });
    $('.container').click(function (e) {
        if ($("#mySidenav").hasClass('barwidth')) {
            $(".barmenu").html('<i class="icon-bars"></i>')
            $("#mySidenav").removeClass('barwidth')
        }
    });

});

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}


function loadGoogleAnalytics() {
    var ga_token = GOOGLE_ANALYTICS_COCDE;
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', ga_token, 'auto');
    ga('send', 'pageview');
}


function loadStatistics() {
    $(".webVersion").html(WEB_VERSION)
    $.ajax({
        url: API_BASE_PATH + "/cluster/statistics",
        cache: false,
        type: 'GET',
        global: false,
        crossDomain: true,
        "headers": {
            "accept": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        success: function (data) {
            if (data) {
                $('.apiVersion').html(data.version)
            }
        },
        error: function (e) {

        }
    });
}


function mobileOrWeb() {
    var isiPad = /ipad/i.test(navigator.userAgent.toLowerCase());
    if (isiPad) {
        return false;
    }
    var isiPhone = /iphone/i.test(navigator.userAgent.toLowerCase());
    if (isiPhone) {
        return false;
    }
    var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());

    if (isiDevice) {
        return false;
    }
    var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());

    if (isAndroid) {
        return false;
    }
    var isBlackBerry = /blackberry/i.test(navigator.userAgent.toLowerCase());

    if (isBlackBerry) {
        return false;
    }
    var isWebOS = /webos/i.test(navigator.userAgent.toLowerCase());

    if (isWebOS) {
        return false;
    }
    var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());

    if (isWindowsPhone) {
        return false;
    }

    return true;
}

function resizeIframe(obj) {

    // obj.style.height = obj.contentWindow.document.body.offsetHeight  + 'px';

}


function saveAndDownload(text, name, type, id) {
    var a = document.getElementById(id);
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
}

function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

function forceLower(str) {
    str.value = str.value.toLowerCase();
}

function isUUID(s) {
    var regex = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';

    return new RegExp(regex).test(s);
}
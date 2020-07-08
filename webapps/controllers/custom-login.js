$(document).ready(function () {

    // if (DOMAIN_KEY === 'register') {
    //     if (Cookies.get('domain')) {
    //         DOMAIN_KEY = Cookies.get('domain');
    //         $(".loginCustom").html('');
    //         $(".loginHref").attr('href',BASE_PATH+'/'+Cookies.get('domain'));
    //         $(".loginCustom").css('display', 'block');
    //         $(".poweredBy").html('<img src="' + DEFAULT_POWERED_BY + '" style="height: 25px" />');
    //         getLoginProp();
    //     } else {
    //         DOMAIN_KEY = null;
    //         $(".titleName").html(DEFAULT_LOGIN_THEME.titleName)
    //         $(".sloganText").html(DEFAULT_LOGIN_THEME.sloganText)
    //         $(".loginCustom").css('display', 'block');
    //         $(".loginHref").attr('href',BASE_PATH+'/login');
    //         $(".loginLogo").attr('src', DEFAULT_LOGIN_LOGO_PATH);
    //         $(".poweredBy").html('Powered by Boodskap Inc.,');
    //     }
    //
    // } else {

        // if (DOMAIN_KEY === 'login' || DOMAIN_KEY === '') {
            $(".titleName").html(DEFAULT_LOGIN_THEME.titleName)
            $(".sloganText").html(DEFAULT_LOGIN_THEME.sloganText)
            DOMAIN_KEY = null;
            Cookies.remove('domain');
            $(".loginCustom").css('display', 'block');
            // $(".loginLogo").attr('src', DEFAULT_LOGIN_LOGO_PATH);
            $(".poweredBy").html('Powered by Boodskap Inc.,');
            loadLoginMenu();
        // } else {
        //     Cookies.set('domain', DOMAIN_KEY);
        //     $(".loginCustom").html('');
        //     $(".loginCustom").css('display', 'block');
        //     $(".poweredBy").html('<img src="' + DEFAULT_POWERED_BY + '" style="height: 25px" />');
        //     getLoginProp();
        // }
    // }

});



function loadLoginMenu() {

    var dKey = '';

    getGlobalPropertyWithKey(ADMIN_DOMAIN_BRANDING_PROPERTY, dKey,function (status, data) {
        if (status) {
            var src = data.data;
            $(".loginLogo").attr('src', API_BASE_PATH + '/files/public/download/' +src);
        } else {
            $(".loginLogo").attr('src', DEFAULT_LOGIN_LOGO_PATH);
        }

    })
}



function getLoginProp() {
    $(".textColor").removeClass('text-warning');
    $("#submitButton").removeClass('btn-warning');
    $(".news-feed").css('background-color','#fff');
    $(".leftBottomBg").removeClass('news-caption')

    getGlobalProperty(DOMAIN_UUID, function (status, data) {
        if (status) {
            var resultData = JSON.parse(data.data);
            $(".loginLogo").attr('src', API_BASE_PATH + '/files/public/download/' + resultData.logoid);

            $(".loginCustom").html(resultData.customHtml);

            $(".textColor").css('color',resultData.textColor +'!important')
            $("#submitButton").css({
                'background-color': resultData.buttonColor,
                'border-color': resultData.buttonColor,
                'color' : '#fff'
            });
            $(".titleName").html(resultData.titleName)
            $(".sloganText").html(resultData.sloganText)

            $(document).prop('title', resultData.titleName);

            var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = API_BASE_PATH + '/files/public/download/' + resultData.logoid;
            document.getElementsByTagName('head')[0].appendChild(link);


            $(".news-feed").css('background-color', resultData.leftBg);
            $(".leftBottomBg").css('background-color', resultData.leftBottomBg);

        } else {
            $(".loginLogo").attr('src', DEFAULT_LOGIN_LOGO_PATH);
            $(".poweredBy").html('Powered by Boodskap Inc.,');
            $(".textColor").addClass('text-warning');
            $("#submitButton").addClass('btn-warning');
            $(".leftBottomBg").addClass('news-caption');
            $(".news-feed").css('background-color',DEFAULT_LOGIN_THEME.leftBg);

        }

    });

}
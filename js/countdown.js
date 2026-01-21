(function ($) {
    function padNumber(number, size) {
        var s = String(number);
        while (s.length < size) s = "0" + s;
        return s;
    }

    function formatNumber(format, number) {
        return format.replace(/^(.*?)(\d*)%d(.*?)$/g, function (_, start, padding, end) {
            padding = parseInt(padding || 0, 10);
            return (padding === 0 && number === 0) ? '' : start + padNumber(number, padding) + end;
        }).replace(/\((.*?)\)/g, number !== 1 ? "$1" : "");
    }

    function updateCountdown($countdown, format) {
        var endDate = new Date($countdown.attr('data-end-date')).getTime();
        var now = new Date().getTime();
        var timeRemaining = Math.max(0, Math.floor((endDate - now) / 1000));

        if (timeRemaining <= 0) {
            $countdown.hide().siblings('.after-end').show();
            return;
        }

        var days = Math.floor(timeRemaining / 86400);
        timeRemaining %= 86400;

        var hours = Math.floor(timeRemaining / 3600);
        timeRemaining %= 3600;

        var minutes = Math.floor(timeRemaining / 60);
        var seconds = timeRemaining % 60;

        $countdown.find('.days').html(formatNumber(format.days, days));
        $countdown.find('.hours').html(formatNumber(format.hours, hours));
        $countdown.find('.minutes').html(formatNumber(format.minutes, minutes));
        $countdown.find('.seconds').html(formatNumber(format.seconds, seconds));
    }

    function countdownInit() {
        $('.countdown').each(function () {
            var $countdown = $(this);
            var format = {
                days: $countdown.find('.days').html() || '2%d',
                hours: $countdown.find('.hours').html() || '2%d',
                minutes: $countdown.find('.minutes').html() || '2%d',
                seconds: $countdown.find('.seconds').html() || '2%d'
            };

            $countdown.siblings('.after-end').hide();
            updateCountdown($countdown, format);
            setInterval(updateCountdown, 1000, $countdown, format);
        });
    }

    $(document).ready(countdownInit);
})(jQuery);

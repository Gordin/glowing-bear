var weechat = angular.module('weechat');

weechat.filter('toArray', function () {
    'use strict';

    return function (obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).map(function (key) {
            return Object.defineProperty(obj[key], '$key', { value: key });
        });
    };
});

weechat.filter('irclinky', ['$filter', function($filter) {
    'use strict';
    return function(text, target) {
        if (!text) {
            return text;
        }

        var linkiedText = $filter('linky')(text, target);

        // This regex in no way matches all IRC channel names (they could begin with a +, an &, or an exclamation
        // mark followed by 5 alphanumeric characters, and are bounded in length by 50).
        // However, it matches all *common* IRC channels while trying to minimise false positives. "#1" is much
        // more likely to be "number 1" than "IRC channel #1".
        // Thus, we only match channels beginning with a # and having at least one letter in them.
        var channelRegex = /(^|[\s,.:;?!"'()+@-])(#+[a-z0-9-_]*[a-z][a-z0-9-_]*)/gmi;
        // This is SUPER nasty, but ng-click does not work inside a filter, as the markup has to be $compiled first, which is not possible in filter afaik.
        // Therefore, get the scope, fire the method, and $apply. Yuck. I sincerely hope someone finds a better way of doing this.
        linkiedText = linkiedText.replace(channelRegex, '$1<a href="#" onclick="var $scope = angular.element(event.target).scope(); $scope.openBuffer(\'$2\'); $scope.$apply();">$2</a>');
        return linkiedText;
    };
}]);

weechat.filter('inlinecolour', ['$sce', function($sce) {
    'use strict';

    return function(text) {
        if (!text) {
            return text;
        }

        // only match 6-digit colour codes, 3-digit ones have too many false positives (issue numbers, etc)
        var hexColourRegex = /(^|[^&])\#([0-9a-f]{6})($|[^\w'"])/gmi;
        var substitute = '$1#$2 <div class="colourbox" style="background-color:#$2"></div> $3';

        return $sce.trustAsHtml(text.replace(hexColourRegex, substitute));
    };
}]);

weechat.filter('channelChar', function () {
    'use strict';

    return function (channel) {
        var match = channel.match(/^([#&+!~]).*/);
        if (!match) {
            return '';
        }
        return match[1];
    };
});

weechat.filter('trimmedName', function () {
    'use strict';

    return function (buffer) {
        if (buffer.shortName !== "") {
            return buffer.shortName.replace(/^[#&+!~](.*)/, '$1');
        } else {
            return buffer.fullName;
        }

    };
});

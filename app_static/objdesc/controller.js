/*jslint browser: true, regexp: true, nomen: true */
/*global jQuery, $, angular, _ */

angular.module('objDescApp', ['ui.router', 'ui.bootstrap']);

angular.module('objDescApp').config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    'use strict';
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('main', {
            url: '/',
            views: {
                body: {
                    templateUrl: 'noobject.html'
                }
            }
        })
        .state('object', {
            url: '/{name}',
            views: {
                body: {
                    controller: 'ObjectDetailCtrl',
                    templateUrl: 'main.html'
                }
            }
        });
}]);

angular.module('objDescApp').controller('ObjectDetailCtrl', ['$scope', '$stateParams', '$http', function ($scope, $stateParams, $http) {
    'use strict';
    $scope.loading = true;
    $scope.isDescriptionCollapsed = true;
    $scope.isFieldsCollapsed = false;
    $scope.isChildrenCollapsed = false;

    $scope.property_list = [
        [
            'activateable',
            'createable',
            'custom',
            'customSetting',
            'deletable',
            'deprecatedAndHidden'
        ], [
            'feedEnabled',
            'layoutable',
            'mergeable',
            'queryable',
            'replicateable',
            'searchLayoutable'
        ], [
            'searchable',
            'triggerable',
            'undeletable',
            'updateable'
        ]
    ];

    $http.get('/api/describe/objects/' + $stateParams.name).then(function (res) {
        $scope.object = res.data;
        $scope.fieldsPredicate = '';
        $scope.relationshipsPredicate = '';
        $scope.labelStyle = 'fa-sort';
        $scope.nameStyle = 'fa-sort';
        $scope.typeStyle = 'fa-sort';
        $scope.descStyle = 'fa-sort';
        $scope.childSObjectStyle = 'fa-sort';
        $scope.rnameStyle = 'fa-sort';
        $scope.fieldStyle = 'fa-sort';
        $scope.loading = false;
    });
}]);

function getNamespace(name) {
    'use strict';

    var name_parts = name.replace(/__c$/, '').replace(/__Tag$/, '').replace(/__History$/).replace(/__Share$/).split('__');

    if (name_parts.length === 2) {
        return name_parts[0];
    }

    return undefined;
}

angular.module('objDescApp').controller('ObjectListCtrl', ['$scope', '$http', function ($scope, $http) {
    'use strict';
    $scope.loading = true;

    $http.get('/api/describe/objects/').then(function (res) {
        $scope.objects = res.data.sobjects;
        $scope.namespaces = [];

        _.forEach($scope.objects, function (object) {
            var namespace = getNamespace(object.name);

            if (namespace) {
                $scope.namespaces.push(namespace);
            }
        });

        $scope.namespaces = _.sortedUniq($scope.namespaces);
        $scope.namespace = 'all';

        $scope.loading = false;
    });
}]);

function filterName(objects, filter) {
    'use strict';

    var result = [];

    _.forEach(objects, function (object) {
        if (!_.endsWith(object.name.toLowerCase(), filter.toLowerCase())) {
            result.push(object);
        }
    });

    return result;
}

angular.module('objDescApp').filter('removeTags', function () {
    'use strict';

    return function (objects, includeTags) {
        if (includeTags) {
            return objects;
        }

        return filterName(objects, '__tag');
    };
});

angular.module('objDescApp').filter('removeShares', function () {
    'use strict';

    return function (objects, includeShares) {
        if (includeShares) {
            return objects;
        }

        return filterName(objects, '__share');
    };
});

angular.module('objDescApp').filter('removeHistory', function () {
    'use strict';

    return function (objects, includeHistory) {
        if (includeHistory) {
            return objects;
        }

        return filterName(filterName(objects, '__history'), 'History');
    };
});

angular.module('objDescApp').filter('filterNamespace', function () {
    'use strict';

    return function (objects, namespace) {
        if (!namespace || namespace === 'all') {
            return objects;
        }

        var results = [];

        _.forEach(objects, function (object) {
            if (namespace === 'none') {
                if (getNamespace(object.name) === undefined) {
                    results.push(object);
                }
            } else if (_.startsWith(object.name.toLowerCase(), namespace.toLowerCase() + '__')) {
                results.push(object);
            }
        });

        return results;
    };
});

function toggleAdvancedSearch() {
    'use strict';

    $('#advancedSearch').collapse('toggle');
}
(function() {
  var app;

  app = angular.module("mdModal", ['ngMaterial']);

  app.provider("mdModalDefaults", function () {
    return {
      options: {},
      $get: function () {
        return this.options;
      },
      set: function (keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('mdDraggableModal', [
    'mdModalDefaults', 
    '$sce', 
    '$mdDialog',
    '$timeout',
    '$window',
    function (mdModalDefaults, $sce, $mdDialog, $timeout, $window) {
        
        return {
            compile: function (elm, attrs, trans) {
                return function (scope, element, attrs) {                    
                    var setupStyle, hideModal, obj, elm = element.parent();

                    setupStyle = function () {
                        scope.dialogStyle = {};
                        if (attrs.width) {
                        scope.dialogStyle['width'] = attrs.width;
                        }
                        if (attrs.height) {
                            return scope.dialogStyle['height'] = attrs.height;
                        }
                    };
                    
                    scope.collapse = function () {
                        elm.addClass("collapsed");
                        scope.collapsed = true;
                    };
                    
                    scope.expand = function () {
                        elm.removeClass("collapsed");
                        scope.collapsed = false;
                    };

                    scope.close = function () {
                        if (typeof mdModalDefaults.onClose == "function") mdModalDefaults.onClose();
                        
                        $mdDialog.cancel();
                    };
                    
                    obj = {
                        id : null,
                        content : '',
                        group : null,
                        opts: {}
                    };
                    
                    scope.placeholder = false;
                    
                    obj.content = elm.html();

                    if(angular.isDefined(attrs.id))
                        obj.id = attrs.id;

                    if(angular.isDefined(attrs.group)) {
                        obj.group = attrs.group;
                        scope.options.stack = '.' + obj.group;
                    }

                    // draggable event handlers
                    var evts = {
                        start: function (evt, ui) {
                          if(scope.placeholder) // ui.helper is jQuery object
                            ui.helper.wrap('<div class="dragging"></div>');

                          scope.$apply(function () { // emit event in angular context
                            scope.$emit('draggable.started',{obj: obj});
                          }); // end $apply
                        }, // end start

                        drag: function (evt) {
                          scope.$apply(function () { // emit event in angular context
                            scope.$emit('draggable.dragging');
                          }); // end $apply
                        }, // end drag

                        stop: function (evt, ui) {
                          if(scope.placeholder)
                            ui.helper.unwrap();

                          scope.$apply(function () { // emit event in angular context
                            scope.$emit('draggable.stopped');
                          }); // end $apply
                        } // end stop
                    }; // end evts

                    // combine options and events
                    //elm.draggable(angular.extend({}, scope.options, evts)); // make element draggable
                    
                    $window.resizingDialogue = 0;

                    $window.resizeDialogue = function (event) {
                        var doc = angular.element('html'),
                            dlgBackground = (angular.element('md-backdrop._md-dialog-backdrop')[0])?
                                angular.element('md-backdrop._md-dialog-backdrop') : 
                                angular.element('md-backdrop.md-dialog-backdrop') ,
                            dlgContainer = angular.element('.md-dialog-container');
                        
                        console.log( "Resizing Dialogue: "+ (event.action? event.action : event.type) );
                        
                        doc.css({
                            "overflow-y": "hidden"
                        });

                        if (typeof dlgBackground.fadeOut === 'function') dlgBackground.fadeOut();
                        else dlgBackground.remove();

                        dlgContainer.css({
                            "height": "100%"
                        });

                        return true;
                    };

                    $window.addEventListener('resize', function (evt) {
                        clearTimeout($window.resizingDialogue);
                        $window.resizingDialogue = setTimeout($window.resizeDialogue, 733, evt);
                        return this;
                    });
                    
                    for (var r=0; (r*33)<2333; r++) {
                        setTimeout($window.resizeDialogue, r*33, { action: "mdModal.loading", target: $window, type: 'resize' });
                    }

                    return setupStyle();
                };
            },
        restrict: 'E',
        scope: {
          id: '=',
          dialogTitle: '@',
          group: '=',
          options: '=',
          show: '=',
          obj: '=',
          onClose: '&?'
        },
        replace: true,
        transclude: true,
        template: '\
<form ng-cloak onsubmit="function (event) { event.preventDefaults(); return false;}">\
    <md-toolbar>\
      <div class="md-toolbar-tools" ng-style="dialogStyle">\
        <h2 class="md-modal-title" ng-show="dialogTitle && dialogTitle.length" ng-bind="dialogTitle"></h2>\
        <span flex></span>\
        <md-button class="md-icon-button md-modal-max" \
                type="button" ng-transclude="" \
                aria-label="Expand Modal Dialog" \
                ng-click="expand()" \
                ng-show="collapsed">\
            <md-icon md-font-icon="material-icons" class="ng-scope md-mxTheme-theme md-font material-icons" aria-label="Expand">expand_less</md-icon>\
        </md-button>\
        <md-button class="md-icon-button md-modal-min" \
                type="button" ng-transclude="" \
                aria-label="Collapse Modal Dialog" \
                ng-click="collapse()" \
                ng-hide="collapsed">\
            <md-icon md-font-icon="material-icons" class="ng-scope md-mxTheme-theme md-font material-icons" aria-label="Collapse">expand_more</md-icon>\
        </md-button>\
        <md-button class="md-icon-button md-modal-close" \
                type="button" ng-transclude="" \
                aria-label="Close Modal Dialog" \
                ng-click="close()">\
            <md-icon md-font-icon="material-icons" class="ng-scope md-mxTheme-theme md-font material-icons" aria-label="Close dialog">clear</md-icon>\
        </md-button>\
      </div>\
    </md-toolbar>\
    <div class="md-dialog-content md-modal-dialog-content" ng-transclude></div>\
</form>\
'
      };
    }
  ]);

}).call(this);

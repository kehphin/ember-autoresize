import Ember from "ember";
import AutoResize from "../mixins/autoresize";

var get = Ember.get;
var isNone = Ember.isNone;
const scheduleOnce = Ember.run.scheduleOnce;
const observer = Ember.observer;
const on = Ember.on;

/**
  @namespace Ember
  @class TextArea
 */
Ember.TextArea.reopen(AutoResize, /** @scope Ember.TextArea.prototype */{

  /**
    By default, textareas only resize
    their height.

    @property shouldResizeHeight
    @type Boolean
   */
  shouldResizeHeight: true,

  /**
    Whitespace should be treated as significant
    for text areas.

    @property significantWhitespace
    @default true
    @type Boolean
   */
  significantWhitespace: true,

  /**
    Optimistically resize the height
    of the textarea so when users reach
    the end of a line, they will be
    presented with space to begin typing.

    @property autoResizeText
    @type String
   */
  autoResizeText: Ember.computed('value', {
    get() {
      var value = get(this, 'value');
      if (isNone(value)) {
        value = '';
      }
      return value + '@';
    }
  }),
  
  /**
    Alter the `dimensions` property of the
    view to conform to the measured size of
    the view.

    @method measuredSizeDidChange
   */
  measuredSizeDidChange: on('didInsertElement', observer('measuredSize', function () {
    let size = get(this, 'measuredSize');
    if (size == null) { return; }

    let { maxWidth, maxHeight } = size;
    let layoutDidChange = false;
    let dimensions = {};

    if (get(this, 'shouldResizeWidth')) {
      // Account for off-by-one error in FireFox
      // (specifically, input elements have 1px
      //  of scroll when this isn't applied)
      // TODO: sniff for this bug and fix it!
      size.width += 1;

      if (maxWidth != null &&
          size.width > maxWidth) {
        dimensions.width = maxWidth;
      } else {
        dimensions.width = size.width;
      }
      layoutDidChange = true;
    }

    if (get(this, 'shouldResizeHeight')) {
      if (size.height !== dimensions.height) {
        if (maxHeight != null &&
            size.height > maxHeight) {
          dimensions.height = maxHeight;
        } else {
          dimensions.height = size.height;
        }
        layoutDidChange = true;
      }
    }

    set(this, 'dimensions', dimensions);

    if (layoutDidChange) {
      scheduleOnce('render', this, 'dimensionsDidChange');
    }
  })),

  /**
    Retiles the view at the end of the render queue.
    @method dimensionsDidChange
   */
  dimensionsDidChange() {
    var dimensions = get(this, 'dimensions');
    var styles = {};

    for (let key in dimensions) {
      if (!dimensions.hasOwnProperty(key)) { continue; }
      styles[key] = dimensions[key] + 'px';
    }

    if (get(this, 'maxHeight') == null) {
      styles.overflow = 'hidden';
    }

    var $element = this.$();
    if ($element) {
      $element.css(styles);
    }
    
    this.sendAction('on-resize');
  }

});

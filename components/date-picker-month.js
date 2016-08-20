define('ember-date-components/components/date-picker-month', ['exports', 'ember', '../templates/components/date-picker-month'], function (exports, _ember, _datePickerMonth) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ember2 = _interopRequireDefault(_ember);

  var _datePickerMonth2 = _interopRequireDefault(_datePickerMonth);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var get = _ember2.default.get;
  var set = _ember2.default.set;
  var computed = _ember2.default.computed;
  var getProperties = _ember2.default.getProperties;
  exports.default = _ember2.default.Component.extend({
    layout: _datePickerMonth2.default,
    classNames: ['date-picker__calendar__outer'],

    // ATTRIBUTES BEGIN ----------------------------------------

    /**
     * The selected dates for the date picker.
     * This has to be an array with 0-2 elements. If it has 2 elements, it will show the range between the two.
     *
     * @attributes selectedDates
     * @type {Date[]}
     * @optional
     * @public
     */
    selectedDates: [],

    /**
     * The month that should be shown.
     * If this is not set, it will default to the current month.
     *
     * @attribute month
     * @type {Date}
     * @optional
     * @public
     */
    month: null,

    /**
     * An optional minimum date.
     * No dates before this date will be selectable.
     *
     * @attribute minDate
     * @type {Date}
     * @optional
     * @public
     */
    minDate: null,

    /**
     * An optional maximum date.
     * No dates after this date will be selectable.
     *
     * @attribute maxDate
     * @type {Date}
     * @optional
     * @public
     */
    maxDate: null,

    /**
     * If weekdays (Mo, Tu, ...) should be shown in the calendar.
     *
     * @attribute showWeekdays
     * @type {Boolean}
     * @default true
     * @public
     */
    showWeekdays: true,

    /**
     * This action will receive the selected date as parameter.
     * It is called when a date is clicked.
     *
     * @event selectDate
     * @param {Date} date The selected date
     * @public
     */
    selectDate: null,

    // ATTRIBUTES END ----------------------------------------

    // PROPERTIES BEGIN ----------------------------------------

    /**
     * Internally, the minDate is copied, set to startOf('day') and saved here to save unnecessary processing.
     *
     * @property _minDate
     * @type {Date}
     * @private
     */
    _minDate: null,

    /**
     * Internally, the maxDate is copied, set to startOf('day') and saved here to save unnecessary processing.
     *
     * @property _maxDate
     * @type {Date}
     * @private
     */
    _maxDate: null,

    /**
     * This takes the given month and converts it to the beginning of the Date object.
     * If no month is given, it will default to the current month.
     *
     * @property currentMonth
     * @type {Date}
     * @private
     */
    currentMonth: computed('month', function () {
      var date = get(this, 'month');
      var now = new Date();
      if (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      }
      //getFullYear 2016;
      //getMonth 0 - 11
      //getDate 1 - 31

      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      //return date ? date.clone().startOf('month') : moment().startOf('month');
    }),

    /**
     * The currently displayed days in the calendar.
     * This will contain all the days of the current month,
     * prepended with days to fill a started week in the beginning of the month,
     * appended with days to fill a started week in the end of the month.
     * This means that the array length will always be divisible by 7.
     * The generated objects contain the reference to the used date, as well as various other pieces of information:
     *
     * ```js
     * {
     *    date: day,
     *    dateString: day.format('YYYY-MM-DD'),
     *    year: day.year(),
     *    month: day.month(),
     *    day: day.date(),
     *    weekday: day.isoWeekday(),
     *    disabled: this._dayIsDisabled(day),
     *    notInCurrentMonth: true
     * }
     * ```
     *
     * @property _daysInMonth
     * @type {Object[]}
     * @readOnly
     * @private
     */
    _daysInMonth: computed('currentMonth', function () {
      var currentMonth = new Date(get(this, 'currentMonth').getTime());
      var daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(); //currentMonth.daysInMonth();

      var days = _ember2.default.A();

      // start with days from previous month to fill up first week
      var firstWeekday = currentMonth.getDay();
      for (var i = firstWeekday; i > 1; i--) {
        days.push(null);
      }

      var fisrtDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      var oneDay = 1000 * 60 * 60 * 24;
      // create one day object for every day in the month
      for (var _i = 0; _i < daysInMonth; _i++) {
        var day = new Date(fisrtDayOfMonth.getTime());
        var dayObject = {
          date: day,
          dateString: [day.getFullYear(), this.pad(day.getMonth() + 1), this.pad(day.getDate())].join('/'),
          year: day.getFullYear(),
          month: this.pad(day.getMonth() + 1),
          day: this.pad(day.getDate()),
          weekday: day.getDay() + 1
        };
        day = new Date(day.getTime() + oneDay);
        days.push(dayObject);
      }

      // end with days from next month to fill up last week
      var lastWeekday = daysInMonth.getDay(); //currentMonth.clone().endOf('month').isoWeekday();
      for (var _i2 = 1; _i2 <= 7 - lastWeekday; _i2++) {
        days.push(null);
      }

      return days;
    }),

    /**
     * This takes the generated _daysInMonth and parses the days.
     * It will set disabled and inRange accordingly for all days.
     * Note that for performance reasons, this will mutate the original array instead of creating a new one.
     *
     * @property daysInMonth
     * @type {Object[]}
     * @readOnly
     * @private
     */
    daysInMonth: computed('_daysInMonth', '_minDate', '_maxDate', 'selectedDates.[]', function () {
      var _this = this;

      var days = get(this, '_daysInMonth');

      days.forEach(function (day) {
        if (!day) {
          return;
        }
        set(day, 'disabled', _this._dayIsDisabled(day.date));
        set(day, 'inRange', _this._dayIsInRange(day.date));
        set(day, 'isSelected', _this._dayIsSelected(day.date));
        set(day, 'isToday', _this._dayIsToday(day.date));
      });

      return days;
    }),

    datePickerDayClasses: function datePickerDayClasses(day) {
      var baseClass = 'date-picker__day'; //get(this, 'baseDayClass')
      var isTodayClass = day.isToday ? ' ' + baseClass + '--today' : '';
      var isSelectedClass = day.isSelected ? ' ' + baseClass + '--selected' : '';
      var isDisabledClass = day.isDisabled ? ' ' + baseClass + '--disabled' : '';
      var isInRangeClass = day.isInRange ? ' ' + baseClass + '--in-range' : '';

      return '' + baseClass + isTodayClass + isSelectedClass + isDisabledClass + isInRangeClass;
    },

    /**
     * The localized weekdays, starting with monday.
     *
     * @property weekdays
     * @type {String[]}
     * @readOnly
     * @private
     */
    weekdays: computed(function () {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }),

    /**
     * The current day.
     *
     * @property today
     * @type {Date}
     * @readOnly
     * @private
     */
    today: computed(function () {
      var now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()); //moment().startOf('day');
    }),

    didReceiveAttrs: function didReceiveAttrs() {
      var minDate = get(this, 'minDate');
      var maxDate = get(this, 'maxDate');

      set(this, '_minDate', minDate ? new Date(minDate + ' 00:00:00') : null);
      set(this, '_maxDate', maxDate ? new Date(maxDate + ' 00:00:00') : null);
    },
    _dayIsDisabled: function _dayIsDisabled(day) {
      var _getProperties = getProperties(this, '_minDate', '_maxDate');

      var _minDate = _getProperties._minDate;
      var _maxDate = _getProperties._maxDate;


      if (_minDate && _minDate.getTime() > day.getTime()) {
        return true;
      }
      return _maxDate && _maxDate.getTime() < day.getTime();
    },
    _dayIsInRange: function _dayIsInRange(day) {
      var selectedDates = get(this, 'selectedDates');

      if (!selectedDates || !selectedDates.length || selectedDates.length < 2) {
        return false;
      }

      var selectedDateVal = selectedDates[0].getTime(); //clone().startOf('day').valueOf();
      var selectedUntilVal = selectedDates[1].getTime(); //clone().startOf('day').valueOf();
      var dayVal = day.getTime();

      if (selectedDateVal > selectedUntilVal) {
        return dayVal > selectedUntilVal && dayVal < selectedDateVal;
      } else {
        return dayVal < selectedUntilVal && dayVal > selectedDateVal;
      }
    },
    _dayIsToday: function _dayIsToday(date) {
      var today = get(this, 'today');
      if (date.getTime() === today.getTime()) return true;
      return false;
    },
    _dayIsSelected: function _dayIsSelected(date) {
      var selectedDates = get(this, 'selectedDates');
      for (var i = 0; i < selectedDates.length; i++) {
        if (selectedDates[i].getTime() == date.getTime()) return true;
      }
      return false;
    },
    pad: function pad(val) {
      if ((val + '').length < 2) return '0' + val;
      return '' + val;
    },


    actions: {
      selectDate: function selectDate(date) {
        var action = get(this, 'attrs.selectDate');
        if (action) {
          action(date);
        }
      }
    }
  });
});
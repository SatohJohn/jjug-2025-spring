"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _React = React;
var useState = _React.useState;
var useRef = _React.useRef;

function App() {
  var _useState = useState("");

  var _useState2 = _slicedToArray(_useState, 2);

  var input = _useState2[0];
  var setInput = _useState2[1];

  var _useState3 = useState([]);

  var _useState32 = _slicedToArray(_useState3, 2);

  var messages = _useState32[0];
  var setMessages = _useState32[1];

  var _useState4 = useState(false);

  var _useState42 = _slicedToArray(_useState4, 2);

  var loading = _useState42[0];
  var setLoading = _useState42[1];

  var eventSourceRef = useRef(null);

  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    setMessages([]);
    setLoading(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    // fetchでSSEを受信
    var eventSource = new EventSourcePolyfill("/message", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Accept": "text/event-stream"
      },
      body: input
    });
    eventSourceRef.current = eventSource;
    eventSource.onmessage = function (event) {
      setMessages(function (prev) {
        return [].concat(_toConsumableArray(prev), [event.data]);
      });
    };
    eventSource.onerror = function () {
      setLoading(false);
      eventSource.close();
    };
    eventSource.onopen = function () {
      setLoading(false);
    };
  };

  return React.createElement(
    "div",
    { style: { maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" } },
    React.createElement(
      "h1",
      null,
      "Gemini AI チャット"
    ),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, style: { display: "flex", gap: 8 } },
      React.createElement("input", {
        type: "text",
        value: input,
        onChange: function (e) {
          return setInput(e.target.value);
        },
        placeholder: "メッセージを入力...",
        style: { flex: 1, padding: 8 },
        disabled: loading
      }),
      React.createElement(
        "button",
        { type: "submit", disabled: loading || !input.trim() },
        "送信"
      )
    ),
    React.createElement(
      "div",
      { style: { marginTop: 24 } },
      React.createElement(
        "h2",
        null,
        "AIの返答"
      ),
      React.createElement(
        "div",
        { style: { whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 16, borderRadius: 8, minHeight: 80 } },
        messages.length === 0 && !loading && React.createElement(
          "span",
          { style: { color: '#aaa' } },
          "ここにAIの返答が表示されます"
        ),
        messages.map(function (msg, i) {
          return React.createElement(
            "div",
            { key: i },
            msg
          );
        })
      ),
      loading && React.createElement(
        "div",
        { style: { color: '#888', marginTop: 8 } },
        "受信中..."
      )
    )
  );
}

// EventSourcePolyfill: fetch+SSE対応

var EventSourcePolyfill = (function () {
  function EventSourcePolyfill(url, options) {
    _classCallCheck(this, EventSourcePolyfill);

    this.url = url;
    this.options = options;
    this.controller = new AbortController();
    this.onmessage = null;
    this.onerror = null;
    this.onopen = null;
    this._connect();
  }

  _createClass(EventSourcePolyfill, [{
    key: "_connect",
    value: function _connect() {
      var _this = this;

      fetch(this.url, _extends({}, this.options, {
        signal: this.controller.signal
      })).then(function callee$2$0(res) {
        var reader, buffer, _ref, done, value, lines, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, data;

        return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              if (this.onopen) this.onopen();
              reader = res.body.getReader();
              buffer = "";

            case 3:
              if (!true) {
                context$3$0.next = 35;
                break;
              }

              context$3$0.next = 6;
              return regeneratorRuntime.awrap(reader.read());

            case 6:
              _ref = context$3$0.sent;
              done = _ref.done;
              value = _ref.value;

              if (!done) {
                context$3$0.next = 11;
                break;
              }

              return context$3$0.abrupt("break", 35);

            case 11:
              buffer += new TextDecoder().decode(value);
              lines = buffer.split("\n");

              buffer = lines.pop();
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              context$3$0.prev = 17;
              for (_iterator = lines[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                line = _step.value;

                if (line.startsWith("data:")) {
                  data = line.replace(/^data:/, "").trim();

                  if (this.onmessage) this.onmessage({ data: data });
                }
              }
              context$3$0.next = 25;
              break;

            case 21:
              context$3$0.prev = 21;
              context$3$0.t0 = context$3$0["catch"](17);
              _didIteratorError = true;
              _iteratorError = context$3$0.t0;

            case 25:
              context$3$0.prev = 25;
              context$3$0.prev = 26;

              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }

            case 28:
              context$3$0.prev = 28;

              if (!_didIteratorError) {
                context$3$0.next = 31;
                break;
              }

              throw _iteratorError;

            case 31:
              return context$3$0.finish(28);

            case 32:
              return context$3$0.finish(25);

            case 33:
              context$3$0.next = 3;
              break;

            case 35:
            case "end":
              return context$3$0.stop();
          }
        }, null, _this, [[17, 21, 25, 33], [26,, 28, 32]]);
      })["catch"](function () {
        if (_this.onerror) _this.onerror();
      });
    }
  }, {
    key: "close",
    value: function close() {
      this.controller.abort();
    }
  }]);

  return EventSourcePolyfill;
})();

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));

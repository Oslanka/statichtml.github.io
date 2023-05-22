(function () {
  if (typeof window.ms_data_ring != "undefined") return;
  var rooterBefore = "";
  var uploadActionHolder = undefined;
  var e = "v1.0.0",
    ms_data_ring = (function (s, o) {
      var u;
      (function () {
        u = !0;
        try {
          var e = location.protocol.toLowerCase();
          if (e == "http:" || e == "https:") u = !1;
        } catch (t) {}
      })();
      var a = document,
        f = navigator,
        l = s.screen,
        c = u ? "" : document.domain.toLowerCase(),
        h = f.userAgent.toLowerCase(),
        w = {},
        E = {},
        S = { trackUrl: null, clickUrl: null, areaIds: null, hbLogTimer: 0 },
        changeRouter = function (type, before, current) {
          console.log(
            "ms_data_ring====================================",
            type,
            before,
            current
          );
          rooterBefore = current;
          uploadAction("changeRouter", { before: before, current: current });
        },
        uploadAction = function (type, json) {
          console.log("ms_data_ring 模拟上传", type, json);
          if (uploadActionHolder) {
            uploadActionHolder(type, json);
          }
        };
      return {
        version: e,
        util: w,
        data: E,
        config: S,
        init: function () {
          document.addEventListener("keydown", function (event) {
            // 在这里处理键盘按键事件
            // console.log("test---------ms_data_ring按下的键：", event.key);
            // uploadAction();
          });
          document.addEventListener("mousedown", function (event) {
            // 在这里处理键盘按键事件
            let element = event.target;
            uploadAction("mousedown", { data: element.outerHTML });
          });

          window.addEventListener("hashchange", function (event) {
            changeRouter(
              "hashchange",
              rooterBefore,
              window.location.href,
              event
            );
          });
          window.onpopstate = function (event) {
            changeRouter("popstate", rooterBefore, window.location.href, event);
          };

          class Dep {
            // 订阅池
            constructor(name) {
              this.id = new Date(); //这里简单的运用时间戳做订阅池的ID
              this.subs = []; //该事件下被订阅对象的集合
            }
            defined() {
              // 添加订阅者
              Dep.watch.add(this);
            }
            notify() {
              //通知订阅者有变化
              this.subs.forEach((e, i) => {
                if (typeof e.update === "function") {
                  try {
                    e.update.apply(e); //触发订阅者更新函数
                  } catch (err) {
                    console.warr(err);
                  }
                }
              });
            }
          }
          Dep.watch = null;

          class Watch {
            constructor(name, fn) {
              this.name = name; //订阅消息的名称
              this.id = new Date(); //这里简单的运用时间戳做订阅者的ID
              this.callBack = fn; //订阅消息发送改变时->订阅者执行的回调函数
            }
            add(dep) {
              //将订阅者放入dep订阅池
              dep.subs.push(this);
            }
            update() {
              //将订阅者更新方法
              var cb = this.callBack; //赋值为了不改变函数内调用的this
              cb(this.name);
            }
          }
          var addHistoryMethod = (function () {
            var historyDep = new Dep();
            return function (name) {
              if (name === "historychange") {
                return function (name, fn) {
                  var event = new Watch(name, fn);
                  Dep.watch = event;
                  historyDep.defined();
                  Dep.watch = null; //置空供下一个订阅者使用
                };
              } else if (name === "pushState" || name === "replaceState") {
                var method = history[name];
                return function () {
                  method.apply(history, arguments);
                  historyDep.notify();
                };
              }
            };
          })();
          window.addHistoryListener = addHistoryMethod("historychange");
          history.pushState = addHistoryMethod("pushState");
          history.replaceState = addHistoryMethod("replaceState");
          window.addHistoryListener("history", function () {
            changeRouter("history", rooterBefore, window.location.href);
          });
          changeRouter("init", rooterBefore, window.location.href);
        },
        setUploadListener(uploader) {
          uploadActionHolder = uploader;
        },
      };
    })(window);
  ms_data_ring.init();
  (window.msSDK = ms_data_ring),
    typeof window.msSDK == "undefined" &&
      (window.msSDK = ms_data_ring);

  window.msSDK = ms_data_ring;
})();

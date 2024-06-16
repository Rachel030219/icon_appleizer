let buildArgsList;

// `modulePromise` is a promise to the `WebAssembly.module` object to be
//   instantiated.
// `importObjectPromise` is a promise to an object that contains any additional
//   imports needed by the module that aren't provided by the standard runtime.
//   The fields on this object will be merged into the importObject with which
//   the module will be instantiated.
// This function returns a promise to the instantiated module.
export const instantiate = async (modulePromise, importObjectPromise) => {
    let dartInstance;

    function stringFromDartString(string) {
        const totalLength = dartInstance.exports.$stringLength(string);
        let result = '';
        let index = 0;
        while (index < totalLength) {
          let chunkLength = Math.min(totalLength - index, 0xFFFF);
          const array = new Array(chunkLength);
          for (let i = 0; i < chunkLength; i++) {
              array[i] = dartInstance.exports.$stringRead(string, index++);
          }
          result += String.fromCharCode(...array);
        }
        return result;
    }

    function stringToDartString(string) {
        const length = string.length;
        let range = 0;
        for (let i = 0; i < length; i++) {
            range |= string.codePointAt(i);
        }
        if (range < 256) {
            const dartString = dartInstance.exports.$stringAllocate1(length);
            for (let i = 0; i < length; i++) {
                dartInstance.exports.$stringWrite1(dartString, i, string.codePointAt(i));
            }
            return dartString;
        } else {
            const dartString = dartInstance.exports.$stringAllocate2(length);
            for (let i = 0; i < length; i++) {
                dartInstance.exports.$stringWrite2(dartString, i, string.charCodeAt(i));
            }
            return dartString;
        }
    }

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
        const length = dartInstance.exports.$listLength(list);
        const array = new constructor(length);
        for (let i = 0; i < length; i++) {
            array[i] = dartInstance.exports.$listRead(list, i);
        }
        return array;
    }

    buildArgsList = function(list) {
        const dartList = dartInstance.exports.$makeStringList();
        for (let i = 0; i < list.length; i++) {
            dartInstance.exports.$listAdd(dartList, stringToDartString(list[i]));
        }
        return dartList;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
        wrapped.dartFunction = dartFunction;
        wrapped[jsWrappedDartFunctionSymbol] = true;
        return wrapped;
    }

    // Imports
    const dart2wasm = {

_1: (x0,x1,x2) => x0.set(x1,x2),
_2: (x0,x1,x2) => x0.set(x1,x2),
_3: (x0,x1) => x0.transferFromImageBitmap(x1),
_4: x0 => x0.arrayBuffer(),
_5: (x0,x1) => x0.transferFromImageBitmap(x1),
_6: f => finalizeWrapper(f,x0 => dartInstance.exports._6(f,x0)),
_7: x0 => new window.FinalizationRegistry(x0),
_8: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
_9: (x0,x1) => x0.unregister(x1),
_10: (x0,x1,x2) => x0.slice(x1,x2),
_11: (x0,x1) => x0.decode(x1),
_12: (x0,x1) => x0.segment(x1),
_13: () => new TextDecoder(),
_14: x0 => x0.buffer,
_15: x0 => x0.wasmMemory,
_16: () => globalThis.window._flutter_skwasmInstance,
_17: x0 => x0.rasterStartMilliseconds,
_18: x0 => x0.rasterEndMilliseconds,
_19: x0 => x0.imageBitmaps,
_164: x0 => x0.focus(),
_165: x0 => x0.select(),
_166: (x0,x1) => x0.append(x1),
_167: x0 => x0.remove(),
_170: x0 => x0.unlock(),
_175: x0 => x0.getReader(),
_185: x0 => new MutationObserver(x0),
_202: (x0,x1) => new OffscreenCanvas(x0,x1),
_204: (x0,x1,x2) => x0.addEventListener(x1,x2),
_205: (x0,x1,x2) => x0.removeEventListener(x1,x2),
_208: x0 => new ResizeObserver(x0),
_211: (x0,x1) => new Intl.Segmenter(x0,x1),
_212: x0 => x0.next(),
_213: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
_291: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
_292: x0 => new window.ImageDecoder(x0),
_293: x0 => x0.close(),
_294: x0 => ({frameIndex: x0}),
_295: (x0,x1) => x0.decode(x1),
_298: f => finalizeWrapper(f,x0 => dartInstance.exports._298(f,x0)),
_299: f => finalizeWrapper(f,x0 => dartInstance.exports._299(f,x0)),
_300: (x0,x1) => ({addView: x0,removeView: x1}),
_301: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._301(f,arguments.length,x0) }),
_302: f => finalizeWrapper(f,() => dartInstance.exports._302(f)),
_303: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
_304: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._304(f,arguments.length,x0) }),
_305: x0 => ({runApp: x0}),
_306: x0 => new Uint8Array(x0),
_308: x0 => x0.preventDefault(),
_309: x0 => x0.stopPropagation(),
_310: (x0,x1) => x0.addListener(x1),
_311: (x0,x1) => x0.removeListener(x1),
_312: (x0,x1) => x0.prepend(x1),
_313: x0 => x0.remove(),
_314: x0 => x0.disconnect(),
_315: (x0,x1) => x0.addListener(x1),
_316: (x0,x1) => x0.removeListener(x1),
_319: (x0,x1) => x0.append(x1),
_320: x0 => x0.remove(),
_321: x0 => x0.stopPropagation(),
_325: x0 => x0.preventDefault(),
_326: (x0,x1) => x0.append(x1),
_327: x0 => x0.remove(),
_332: (x0,x1) => x0.appendChild(x1),
_333: (x0,x1,x2) => x0.insertBefore(x1,x2),
_334: (x0,x1) => x0.removeChild(x1),
_335: (x0,x1) => x0.appendChild(x1),
_336: (x0,x1) => x0.transferFromImageBitmap(x1),
_337: (x0,x1) => x0.append(x1),
_338: (x0,x1) => x0.append(x1),
_339: (x0,x1) => x0.append(x1),
_340: x0 => x0.remove(),
_341: x0 => x0.focus(),
_342: x0 => x0.focus(),
_343: x0 => x0.remove(),
_344: x0 => x0.focus(),
_345: x0 => x0.remove(),
_346: (x0,x1) => x0.appendChild(x1),
_347: (x0,x1) => x0.append(x1),
_348: x0 => x0.focus(),
_349: (x0,x1) => x0.append(x1),
_350: x0 => x0.remove(),
_351: (x0,x1) => x0.append(x1),
_352: (x0,x1) => x0.append(x1),
_353: (x0,x1,x2) => x0.insertBefore(x1,x2),
_354: (x0,x1) => x0.append(x1),
_355: (x0,x1,x2) => x0.insertBefore(x1,x2),
_356: x0 => x0.remove(),
_357: x0 => x0.remove(),
_358: x0 => x0.remove(),
_359: (x0,x1) => x0.append(x1),
_360: x0 => x0.remove(),
_361: x0 => x0.remove(),
_362: x0 => x0.getBoundingClientRect(),
_363: x0 => x0.remove(),
_364: x0 => x0.blur(),
_366: x0 => x0.focus(),
_367: x0 => x0.focus(),
_368: x0 => x0.remove(),
_369: x0 => x0.focus(),
_370: x0 => x0.focus(),
_371: x0 => x0.blur(),
_372: x0 => x0.remove(),
_385: (x0,x1) => x0.append(x1),
_386: x0 => x0.remove(),
_387: (x0,x1) => x0.append(x1),
_388: (x0,x1,x2) => x0.insertBefore(x1,x2),
_389: (x0,x1) => x0.append(x1),
_390: x0 => x0.focus(),
_391: x0 => x0.focus(),
_392: x0 => x0.focus(),
_393: x0 => x0.focus(),
_394: x0 => x0.focus(),
_395: (x0,x1) => x0.append(x1),
_396: x0 => x0.focus(),
_397: x0 => x0.blur(),
_398: x0 => x0.remove(),
_400: x0 => x0.preventDefault(),
_401: x0 => x0.focus(),
_402: x0 => x0.preventDefault(),
_403: x0 => x0.preventDefault(),
_404: x0 => x0.preventDefault(),
_405: x0 => x0.focus(),
_406: x0 => x0.focus(),
_407: (x0,x1) => x0.append(x1),
_408: x0 => x0.focus(),
_409: x0 => x0.focus(),
_410: x0 => x0.focus(),
_411: x0 => x0.focus(),
_412: (x0,x1) => x0.observe(x1),
_413: x0 => x0.disconnect(),
_414: (x0,x1) => x0.appendChild(x1),
_415: (x0,x1) => x0.appendChild(x1),
_416: (x0,x1) => x0.appendChild(x1),
_417: (x0,x1) => x0.append(x1),
_418: (x0,x1) => x0.append(x1),
_419: x0 => x0.remove(),
_420: (x0,x1) => x0.append(x1),
_422: (x0,x1) => x0.appendChild(x1),
_423: (x0,x1) => x0.append(x1),
_424: x0 => x0.remove(),
_425: (x0,x1) => x0.append(x1),
_429: (x0,x1) => x0.appendChild(x1),
_430: x0 => x0.remove(),
_985: () => globalThis.window.flutterConfiguration,
_986: x0 => x0.assetBase,
_990: x0 => x0.debugShowSemanticsNodes,
_991: x0 => x0.hostElement,
_992: x0 => x0.multiViewEnabled,
_993: x0 => x0.nonce,
_995: x0 => x0.fontFallbackBaseUrl,
_996: x0 => x0.useColorEmoji,
_1000: x0 => x0.console,
_1001: x0 => x0.devicePixelRatio,
_1002: x0 => x0.document,
_1003: x0 => x0.history,
_1004: x0 => x0.innerHeight,
_1005: x0 => x0.innerWidth,
_1006: x0 => x0.location,
_1007: x0 => x0.navigator,
_1008: x0 => x0.visualViewport,
_1009: x0 => x0.performance,
_1010: (x0,x1) => x0.fetch(x1),
_1013: (x0,x1) => x0.dispatchEvent(x1),
_1014: (x0,x1) => x0.matchMedia(x1),
_1015: (x0,x1) => x0.getComputedStyle(x1),
_1017: x0 => x0.screen,
_1018: (x0,x1) => x0.requestAnimationFrame(x1),
_1019: f => finalizeWrapper(f,x0 => dartInstance.exports._1019(f,x0)),
_1024: (x0,x1) => x0.warn(x1),
_1027: () => globalThis.window,
_1028: () => globalThis.Intl,
_1029: () => globalThis.Symbol,
_1032: x0 => x0.clipboard,
_1033: x0 => x0.maxTouchPoints,
_1034: x0 => x0.vendor,
_1035: x0 => x0.language,
_1036: x0 => x0.platform,
_1037: x0 => x0.userAgent,
_1038: x0 => x0.languages,
_1039: x0 => x0.documentElement,
_1040: (x0,x1) => x0.querySelector(x1),
_1043: (x0,x1) => x0.createElement(x1),
_1045: (x0,x1) => x0.execCommand(x1),
_1048: (x0,x1) => x0.createTextNode(x1),
_1049: (x0,x1) => x0.createEvent(x1),
_1054: x0 => x0.head,
_1055: x0 => x0.body,
_1056: (x0,x1) => x0.title = x1,
_1059: x0 => x0.activeElement,
_1061: x0 => x0.visibilityState,
_1062: () => globalThis.document,
_1063: (x0,x1,x2) => x0.addEventListener(x1,x2),
_1064: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
_1066: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
_1067: (x0,x1,x2) => x0.removeEventListener(x1,x2),
_1070: f => finalizeWrapper(f,x0 => dartInstance.exports._1070(f,x0)),
_1071: x0 => x0.target,
_1073: x0 => x0.timeStamp,
_1074: x0 => x0.type,
_1075: x0 => x0.preventDefault(),
_1079: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
_1084: x0 => x0.firstChild,
_1090: x0 => x0.parentElement,
_1092: x0 => x0.parentNode,
_1095: (x0,x1) => x0.removeChild(x1),
_1096: (x0,x1) => x0.removeChild(x1),
_1098: (x0,x1) => x0.textContent = x1,
_1101: (x0,x1) => x0.contains(x1),
_1106: x0 => x0.firstElementChild,
_1108: x0 => x0.nextElementSibling,
_1109: x0 => x0.clientHeight,
_1110: x0 => x0.clientWidth,
_1111: x0 => x0.id,
_1112: (x0,x1) => x0.id = x1,
_1115: (x0,x1) => x0.spellcheck = x1,
_1116: x0 => x0.tagName,
_1117: x0 => x0.style,
_1118: (x0,x1) => x0.append(x1),
_1120: x0 => x0.getBoundingClientRect(),
_1123: (x0,x1) => x0.closest(x1),
_1126: (x0,x1) => x0.querySelectorAll(x1),
_1127: x0 => x0.remove(),
_1128: (x0,x1,x2) => x0.setAttribute(x1,x2),
_1129: (x0,x1) => x0.removeAttribute(x1),
_1130: (x0,x1) => x0.tabIndex = x1,
_1133: x0 => x0.scrollTop,
_1134: (x0,x1) => x0.scrollTop = x1,
_1135: x0 => x0.scrollLeft,
_1136: (x0,x1) => x0.scrollLeft = x1,
_1137: x0 => x0.classList,
_1138: (x0,x1) => x0.className = x1,
_1144: (x0,x1) => x0.getElementsByClassName(x1),
_1145: x0 => x0.click(),
_1147: (x0,x1) => x0.hasAttribute(x1),
_1149: (x0,x1) => x0.attachShadow(x1),
_1152: (x0,x1) => x0.getPropertyValue(x1),
_1154: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
_1156: (x0,x1) => x0.removeProperty(x1),
_1158: x0 => x0.offsetLeft,
_1159: x0 => x0.offsetTop,
_1160: x0 => x0.offsetParent,
_1162: (x0,x1) => x0.name = x1,
_1163: x0 => x0.content,
_1164: (x0,x1) => x0.content = x1,
_1177: (x0,x1) => x0.nonce = x1,
_1182: x0 => x0.now(),
_1184: (x0,x1) => x0.width = x1,
_1186: (x0,x1) => x0.height = x1,
_1189: (x0,x1) => x0.getContext(x1),
_1260: x0 => x0.width,
_1261: x0 => x0.height,
_1264: x0 => x0.status,
_1266: x0 => x0.body,
_1267: x0 => x0.arrayBuffer(),
_1272: x0 => x0.read(),
_1273: x0 => x0.value,
_1274: x0 => x0.done,
_1276: x0 => x0.name,
_1277: x0 => x0.x,
_1278: x0 => x0.y,
_1281: x0 => x0.top,
_1282: x0 => x0.right,
_1283: x0 => x0.bottom,
_1284: x0 => x0.left,
_1295: x0 => x0.height,
_1296: x0 => x0.width,
_1297: (x0,x1) => x0.value = x1,
_1300: (x0,x1) => x0.placeholder = x1,
_1301: (x0,x1) => x0.name = x1,
_1302: x0 => x0.selectionDirection,
_1303: x0 => x0.selectionStart,
_1304: x0 => x0.selectionEnd,
_1307: x0 => x0.value,
_1308: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
_1312: x0 => x0.readText(),
_1314: (x0,x1) => x0.writeText(x1),
_1315: x0 => x0.altKey,
_1316: x0 => x0.code,
_1317: x0 => x0.ctrlKey,
_1318: x0 => x0.key,
_1319: x0 => x0.keyCode,
_1320: x0 => x0.location,
_1321: x0 => x0.metaKey,
_1322: x0 => x0.repeat,
_1323: x0 => x0.shiftKey,
_1324: x0 => x0.isComposing,
_1325: (x0,x1) => x0.getModifierState(x1),
_1326: x0 => x0.state,
_1329: (x0,x1) => x0.go(x1),
_1330: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
_1331: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
_1332: x0 => x0.pathname,
_1333: x0 => x0.search,
_1334: x0 => x0.hash,
_1337: x0 => x0.state,
_1342: f => finalizeWrapper(f,(x0,x1) => dartInstance.exports._1342(f,x0,x1)),
_1344: (x0,x1,x2) => x0.observe(x1,x2),
_1347: x0 => x0.attributeName,
_1348: x0 => x0.type,
_1349: x0 => x0.matches,
_1352: x0 => x0.matches,
_1353: x0 => x0.relatedTarget,
_1354: x0 => x0.clientX,
_1355: x0 => x0.clientY,
_1356: x0 => x0.offsetX,
_1357: x0 => x0.offsetY,
_1360: x0 => x0.button,
_1361: x0 => x0.buttons,
_1362: x0 => x0.ctrlKey,
_1363: (x0,x1) => x0.getModifierState(x1),
_1364: x0 => x0.pointerId,
_1365: x0 => x0.pointerType,
_1366: x0 => x0.pressure,
_1367: x0 => x0.tiltX,
_1368: x0 => x0.tiltY,
_1369: x0 => x0.getCoalescedEvents(),
_1370: x0 => x0.deltaX,
_1371: x0 => x0.deltaY,
_1372: x0 => x0.wheelDeltaX,
_1373: x0 => x0.wheelDeltaY,
_1374: x0 => x0.deltaMode,
_1379: x0 => x0.changedTouches,
_1381: x0 => x0.clientX,
_1382: x0 => x0.clientY,
_1383: x0 => x0.data,
_1384: (x0,x1) => x0.type = x1,
_1385: (x0,x1) => x0.max = x1,
_1386: (x0,x1) => x0.min = x1,
_1387: (x0,x1) => x0.value = x1,
_1388: x0 => x0.value,
_1389: x0 => x0.disabled,
_1390: (x0,x1) => x0.disabled = x1,
_1391: (x0,x1) => x0.placeholder = x1,
_1392: (x0,x1) => x0.name = x1,
_1393: (x0,x1) => x0.autocomplete = x1,
_1394: x0 => x0.selectionDirection,
_1395: x0 => x0.selectionStart,
_1396: x0 => x0.selectionEnd,
_1399: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
_1406: (x0,x1) => x0.add(x1),
_1409: (x0,x1) => x0.noValidate = x1,
_1410: (x0,x1) => x0.method = x1,
_1411: (x0,x1) => x0.action = x1,
_1416: (x0,x1) => x0.getContext(x1),
_1419: x0 => x0.convertToBlob(),
_1439: x0 => x0.orientation,
_1440: x0 => x0.width,
_1441: x0 => x0.height,
_1442: (x0,x1) => x0.lock(x1),
_1459: f => finalizeWrapper(f,(x0,x1) => dartInstance.exports._1459(f,x0,x1)),
_1469: x0 => x0.length,
_1471: (x0,x1) => x0.item(x1),
_1472: x0 => x0.length,
_1473: (x0,x1) => x0.item(x1),
_1474: x0 => x0.iterator,
_1475: x0 => x0.Segmenter,
_1476: x0 => x0.v8BreakIterator,
_1479: x0 => x0.done,
_1480: x0 => x0.value,
_1481: x0 => x0.index,
_1485: (x0,x1) => x0.adoptText(x1),
_1486: x0 => x0.first(),
_1488: x0 => x0.next(),
_1489: x0 => x0.current(),
_1501: x0 => x0.hostElement,
_1502: x0 => x0.viewConstraints,
_1504: x0 => x0.maxHeight,
_1505: x0 => x0.maxWidth,
_1506: x0 => x0.minHeight,
_1507: x0 => x0.minWidth,
_1508: x0 => x0.loader,
_1509: () => globalThis._flutter,
_1510: (x0,x1) => x0.didCreateEngineInitializer(x1),
_1511: (x0,x1,x2) => x0.call(x1,x2),
_1512: () => globalThis.Promise,
_1513: f => finalizeWrapper(f,(x0,x1) => dartInstance.exports._1513(f,x0,x1)),
_1518: x0 => x0.length,
_1521: x0 => x0.tracks,
_1525: x0 => x0.image,
_1530: x0 => x0.codedWidth,
_1531: x0 => x0.codedHeight,
_1534: x0 => x0.duration,
_1538: x0 => x0.ready,
_1539: x0 => x0.selectedTrack,
_1540: x0 => x0.repetitionCount,
_1541: x0 => x0.frameCount,
_1592: x0 => x0.remove(),
_1593: x0 => globalThis.URL.createObjectURL(x0),
_1594: f => finalizeWrapper(f,x0 => dartInstance.exports._1594(f,x0)),
_1595: f => finalizeWrapper(f,x0 => dartInstance.exports._1595(f,x0)),
_1596: f => finalizeWrapper(f,x0 => dartInstance.exports._1596(f,x0)),
_1597: (x0,x1) => x0.querySelector(x1),
_1598: (x0,x1) => x0.createElement(x1),
_1599: (x0,x1) => x0.append(x1),
_1600: (x0,x1,x2) => x0.setAttribute(x1,x2),
_1601: (x0,x1) => x0.replaceChildren(x1),
_1602: (x0,x1) => x0.append(x1),
_1603: x0 => x0.click(),
_1621: x0 => ({type: x0}),
_1622: (x0,x1) => new Blob(x0,x1),
_1623: x0 => globalThis.URL.createObjectURL(x0),
_1624: x0 => x0.click(),
_1625: x0 => x0.remove(),
_1626: (x0,x1) => x0.matchMedia(x1),
_1637: x0 => new Array(x0),
_1644: f => finalizeWrapper(f,x0 => dartInstance.exports._1644(f,x0)),
_1645: f => finalizeWrapper(f,x0 => dartInstance.exports._1645(f,x0)),
_1650: (o, a) => o + a,
_1671: (decoder, codeUnits) => decoder.decode(codeUnits),
_1672: () => new TextDecoder("utf-8", {fatal: true}),
_1673: () => new TextDecoder("utf-8", {fatal: false}),
_1674: v => stringToDartString(v.toString()),
_1675: (d, digits) => stringToDartString(d.toFixed(digits)),
_1679: o => new WeakRef(o),
_1680: r => r.deref(),
_1685: Date.now,
_1687: s => new Date(s * 1000).getTimezoneOffset() * 60 ,
_1688: s => {
      const jsSource = stringFromDartString(s);
      if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(jsSource)) {
        return NaN;
      }
      return parseFloat(jsSource);
    },
_1689: () => {
          let stackString = new Error().stack.toString();
          let frames = stackString.split('\n');
          let drop = 2;
          if (frames[0] === 'Error') {
              drop += 1;
          }
          return frames.slice(drop).join('\n');
        },
_1690: () => typeof dartUseDateNowForTicks !== "undefined",
_1691: () => 1000 * performance.now(),
_1692: () => Date.now(),
_1695: () => new WeakMap(),
_1696: (map, o) => map.get(o),
_1697: (map, o, v) => map.set(o, v),
_1698: s => stringToDartString(JSON.stringify(stringFromDartString(s))),
_1699: s => printToConsole(stringFromDartString(s)),
_1708: (o, t) => o instanceof t,
_1710: f => finalizeWrapper(f,x0 => dartInstance.exports._1710(f,x0)),
_1711: f => finalizeWrapper(f,x0 => dartInstance.exports._1711(f,x0)),
_1712: o => Object.keys(o),
_1713: (ms, c) =>
              setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
_1714: (handle) => clearTimeout(handle),
_1717: (c) =>
              queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
_1721: () => new XMLHttpRequest(),
_1722: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
_1723: x0 => x0.send(),
_1725: () => new FileReader(),
_1726: (x0,x1) => x0.readAsArrayBuffer(x1),
_1735: f => finalizeWrapper(f,x0 => dartInstance.exports._1735(f,x0)),
_1736: f => finalizeWrapper(f,x0 => dartInstance.exports._1736(f,x0)),
_1737: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
_1738: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
_1760: (x0,x1) => x0.item(x1),
_1761: (a, i) => a.push(i),
_1765: a => a.pop(),
_1766: (a, i) => a.splice(i, 1),
_1768: (a, s) => a.join(s),
_1769: (a, s, e) => a.slice(s, e),
_1772: a => a.length,
_1774: (a, i) => a[i],
_1775: (a, i, v) => a[i] = v,
_1777: a => a.join(''),
_1780: (s, t) => s.split(t),
_1781: s => s.toLowerCase(),
_1782: s => s.toUpperCase(),
_1783: s => s.trim(),
_1784: s => s.trimLeft(),
_1785: s => s.trimRight(),
_1787: (s, p, i) => s.indexOf(p, i),
_1788: (s, p, i) => s.lastIndexOf(p, i),
_1789: (o, offsetInBytes, lengthInBytes) => {
      var dst = new ArrayBuffer(lengthInBytes);
      new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
      return new DataView(dst);
    },
_1790: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
_1791: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
_1792: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
_1793: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
_1794: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
_1795: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
_1796: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
_1798: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
_1799: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
_1800: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
_1801: Object.is,
_1802: (t, s) => t.set(s),
_1804: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
_1806: o => o.buffer,
_1807: o => o.byteOffset,
_1808: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
_1809: (b, o) => new DataView(b, o),
_1810: (b, o, l) => new DataView(b, o, l),
_1811: Function.prototype.call.bind(DataView.prototype.getUint8),
_1812: Function.prototype.call.bind(DataView.prototype.setUint8),
_1813: Function.prototype.call.bind(DataView.prototype.getInt8),
_1814: Function.prototype.call.bind(DataView.prototype.setInt8),
_1815: Function.prototype.call.bind(DataView.prototype.getUint16),
_1816: Function.prototype.call.bind(DataView.prototype.setUint16),
_1817: Function.prototype.call.bind(DataView.prototype.getInt16),
_1818: Function.prototype.call.bind(DataView.prototype.setInt16),
_1819: Function.prototype.call.bind(DataView.prototype.getUint32),
_1820: Function.prototype.call.bind(DataView.prototype.setUint32),
_1821: Function.prototype.call.bind(DataView.prototype.getInt32),
_1822: Function.prototype.call.bind(DataView.prototype.setInt32),
_1825: Function.prototype.call.bind(DataView.prototype.getBigInt64),
_1826: Function.prototype.call.bind(DataView.prototype.setBigInt64),
_1827: Function.prototype.call.bind(DataView.prototype.getFloat32),
_1828: Function.prototype.call.bind(DataView.prototype.setFloat32),
_1829: Function.prototype.call.bind(DataView.prototype.getFloat64),
_1830: Function.prototype.call.bind(DataView.prototype.setFloat64),
_1836: s => stringToDartString(stringFromDartString(s).toUpperCase()),
_1837: s => stringToDartString(stringFromDartString(s).toLowerCase()),
_1839: (s, m) => {
          try {
            return new RegExp(s, m);
          } catch (e) {
            return String(e);
          }
        },
_1840: (x0,x1) => x0.exec(x1),
_1841: (x0,x1) => x0.test(x1),
_1842: (x0,x1) => x0.exec(x1),
_1843: (x0,x1) => x0.exec(x1),
_1844: x0 => x0.pop(),
_1848: (x0,x1,x2) => x0[x1] = x2,
_1850: o => o === undefined,
_1851: o => typeof o === 'boolean',
_1852: o => typeof o === 'number',
_1854: o => typeof o === 'string',
_1857: o => o instanceof Int8Array,
_1858: o => o instanceof Uint8Array,
_1859: o => o instanceof Uint8ClampedArray,
_1860: o => o instanceof Int16Array,
_1861: o => o instanceof Uint16Array,
_1862: o => o instanceof Int32Array,
_1863: o => o instanceof Uint32Array,
_1864: o => o instanceof Float32Array,
_1865: o => o instanceof Float64Array,
_1866: o => o instanceof ArrayBuffer,
_1867: o => o instanceof DataView,
_1868: o => o instanceof Array,
_1869: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
_1871: o => {
            const proto = Object.getPrototypeOf(o);
            return proto === Object.prototype || proto === null;
          },
_1872: o => o instanceof RegExp,
_1873: (l, r) => l === r,
_1874: o => o,
_1875: o => o,
_1876: o => o,
_1877: b => !!b,
_1878: o => o.length,
_1881: (o, i) => o[i],
_1882: f => f.dartFunction,
_1883: l => arrayFromDartList(Int8Array, l),
_1884: l => arrayFromDartList(Uint8Array, l),
_1885: l => arrayFromDartList(Uint8ClampedArray, l),
_1886: l => arrayFromDartList(Int16Array, l),
_1887: l => arrayFromDartList(Uint16Array, l),
_1888: l => arrayFromDartList(Int32Array, l),
_1889: l => arrayFromDartList(Uint32Array, l),
_1890: l => arrayFromDartList(Float32Array, l),
_1891: l => arrayFromDartList(Float64Array, l),
_1892: (data, length) => {
          const view = new DataView(new ArrayBuffer(length));
          for (let i = 0; i < length; i++) {
              view.setUint8(i, dartInstance.exports.$byteDataGetUint8(data, i));
          }
          return view;
        },
_1893: l => arrayFromDartList(Array, l),
_1894: stringFromDartString,
_1895: stringToDartString,
_1896: () => ({}),
_1897: () => [],
_1898: l => new Array(l),
_1899: () => globalThis,
_1900: (constructor, args) => {
      const factoryFunction = constructor.bind.apply(
          constructor, [null, ...args]);
      return new factoryFunction();
    },
_1901: (o, p) => p in o,
_1902: (o, p) => o[p],
_1903: (o, p, v) => o[p] = v,
_1904: (o, m, a) => o[m].apply(o, a),
_1906: o => String(o),
_1907: (p, s, f) => p.then(s, f),
_1908: s => {
      let jsString = stringFromDartString(s);
      if (/[[\]{}()*+?.\\^$|]/.test(jsString)) {
          jsString = jsString.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
      }
      return stringToDartString(jsString);
    },
_1911: x0 => x0.index,
_1913: x0 => x0.length,
_1915: (x0,x1) => x0[x1],
_1919: x0 => x0.flags,
_1920: x0 => x0.multiline,
_1921: x0 => x0.ignoreCase,
_1922: x0 => x0.unicode,
_1923: x0 => x0.dotAll,
_1924: (x0,x1) => x0.lastIndex = x1,
_1968: (x0,x1) => x0.responseType = x1,
_1970: x0 => x0.response,
_2048: x0 => x0.style,
_2077: (x0,x1) => x0.oncancel = x1,
_2083: (x0,x1) => x0.onchange = x1,
_2123: (x0,x1) => x0.onerror = x1,
_2417: (x0,x1) => x0.download = x1,
_2442: (x0,x1) => x0.href = x1,
_2997: (x0,x1) => x0.accept = x1,
_3013: x0 => x0.files,
_3037: (x0,x1) => x0.multiple = x1,
_3055: (x0,x1) => x0.type = x1,
_3726: () => globalThis.window,
_3807: x0 => x0.navigator,
_4289: x0 => x0.vendor,
_8562: x0 => x0.type,
_8563: x0 => x0.target,
_8702: () => globalThis.document,
_8792: x0 => x0.body,
_9158: (x0,x1) => x0.id = x1,
_9835: x0 => x0.size,
_9836: x0 => x0.type,
_9843: x0 => x0.name,
_9844: x0 => x0.lastModified,
_9850: x0 => x0.length,
_9865: x0 => x0.result,
_12258: (x0,x1) => x0.display = x1,
_14567: () => globalThis.window,
_14588: x0 => x0.matches,
_14592: x0 => x0.platform,
_14597: x0 => x0.navigator
    };

    const baseImports = {
        dart2wasm: dart2wasm,


        Math: Math,
        Date: Date,
        Object: Object,
        Array: Array,
        Reflect: Reflect,
    };

    const jsStringPolyfill = {
        "charCodeAt": (s, i) => s.charCodeAt(i),
        "compare": (s1, s2) => {
            if (s1 < s2) return -1;
            if (s1 > s2) return 1;
            return 0;
        },
        "concat": (s1, s2) => s1 + s2,
        "equals": (s1, s2) => s1 === s2,
        "fromCharCode": (i) => String.fromCharCode(i),
        "length": (s) => s.length,
        "substring": (s, a, b) => s.substring(a, b),
    };

    dartInstance = await WebAssembly.instantiate(await modulePromise, {
        ...baseImports,
        ...(await importObjectPromise),
        "wasm:js-string": jsStringPolyfill,
    });

    return dartInstance;
}

// Call the main function for the instantiated module
// `moduleInstance` is the instantiated dart2wasm module
// `args` are any arguments that should be passed into the main function.
export const invoke = (moduleInstance, ...args) => {
    const dartMain = moduleInstance.exports.$getMain();
    const dartArgs = buildArgsList(args);
    moduleInstance.exports.$invokeMain(dartMain, dartArgs);
}


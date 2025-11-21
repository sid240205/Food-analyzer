"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/arrify";
exports.ids = ["vendor-chunks/arrify"];
exports.modules = {

/***/ "(rsc)/./node_modules/arrify/index.js":
/*!**************************************!*\
  !*** ./node_modules/arrify/index.js ***!
  \**************************************/
/***/ ((module) => {

eval("\nconst arrify = (value)=>{\n    if (value === null || value === undefined) {\n        return [];\n    }\n    if (Array.isArray(value)) {\n        return value;\n    }\n    if (typeof value === \"string\") {\n        return [\n            value\n        ];\n    }\n    if (typeof value[Symbol.iterator] === \"function\") {\n        return [\n            ...value\n        ];\n    }\n    return [\n        value\n    ];\n};\nmodule.exports = arrify;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvYXJyaWZ5L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBRUEsTUFBTUEsU0FBU0MsQ0FBQUE7SUFDZCxJQUFJQSxVQUFVLFFBQVFBLFVBQVVDLFdBQVc7UUFDMUMsT0FBTyxFQUFFO0lBQ1Y7SUFFQSxJQUFJQyxNQUFNQyxPQUFPLENBQUNILFFBQVE7UUFDekIsT0FBT0E7SUFDUjtJQUVBLElBQUksT0FBT0EsVUFBVSxVQUFVO1FBQzlCLE9BQU87WUFBQ0E7U0FBTTtJQUNmO0lBRUEsSUFBSSxPQUFPQSxLQUFLLENBQUNJLE9BQU9DLFFBQVEsQ0FBQyxLQUFLLFlBQVk7UUFDakQsT0FBTztlQUFJTDtTQUFNO0lBQ2xCO0lBRUEsT0FBTztRQUFDQTtLQUFNO0FBQ2Y7QUFFQU0sT0FBT0MsT0FBTyxHQUFHUiIsInNvdXJjZXMiOlsid2VicGFjazovL3pvbWF0by1hbmFseXplci8uL25vZGVfbW9kdWxlcy9hcnJpZnkvaW5kZXguanM/YWViZCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFycmlmeSA9IHZhbHVlID0+IHtcblx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gW107XG5cdH1cblxuXHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBbdmFsdWVdO1xuXHR9XG5cblx0aWYgKHR5cGVvZiB2YWx1ZVtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIFsuLi52YWx1ZV07XG5cdH1cblxuXHRyZXR1cm4gW3ZhbHVlXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyaWZ5O1xuIl0sIm5hbWVzIjpbImFycmlmeSIsInZhbHVlIiwidW5kZWZpbmVkIiwiQXJyYXkiLCJpc0FycmF5IiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/arrify/index.js\n");

/***/ })

};
;
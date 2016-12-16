'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.validEmail = validEmail;
exports.findIndex = findIndex;
exports.sanitizeString = sanitizeString;
function validEmail(email) {
    var regex = /^\w*$/;
    return regex.exec(email) !== null;
}

function findIndex(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
}

function sanitizeString(message) {
    return message.replace(/(<([^>]+)>)/ig, '').substring(0, 35);
}
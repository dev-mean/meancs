 export function validEmail(email) {
     var regex = /^\w*$/;
     return regex.exec(email) !== null;
 }

 export function findIndex (arr, id) {
     var len = arr.length;

     while (len--) {
         if (arr[len].id === id) {
             return len;
         }
     }

     return -1;
 }

 export function sanitizeString( message ) {
     return message.replace(/(<([^>]+)>)/ig,'').substring(0, 35);
 }
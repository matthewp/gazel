/*gazel@1.0.0#polyfill*/
"format cjs";

window.indexedDB = window.indexedDB
  || window.mozIndexedDB
  || window.msIndexedDB
  || window.webkitIndexedDB
  || window.oIndexedDB;

window.IDBTransaction = window.IDBTransaction
  || window.webkitIDBTransaction;

window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || 'readonly';
window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || 'readwrite';


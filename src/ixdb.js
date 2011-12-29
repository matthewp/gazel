    var Ixdb = (function () {
        function Ixdb(osname) {
            this.osName = exists(osname) ? osname : "gazelos";
        };

        function _getDatabase(self, onsuccess, onerror) {
            if (exists(self._db) && exists(onsuccess)) {
                onsuccess(self._db);
            } else {
                var req = window.indexedDB.open(gazel.dbName);
                req.onsuccess = function (e) {
                    self._db = e.target.result;
                    if (exists(onsuccess)) { onsuccess(self._db); }
                };
                req.onerror = onerror;
            }
        };

        function _createObjectStore(self, db, onsuccess, onerror) {
            try {
                var req = db.setVersion(gazel.version);
                req.onerror = function (e) {
                    _handleError(e.message, onerror);
                };
                req.onsuccess = function (e) {
                    var store;
                    var tx = e.target.result;
                    tx.onerror = function (e) {
                        _handleError(e.message, onerror);
                    };
                    tx.oncomplete = function (e) {
                        if (exists(onsuccess)) { onsuccess(store); }
                    };
                    store = db.createObjectStore(self.osName);
                };
            } catch (ex) { _handleError(ex, onerror); }
        };

        function _getObjectStore(self, onsuccess, onerror, accessLevel) {
            var get = function (db) {
                var tx = db.transaction([self.osName], accessLevel);
                tx.onerror = onerror;
                try {
                    var os = tx.objectStore(self.osName);
                    if (exists(onsuccess)) { onsuccess(os); }
                } catch (ex) { _handleError(ex, onerror); }
            };

            _getDatabase(self, function (db) {
                if (db.objectStoreNames.contains(self.osName)) { get(db); }

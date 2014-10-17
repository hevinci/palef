/*
 * DAO
 *   #STORE
 *   #URL
 *   #create(object)
 *   #getLastSyncedTimestamp()
 *   #fetchUnsynced()
 *   #markAsSynced()
 */

function TraceDao(db) {
  this.db = db;
}

TraceDao.prototype.STORE = 'traces';

TraceDao.prototype.URL = '/traces';

TraceDao.prototype.create = function (trace) {
  this.db.create('traces', trace);
};

TraceDao.prototype.delete = function (trace) {

};


const sqlite3 = require('sqlite3').verbose();
let tb = new sqlite3.Database(':memory:', (err) => {if(err){return console.error(err.message)}});
sqr[0] = 'create table if not exists zeitschrift (id integer primary key, journal text unique, kuerzel text unique)';
sqr[1] = 'create table if not exists relzeitschrift (zeitschriftid integer primary key, nr integer, id integer references zeitschrift (id))';
sqr[2] = 'create table if not exists relobjtyp (objektid integer, zeitschriftid integer references relzeitschrift (zeitschriftid), primary key (objektid, zeitschriftid))';

db.serialize( () =>
{
    tb.run(sqr[0], [], function (err) {if (err) {console.log(err.message);} else {console.log(0);} });
    tb.run(sqr[1], [], function (err) {if (err) {console.log(err.message);} else {console.log(1);} });
    tb.run(sqr[2], [], function (err) {if (err) {console.log(err.message);} else {console.log(0);} });
});

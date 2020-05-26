/*
    Functions to open and change database
*/

let linkToDB = 'src/db/ksbib.db';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(linkToDB, (err) => { if (err) { return console.log(err.message); } });
db.exec('PRAGMA foreign_keys = ON;', (err) =>  { if (err){return console.error(err.message)} });

/*
function rollback (err)
{
    if (err) {
        console.log(err.message);
        db.run(`ROLLBACK`);
        return "ERROR: Der Datensatz konnte nicht gespeichert werden, \
        bitte kontaktiere kirsten.a@posteo.de";
    } else {
        return "";
    }
}
*/
function dbGet (sql, param)
{
    return new Promise ((resolve, reject) =>
    {
        db.get(sql, param, function (err, row)
        {
            if (err) {reject(err);}
            if (row === undefined) {
                reject('Es gibt kein Ergebnis'); 
            } else {
                resolve(row);
            }
        });
    });
}

function dbRun (sql, param)
{
    return new Promise ((resolve, reject) =>
    {
        db.run(sql, param, function (err)
        {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}

function sqr (sql, params, outputArr)
{
    if (db !== undefined) {
        let p = new Promise(function (resolve, reject) 
        {
            db.all(sql, params, (err, rows) => 
            {
                if (err) { 
                    reject(err); 
                } else {
                    rows.forEach( (row) => {outputArr.push(row)} );
                    resolve(outputArr);
                }
            });
        });
        return p;
    } else {
        return console.log("db not yet opened");
    }
}

function showDatalist (value, link, sql, data) 
    {
        db.all(sql, [value], (err, rows) =>
        {
            if (err) {console.log(err.message);}
            if (link.firstElementChild !== null) {link.firstElementChild.remove();}
            let sel = document.createElement("select");
            let opts = [];
            rows.forEach((row)=>
            {
                opts.push(document.createElement("option"));
                opts[opts.length-1].innerHTML = Object.values(row)[0];
                sel.appendChild(opts[opts.length-1]);
            })
            link.appendChild(sel);
            return valArr;
        })
    }

/*
    Functions to fill up the value of inventarnummer and standorte
*/

async function cStandorteOptions (link)
{
    let standorte = [];
    let option = [];
    let sel = link;
    let i = 0;  
    standorte = await sqr(sqlStandorteSgn(), [], standorte);
    for (i = 0; i < standorte.length; i++) {
        option[i] = document.createElement("option");
        option[i].setAttribute("value", standorte[i].id);
        option[i].innerHTML = standorte[i].standortsgn;
        sel.appendChild(option[i]);
    }
}

async function getMaxID (plus) 
{
    let x = [];
    x = await sqr("SELECT MAX(id) AS id FROM objekt", [], x);
    return (x[0].id + plus);
}


/*
    SQL
*/

function insertData (sql, data)
{

}

let sql = [];
sql[0] = `SELECT MAX(buchid) + 1 AS id FROM relobjtyp`;
sql[1] = `SELECT id AS jahrid FROM jahr WHERE jahr = ?`;
sql[2] = `INSERT OR IGNORE INTO ort (id, ort) VALUES (NULL, ?)`;
sql[3] = `INSERT INTO objekt (id, medium, standort, preis, band, status) 
    VALUES (?, ?, ?, ?, ?, ?)`;
sql[4] = `INSERT INTO relobjtyp 
    (objektid, zeitschriftid, buchid, aufsatzid, autortyp, hinweis, seiten, erscheinungsjahr, ort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
sql[5] = `INSERT OR IGNORE INTO verlag (id, verlag) VALUES (NULL, ?)`;
sql[6] = `INSERT OR IGNORE INTO stichwort (id, stichwort) VALUES (NULL, ?)`;
sql[7] = `INSERT INTO relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) VALUES (?, ?, ?, ?, ?)`;
sql[8] = `INSERT OR IGNORE INTO autor (id, name, vorname) VALUES (NULL, ?, ?)`;
sql[9] = `INSERT INTO relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr)
    VALUES (?, ?, ?, ?, ?, ?)`;
sql[10] = `INSERT OR IGNORE INTO titel (id, titel) VALUES (NULL, ?)`;
sql[11] = `INSERT INTO reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
sql[12] = `SELECT id FROM stichwort WHERE stichwort = ?`;
sql[13] = `SELECT id FROM autor WHERE name = ? AND vorname = ?`;
sql[14] = `SELECT id FROM titel WHERE titel = ?`;
sql[15] = `INSERT INTO relsachgebiet (objektid, sachgebietid) VALUES (?, ?)`;
sql[16] = `SELECT id AS verlagid FROM verlag WHERE verlag = ?`;
sql[17] = `SELECT id AS ortid FROM ort WHERE ort = ?`;
sql[18] = `INSERT INTO buch (id, auflage, verlag, isbn) VALUES (?, ?, ?, ?)`;
sql[19] = `SELECT journal FROM zeitschrift WHERE journal LIKE ? Limit 5`
sql[20] = `SELECT MAX(zeitschriftid) + 1 AS id FROM relobjtyp`;
sql[21] = `INSERT OR IGNORE INTO zeitschrift (id, journal, kuerzel) VALUES (NULL, ?, ?)`;
sql[22] = `SELECT id FROM zeitschrift WHERE journal = ?`;
sql[23] = `INSERT OR IGNORE INTO relzeitschrift (id, zeitschriftid, nr) VALUES (?, ?, ?)`;
sql[24] = `SELECT MAX(aufsatzid) + 1 AS id FROM relobjtyp`;
sql[25] = `SELECT MAX(aufsatzid) + 1 AS aufsatzid FROM relobjtyp WHERE objektid = ? AND buchid = 0`; //Artikel
sql[26] = `SELECT MAX(aufsatzid) + 1 AS aufsatzid FROM relobjtyp WHERE objektid = ? AND zeitschriftid = 0`; //Buchaufsatz
sql[27] = `SELECT zeitschriftid FROM relobjtyp WHERE objektid = ? AND aufsatzid = 0`;
sql[28] = `SELECT buchid FROM relobjtyp WHERE objektid = ? AND aufsatzid = 0`;
sql[29] = `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid FROM media_view 
    WHERE objektid = ? ORDER BY zeitschriftid, buchid, aufsatzid ASC`;
sql[30] = `SELECT * FROM media_view WHERE (objektid = ? AND aufsatzid = 0 AND zeitschriftid = 0)`;
sql[31] = `SELECT * FROM media_view WHERE (objektid = ? AND buchid = 0 AND aufsatzid = 0)`;
sql[32] = `DELETE FROM objekt WHERE id = ?`;


function sqlTitelID (titel, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid from reltitel
    INNER JOIN titel id ON titelid = id
    WHERE titel LIKE '%${titel}%' 
    ORDER BY objektid ASC
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlAutorID (autor, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid from relautor
    INNER JOIN autor id ON autorid = id
    WHERE (name LIKE '%${autor}%' OR vorname LIKE '%${autor}%')
    ORDER BY objektid ASC
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlStandorteSgn ()
{
    return `SELECT id, standortsgn FROM standort WHERE standortsgn != "n.A." ORDER BY standortsgn ASC`;
}

function sqlSearchForMediumData (idArr)
{
    let id = idArr[0];
    let zeitschriftid = idArr[1];
    let buchid = idArr[2];
    let aufsatzid = idArr[3];
    return `SELECT objektid, zeitschriftid, buchid, aufsatzid, 
    jahr, preis, band, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, 
    standortsgn, medium, band, zeitschrift, zeitschriftNr, hinweis, status, ort, verlag
    FROM media_view
    WHERE objektid = '${id}' AND zeitschriftid = '${zeitschriftid}' AND buchid = '${buchid}' AND aufsatzid = '${aufsatzid}'
    ORDER BY objektid, zeitschriftid, buchid, aufsatzid, titeltyp, titelnr, autortyp, autornr ASC`;
}

function sqlDetailedSearchID (tablesToJoin, constraint, limit, offset)
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
        FROM media_view ${tablesToJoin}
        WHERE ${constraint}
        ORDER BY objektid, zeitschriftid, buchid, aufsatzid ASC
        LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlCollectionBelongingToArticle (idArr)
{
    let id = idArr[0];
    let zeitschriftid = idArr[1];
    let buchid = idArr[2];
    let aufsatzid = idArr[3];
    return `SELECT objektid, autortyp, autornr, autor, titelnr, titel, titeltyp 
    FROM media_view
    WHERE objektid = '${id}' AND zeitschriftid = '${zeitschriftid}' AND buchid = '${buchid}' AND aufsatzid = '${aufsatzid}'
    ORDER BY titeltyp, titelnr, autortyp, autornr ASC`;
}

/*
    Functions to open and change database
*/

let linkToDB = 'src/db/ksbib.db';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(linkToDB, (err) => { if (err) { return console.log(err.message); } });

/*
let db;

function openDB (linkToDB) {
    const sqlite3 = require('sqlite3').verbose();
    return db = new sqlite3.Database(linkToDB, (err) => { if (err) { return console.log(err.message); } });
}
*/

/*
function callbackSQL (err) 
{
    if (err) { console.log(err.message); } 
    else { return true; } 
}
*/
function rollback (err)
{
    if (err) {
        document.getElementById('bFrmWarnFld').innerHTML = "ERROR: Der Datensatz konnte nicht gespeichert werden, \
        bitte kontaktiere kirsten.a@posteo.de";
        console.log(err.message);
        return db.run(`ROLLBACK`);
    }
    return true;
}


function sqr (sql, params, outputArr)
{
    //openDB();
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
        //db.close();
        return p;
    } else {
        return console.log("db not yet opened");
    }
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

let sql = [];
sql[0] = `SELECT MAX(id) AS id FROM buch`;
sql[1] = `SELECT id AS jahrid FROM jahr WHERE jahr = ?`;
sql[2] = `INSERT OR IGNORE INTO ort (id, ort) VALUES (NULL, ?)`;
sql[3] = `INSERT INTO objekt (id, medium, standort, preis, band, status) 
    VALUES (?, ?, ?, ?, ?, ?)`;
sql[4] = `INSERT INTO relobjtyp 
    (objektid, zeitschriftid, buchid, aufsatzid, autortyp, hinweis, seiten, erscheinungsjahr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
sql[5] = `INSERT OR IGNORE INTO verlag (id, verlag) VALUES (NULL, ?)`;
sql[6] = `INSERT OR IGNORE INTO stichwort (id, stichwort) VALUES (NULL, ?)`;
sql[7] = `INSERT INTO relstichwort (objektid, stichwortid) VALUES (?, ?)`;
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
sql[18] = `INSERT INTO buch (id, auflage, ort, verlag, isbn) VALUES (?, ?, ?, ?, ?)`;


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
    standortsgn, medium, band, zeitschrift, zeitschriftNr, hinweis 
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





/*

function sqlJournal (id)
{
    return `SELECT objektid AS id, journal.journal AS zeitschrift, nr FROM relobjtyp \
    INNER JOIN (\
        SELECT id, journal.journal, zeitschrift.journal, nr FROM zeitschrift \
        INNER JOIN journal id ON journal.id = zeitschrift.journal
    ) ON zeitschrift.id = relobjtyp.zeitschriftid \
    WHERE objektid.id = '${id}'`;
}

function sqlAutor (id)
{
    return `SELECT objektid, autornr, name, vorname from relautor \
    INNER JOIN autor id ON autorid = id \
    WHERE objektid = '${id}'`;   
}

function sqlTitel (id) 
{
    return `SELECT objektid, titel, titelnr, titeltyp FROM reltitel \
    INNER JOIN titel id ON titelid = id \
    WHERE objektid = '${id}'`;
}

function sqlStandortMedium (id)
{
    return `SELECT objekt.id objektid, standort.standort, standort.standortsgn, medium.medium FROM objekt \
    INNER JOIN medium ON medium.id = objekt.medium \
    INNER JOIN standort ON standort.id = objekt.standort \
    WHERE objekt.id = '${id}'`;
}

function sqlJahrAutortypPreisSeiten (id)
{
    return `SELECT objektid, jahr, autortyp, preis, seiten FROM relobjtyp \
    LEFT OUTER JOIN jahr ON jahr.id = relobjtyp.erscheinungsjahr \
    WHERE objektid = '${id}'`;
}
*/

/*
function sqlAutorID_F (name, surname, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid from relautor
    INNER JOIN autor id ON autorid = id
    WHERE (name LIKE '%${name}%' AND vorname LIKE '%${surname}%')
    ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlAutorID_FF (name1, surname1, name2, surname2, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid 
    FROM relautor
    INNER JOIN (
        SELECT id AS id1, name AS name1, vorname AS vorname1
        FROM autor
    ) ON autorid = id1
    INNER JOIN (
        SELECT id AS id2, name AS name2, vorname AS vorname2
        FROM autor
    ) ON autorid = id2
    WHERE (
        (name1 LIKE '%${name1}%' AND vorname1 LIKE '%${surname1}%') 
        AND
        (name2 LIKE '%${name2}%' AND vorname2 LIKE '%${surname2}%')
    ) ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;
}


function sqlAutorID_NN (autor1, autor2, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
    FROM relautor
    INNER JOIN autor autor1 ON autorid = autor1.id
    INNER JOIN autor autor2 ON autorid = autor2.id
    WHERE (
        (autor1.name LIKE '%${autor1}%' OR autor1.vorname LIKE '%${autor1}%') 
        AND
        (autor2.name LIKE '%${autor2}%' OR autor2.vorname LIKE '%${autor2}%')
    
    ) ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlAutorID_FN (name1, surname1, autor2, limit, offset) 
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid 
    FROM relautor
    INNER JOIN (
        SELECT id AS id1, name AS name1, vorname AS vorname1
        FROM autor
    ) ON autorid = id1
    INNER JOIN (
        SELECT id AS id2, name AS name2, vorname AS vorname2
        FROM autor
    ) ON autorid = id2
    WHERE (
        (name1 LIKE '%${name1}%' AND vorname1 LIKE '%${surname1}%') 
        AND
        (name2 LIKE '%${autor2}%' OR vorname2 LIKE '%${autor2}%')
    ) ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlJahrID (jahr, limit offset)
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
    FROM relobjtyp WHERE erscheinungsjahr = '${jahr}' ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;
}

function sqlLowerTimespan (t1, limit, offset)
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
    FROM relobjtyp WHERE erscheinungsjahr >= '${t1}' ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;   
}

function sqlUpperTimespan (t2, limit, offset)
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
    FROM relobjtyp WHERE erscheinungsjahr <= '${t2}' ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;   
}

function sqlTimespan (t1, t2, limit, offset)
{
    return `SELECT DISTINCT objektid, zeitschriftid, buchid, aufsatzid
    FROM relobjtyp WHERE (erscheinungsjahr >= '${t1}' && erscheinungsjahr <= '${t2}')
    ORDER BY objektid
    LIMIT '${limit}' OFFSET '${offset}'`;   
}

function sqlStichwortID (stichwort) 
{
    return `SELECT DISTINCT objektid from relstichwort \
    LEFT OUTER JOIN stichwort USING id \
    WHERE titel LIKE '%${stichwort}%'`;
}  
*/
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

function callbackSQL (err) 
{
    if (err) { console.log(err.message); } 
    else { return true; } 
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

async function getMaxID () 
{
    let x = [];
    x = await sqr("SELECT MAX(id) AS id FROM objekt", [], x);
    return x[0].id;
}


/*
    SQL
*/


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

async function sqlNewBook (data)
{
    let i, sql = [], autorenArr = [], test = [], result = []; 
    let buchid = [], jahrid = [], stichwortid = [], titelid = [], autorid = [], verlagid = [], ortid = [];
    function runSQL (sql)
    {
        let p = new Promise( (reject, resolve) =>
        {   
            resolve(sql.map(item => db.run(item, [],callbackSQL)));
            reject("promise rejected");
        });
        return p;
    }

    buchid = await sqr(`SELECT MAX(id) AS id FROM buch`, [], buchid);
    jahrid = await sqr(`SELECT id AS jahrid FROM jahr WHERE jahr = ?`, [data.jahr], jahrid);
    buchid = buchid[0].id + 1;


    sql.push(`INSERT OR IGNORE INTO ort (id, ort) VALUES (NULL, '${data.ort}')`);
    sql.push(`INSERT INTO objekt (id, medium, standort, preis, band, status) 
            VALUES (${data.id}, 1, ${data.standort}, ${data.preis}, ${data.band}, 0)`);
    sql.push(`INSERT INTO relobjtyp 
            (objektid, zeitschriftid, buchid, aufsatzid, autortyp, hinweis, seiten, erscheinungsjahr)
            VALUES (${data.id}, 0, ${buchid}, 0, ${data.autortyp}, '${data.hinweis}', '${data.seiten}', ${jahrid[0].jahrid})`);
    sql.push(`INSERT OR IGNORE INTO verlag (id, verlag) VALUES (NULL, '${data.verlag}')`);
    for (i = 0; i < data.sachgebietsnr.length; i++) {
        sql.push(`INSERT INTO relsachgebiet (objektid, sachgebietid) VALUES (${data.id}, ${data.sachgebietsnr[i]})`);
    }

    await runSQL(sql).catch( (err) => {console.log(err)});

    sql = [];

    sql[0] = `INSERT OR IGNORE INTO stichwort (id, stichwort) VALUES (NULL, ?)`;
    sql[1] = `INSERT INTO relstichwort (objektid, stichwortid) VALUES (${data.id}, ?)`;
    sql[2] = `INSERT OR IGNORE INTO autor (id, name, vorname) VALUES (NULL, ?, ?)`;
    sql[3] = `INSERT INTO relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr)
                VALUES (${data.id}, 0, ${buchid}, 0, ?, ?)`;
    sql[4] = `INSERT OR IGNORE INTO titel (id, titel) VALUES (NULL, ?)`;
    sql[5] = `INSERT INTO reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) 
                VALUES (${data.id}, 0,  ${buchid}, 0, ?, 0, ?)`;

    function stichwortInsertions ()
    {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => { 
            db.run(sql[0], [data.stichworte[i]], 
                function (err)
                {
                    if (err) {return console.log(err.message);} 
                    db.get(`SELECT id FROM stichwort WHERE stichwort = ?`, [data.stichworte[i]], 
                        function (err, row) 
                        {
                            if (err) {return console.log(err.message);}
                            db.run(sql[1], [row.id], function (err) {console.log(err.message)});
                            return true;
                        }
                    );
                }
            );
            })(i);
        }   
    }
    function autorInsertions ()
    {
        for (i=0; i < data.autoren.length; i++) { 
            ((i) => {
            db.run(sql[2], [data.autoren[i].split(",").map(strtrim)[0], data.autoren[i].split(",").map(strtrim)[1]], 
                function (err)
                {
                    if (err) {return console.log(err.message);} 
                    autorenArr = data.autoren[i].split(",").map(strtrim);
                    db.get(`SELECT id FROM autor WHERE name = ? AND vorname = ?`, [autorenArr[0], autorenArr[1]], 
                        function (err, row) 
                        {
                            if (err) {return console.log(err.message);}
                            db.run(sql[3], [row.id, i+1], function (err) {console.log(err.message)});
                            return true;
                        }
                    );
                }
            );
            })(i);
        }   
    }
    function titelInsertions ()
    {
        for (i=0; i < data.titel.length; i++) { 
            ((i) => {
            db.run(sql[4], [data.titel[i]], function (err)
                {
                    if (err) {return console.log(err.message);} 
                    db.get(`SELECT id FROM titel WHERE titel = ?`, [data.titel[i]], 
                        function (err, row) 
                        {
                            if (err) {return console.log(err.message);}
                            db.run(sql[5], [row.id, i+1], function (err) {console.log(err.message)});
                            return true;    
                        }
                    );
                }
            );
            })(i);
        }
    }

    await stichwortInsertions();
    await autorInsertions();
    await titelInsertions();

    db.get(`SELECT id AS verlagid FROM verlag WHERE verlag = ?`, [data.verlag], function (err, row)
    {
        if (err) {console.log(err.message);}
        let verlagid = row.verlagid;
        db.get(`SELECT id AS ortid FROM ort WHERE ort = ?`, [data.ort], function (err, row)
        {
            if (err) {console.log(err.message);}
            let ortid = row.ortid;
            db.run(`INSERT INTO buch (id, auflage, ort, verlag, isbn) 
                VALUES (${buchid}, ${data.auflage}, ?, ?, ${data.isbn})`, [ortid, verlagid], function (err) 
                {
                    if (err) {console.log(err.message);}
                    /*
                    db.get(`SELECT * FROM media_view WHERE objektid = ?`, [data.id], function (err, row)
                    {
                        if (err) {console.log(err.message);}
                        console.log(row);
                    })
                    */
                }
            );
        })
    });
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
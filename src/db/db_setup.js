let sqr = [];

sqr[0] = `CREATE TABLE IF NOT EXISTS sachgebiet 
    (id INTEGER PRIMARY KEY, sachgebiet TEXT NOT NULL, CHECK (id < 9999))`;
sqr[1] = `CREATE TABLE IF NOT EXISTS medium (id INTEGER PRIMARY KEY, medium TEXT UNIQUE)`;
sqr[2] = `CREATE TABLE IF NOT EXISTS standort (id INTEGER PRIMARY KEY, standort TEXT UNIQUE, standortsgn TEXT UNIQUE)`;
sqr[3] = `CREATE TABLE IF NOT EXISTS jahr (id INTEGER PRIMARY KEY, jahr INTEGER unique, CHECK(jahr > 999 AND jahr < 3001))`;
sqr[4] = `CREATE TABLE IF NOT EXISTS zeitschrift (id INTEGER PRIMARY KEY, journal TEXT UNIQUE, kuerzel TEXT UNIQUE)`;
sqr[5] = `CREATE TABLE IF NOT EXISTS ort (id INTEGER PRIMARY KEY, ort TEXT UNIQUE)`;
sqr[6] = `CREATE TABLE IF NOT EXISTS verlag (id INTEGER PRIMARY KEY, verlag TEXT UNIQUE)`;
sqr[7] = `CREATE TABLE IF NOT EXISTS autor (id INTEGER PRIMARY KEY, vorname TEXT, name TEXT, UNIQUE(vorname, name))`;
sqr[8] = `CREATE TABLE IF NOT EXISTS titel (id INTEGER PRIMARY KEY, titel TEXT UNIQUE)`;
sqr[9] = `CREATE TABLE IF NOT EXISTS objekt (id INTEGER PRIMARY KEY, aufnahmedatum TEXT, 
    medium INTEGER REFERENCES medium, 
    standort INTEGER REFERENCES standort, 
    sgn TEXT UNIQUE, preis REAL, band INTEGER, status INTEGER DEFAULT 0,
    CHECK (id > 0), CHECK (status >= 0 AND status <= 2))`; // 0 vorhanden; 1 abhanden; 2 verliehen
sqr[10] = `create table if not exists relsachgebiet 
    (objektid integer REFERENCES objekt ON DELETE CASCADE, 
    sachgebietid integer REFERENCES sachgebiet ON UPDATE CASCADE, 
    PRIMARY KEY (objektid, sachgebietid))`;
sqr[11] = `create table if not exists buch (id integer primary key, auflage integer, verlag integer references verlag, 
    isbn integer, check (auflage >0 and auflage < 201))`;
sqr[12] = `create table if not exists relzeitschrift 
    (zeitschriftid integer primary key, 
    nr integer, 
    id integer references zeitschrift (id), 
    unique(id, nr, zeitschriftid))`;
sqr[13] = 'CREATE TABLE IF NOT EXISTS stichwort (id INTEGER PRIMARY KEY, stichwort TEXT UNIQUE)';
    // autortyp = 0 (autor) oder 1 (hrg)
sqr[14] = `create table if not exists relobjtyp 
    (objektid integer references objekt ON DELETE CASCADE, 
    zeitschriftid integer references relzeitschrift (zeitschriftid), 
    buchid integer references buch, aufsatzid integer, 
    autortyp integer not null, hinweis text, seiten text, erscheinungsjahr integer references jahr, 
    ort integer references ort, link TEXT, primary key (objektid, zeitschriftid, buchid, aufsatzid), 
    check (autortyp = 0 OR autortyp = 1))`;
    // titeltyp = 0 (buchtitel/zeitschrifttitel) oder 1 (aufsatztitel/artikeltitel)
sqr[15] = `create table if not exists reltitel 
    (objektid integer, zeitschriftid integer, buchid integer, aufsatzid integer, titelid integer, 
    titelnr integer, titeltyp integer not null, 
    check (titelnr > 0 and titelnr < 4), check (titeltyp = 0 OR titeltyp = 1), 
    primary key (objektid, zeitschriftid, buchid, aufsatzid, titelid), 
    foreign key (objektid, zeitschriftid, buchid, aufsatzid) references 
        relobjtyp (objektid, zeitschriftid, buchid, aufsatzid) ON DELETE CASCADE, 
    foreign key (titelid) references titel (id))`;
sqr[16] = `create table if not exists relstichwort 
    (objektid integer, zeitschriftid integer, buchid integer, aufsatzid integer, stichwortid integer, 
    primary key (objektid, zeitschriftid, buchid, aufsatzid, stichwortid), 
    foreign key (objektid, zeitschriftid, buchid, aufsatzid) references 
        relobjtyp (objektid, zeitschriftid, buchid, aufsatzid) ON DELETE CASCADE,
    foreign key (stichwortid) references stichwort (id))`;
sqr[17] = `create table if not exists relautor (objektid integer, zeitschriftid integer, buchid integer, 
    aufsatzid integer, autorid integer references autor ON UPDATE CASCADE, autornr integer default 0, check (autornr > 0 and autornr < 11), 
    primary key (objektid, zeitschriftid, buchid, aufsatzid, autorid), 
    foreign key (objektid, zeitschriftid, buchid, aufsatzid) references 
    relobjtyp (objektid, zeitschriftid, buchid, aufsatzid) ON DELETE CASCADE)`;
sqr[18] = `CREATE TABLE IF NOT EXISTS filepath 
    (id INTEGER PRIMARY KEY, path TEXT, CHECK (id = 0))`;

sqr[19] = "insert OR IGNORE into medium (id, medium) values (0, NULL)";
sqr[20] = "insert OR IGNORE into standort (id, standort, standortsgn) values (0, 'n.A.', 'n.A.')";
sqr[21] = "insert OR IGNORE into jahr (id, jahr) values (0, NULL)";
sqr[22] = "insert OR IGNORE into zeitschrift (id, journal, kuerzel) values (0, NULL, NULL)";
sqr[23] = "insert OR IGNORE into ort (id, ort) values (0, NULL)";
sqr[24] = "insert OR IGNORE into verlag (id, verlag) values (0, NULL)";
sqr[25] = "insert OR IGNORE into autor (id, vorname, name) values (0, NULL, NULL)";
sqr[26] = "insert OR IGNORE into titel (id, titel) values (0, NULL)";
sqr[27] = "insert OR IGNORE into buch (id, auflage, verlag, isbn) values (0, NULL, NULL, NULL)";
sqr[28] = "insert OR IGNORE into relzeitschrift (zeitschriftid, nr, id) values (0, NULL, 0)";
sqr[29] = "insert OR IGNORE into stichwort (id, stichwort) values (0, NULL)";
sqr[30] = `INSERT OR IGNORE INTO filepath (id, path) VALUES (0, NULL)`;

sqr[31] = "insert OR IGNORE into medium (id, medium) values (1, 'Buch')";
sqr[32] = "insert OR IGNORE into medium (id, medium) values (2, 'Zeitschrift')";
sqr[33] = "insert OR IGNORE into medium (id, medium) values (3, 'Aufsatz')";
sqr[34] = "insert OR IGNORE into medium (id, medium) values (4, 'CD')";

sqr[35] = `CREATE VIEW media_view AS 
  SELECT objekt.id AS objektid, zeitschriftid, buchid, aufsatzid, 
    jahr, preis, band, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, 
    standortsgn, medium.medium, kuerzel AS zeitschrift, nr AS zeitschriftNr, 
    sgn, hinweis, status, ort, verlag, link
    FROM objekt 
    INNER JOIN medium ON medium.id = objekt.medium 
    INNER JOIN standort ON standort.id = objekt.standort 
    INNER JOIN ( 
        SELECT objektid, zeitschriftid, buchid, aufsatzid, 
        jahr, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, kuerzel, nr, hinweis, o AS ort, verlag, link
        FROM relobjtyp 
        LEFT OUTER JOIN ( 
            SELECT objektid, zeitschriftid, buchid, aufsatzid, 
            autornr, name ||", "|| vorname as autor 
            FROM relautor 
            INNER JOIN autor id ON relautor.autorid = id 
        ) USING (objektid, zeitschriftid, buchid, aufsatzid) 
        LEFT OUTER JOIN jahr ON jahr.id = relobjtyp.erscheinungsjahr 
        LEFT OUTER JOIN (
            SELECT id AS oid, ort AS o FROM ort 
        ) ON oid = relobjtyp.ort
        LEFT OUTER JOIN (
            SELECT id AS buchid, v AS verlag FROM buch
            LEFT OUTER JOIN (
                SELECT id AS vid, verlag AS v FROM verlag 
            ) ON buch.verlag = vid
        ) USING (buchid)
        INNER JOIN ( 
            SELECT objektid, zeitschriftid, buchid, aufsatzid, 
            titel, titelnr, titeltyp 
            FROM reltitel 
            INNER JOIN titel id ON titelid = id 
        ) USING (objektid, zeitschriftid, buchid, aufsatzid) 
        LEFT OUTER JOIN ( 
            SELECT zeitschriftid, kuerzel, nr 
            FROM relzeitschrift 
            INNER JOIN zeitschrift USING (id) 
        ) USING (zeitschriftid) 
    ) ON objekt.id = objektid AND zeitschriftid = zeitschriftid AND buchid = buchid AND aufsatzid = aufsatzid`;

sqr[36] = `create trigger if not exists trig_neuaufnahme after insert on objekt for each row
begin 
    update objekt set aufnahmedatum = date('now'); 
    update objekt set sgn = ((select standortsgn from standort where standort.id = objekt.standort) || ' ' || objekt.id); 
end`;

sqr[37] = `create trigger if not exists trig_update_sgn after update of standort on objekt for each row
begin 
    update objekt set sgn = ((select standortsgn from standort where standort.id = objekt.standort) || ' ' || objekt.id); 
end`;

//To avoid unused rows after delete on relational tables

sqr[38] = `CREATE TRIGGER if not exists clear_stichwort AFTER DELETE ON relstichwort
WHEN (SELECT COUNT(old.stichwortid) FROM relstichwort WHERE stichwortid = old.stichwortid) = 0 AND old.stichwortid != 0
BEGIN
    DELETE FROM stichwort WHERE id = old.stichwortid;
END`;

sqr[39] = `CREATE TRIGGER if not exists clear_verlag AFTER DELETE ON buch
WHEN (SELECT COUNT(old.verlag) FROM buch WHERE verlag = old.verlag) = 0 AND old.verlag != 0
BEGIN
    DELETE FROM verlag WHERE id = old.verlag;
END`;

sqr[40] = `CREATE TRIGGER if not exists clear_verlag2 AFTER UPDATE OF verlag ON buch
WHEN (SELECT COUNT(old.verlag) FROM buch WHERE verlag = old.verlag) = 0 AND old.verlag != 0
BEGIN
    DELETE FROM verlag WHERE id = old.verlag;
END`;

sqr[41] = `CREATE TRIGGER if not exists clear_ort AFTER DELETE ON relobjtyp
WHEN (SELECT COUNT(old.ort) FROM relobjtyp WHERE ort = old.ort) = 0 AND old.ort != 0
BEGIN
    DELETE FROM ort WHERE id = old.ort;
END`;

sqr[42] = `CREATE TRIGGER if not exists clear_ort2 AFTER UPDATE OF ort ON relobjtyp
WHEN (SELECT COUNT(old.ort) FROM relobjtyp WHERE ort = old.ort) = 0 AND old.ort != 0
BEGIN
    DELETE FROM ort WHERE id = old.ort;
END`;

sqr[43] = `CREATE TRIGGER if not exists clear_autor AFTER DELETE ON relautor
WHEN (SELECT COUNT(old.autorid) FROM relautor WHERE autorid = old.autorid) = 0 AND old.autorid != 0
BEGIN
    DELETE FROM autor WHERE id = old.autorid;
END`;

sqr[44] = `CREATE TRIGGER if not exists clear_titel AFTER DELETE ON reltitel
WHEN (SELECT COUNT(old.titelid) FROM reltitel WHERE titelid = old.titelid) = 0 AND old.titelid != 0
BEGIN
    DELETE FROM titel WHERE id = old.titelid;
END`;

sqr[45] = `CREATE TRIGGER if not exists clear_zeitschrift AFTER DELETE ON relzeitschrift
WHEN (SELECT COUNT(old.id) FROM relzeitschrift WHERE id = old.id) = 0 AND old.id != 0
BEGIN
    DELETE FROM zeitschrift WHERE id = old.id;
END`;

sqr[46] = `CREATE TRIGGER if not exists at_least_one_osg_exists AFTER DELETE ON sachgebiet
WHEN (SELECT MIN(id) FROM sachgebiet) IS NULL
BEGIN
    INSERT INTO sachgebiet (id, sachgebiet) VALUES (0, 'N.N.');
END`;

sqr[47] = `INSERT OR IGNORE INTO sachgebiet (id, sachgebiet) VALUES (0, 'N.N.')`;


//Zu jedem USG soll auch das OSG dem Medium zugehören
sqr[48] = `CREATE TRIGGER IF NOT EXISTS if_usg_also_osg AFTER INSERT ON relsachgebiet
WHEN new.sachgebietid%100 != 0
BEGIN
    INSERT OR IGNORE INTO relsachgebiet (objektid, sachgebietid) VALUES (new.objektid, (new.sachgebietid-new.sachgebietid%100));
END`;

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('src/db/ksbib.db', (err) => 
{
    if (err) { return console.log(err.message); }
});
    
function createDB () 
{
    console.log("create database");
    let i,n;
    for (i = 0; i < sqr.length; i++) {
        ( (i) => db.run(sqr[i], function(err) 
        { 
            if (err) {console.log(i + ' : ' + err.message); return false;} 
            else {return true;} 
        }) )(i); 
    }
}
function insertYears ()
{
    console.log("insert years");
    let n;
    let stmt = db.prepare("INSERT OR IGNORE INTO jahr VALUES (?,?)");
    for (n = 1000; n < 5001; n++) {
        stmt.run(n-999,n);
    }
    stmt.finalize();          
}
db.serialize( async () =>
{
    console.log("setup start");
    await createDB();
    await insertYears();
    db.close((err) => 
    {
        if (err) {return console.error(err.message);}
        console.log('setup end');
    });
});
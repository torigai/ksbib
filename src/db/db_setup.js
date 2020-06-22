/*  
    Erstellen und Auffüllen der Datenbank mit den ersten Beispiel-Einträgen 
    ACHTUNG: Die Einträge mit Index 0 dürfen nicht verändert werden !
*/

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
    isbn integer, check (length(isbn)=10 or length(isbn)=13), check (auflage >0 and auflage < 201))`;
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
    ort integer references ort, primary key (objektid, zeitschriftid, buchid, aufsatzid), 
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

sqr[18] = `create trigger if not exists trig_neuaufnahme after insert on objekt for each row 
begin 
    update objekt set aufnahmedatum = date('now'); 
    update objekt set sgn = ((select standortsgn from standort where standort.id = objekt.standort) || ' ' || objekt.id); 
end;`;

sqr[19] = "insert into medium (id, medium) values (0, NULL)";
sqr[20] = "insert into standort (id, standort, standortsgn) values (0, 'n.A.', 'n.A.')";
sqr[21] = "insert into jahr (id, jahr) values (0, NULL)";
sqr[22] = "insert into zeitschrift (id, journal, kuerzel) values (0, NULL, NULL)";
sqr[23] = "insert into ort (id, ort) values (0, NULL)";
sqr[24] = "insert into verlag (id, verlag) values (0, NULL)";
sqr[25] = "insert into autor (id, vorname, name) values (0, NULL, NULL)";
sqr[26] = "insert into titel (id, titel) values (0, NULL)";
sqr[27] = "insert into buch (id, auflage, verlag, isbn) values (0, NULL, NULL, NULL)";
sqr[28] = "insert into relzeitschrift (zeitschriftid, nr, id) values (0, NULL, 0)";
sqr[29] = "insert into stichwort (id, stichwort) values (0, NULL)";

sqr[30] = "insert into sachgebiet (id, sachgebiet) values (0, 'Architektur')";
sqr[31] = "insert into sachgebiet (id, sachgebiet) values (1, 'Theorie')";
sqr[32] = "insert into sachgebiet (id, sachgebiet) values (2, 'Methodik')";
sqr[33] = "insert into sachgebiet (id, sachgebiet) values (100, 'Geschichte')";
sqr[34] = "insert into medium (id, medium) values (1, 'Buch')";
//sqr[35] = "insert into medium (id, medium) values (2, 'Buchaufsatz')";
sqr[35] = "insert into standort (id, standort, standortsgn) values (1, 'Karstens Arbeitszimmer Süd Regal 2', 'KA-S-2')";
sqr[36] = "insert into standort (id, standort, standortsgn) values (2, 'Wohnzimmerregal West Regal-1 2', 'WR-W1-2')";
sqr[37] = "insert into ort (id, ort) values (1, 'Frankfurt a.M.')";
sqr[38] = "insert into ort (id, ort) values (2, 'Berlin')";
sqr[39] = "insert into verlag (id, verlag) values (1, 'Suhrkamp')";
sqr[40] = "insert into verlag (id, verlag) values (2, 'transcript')";
sqr[41] = "insert into autor (id, vorname, name) values (1, 'George', 'Kubler')";
sqr[42] = "insert into autor (id, vorname, name) values (2, 'Nadine', 'Haepke')";
sqr[43] = "insert into titel (id, titel) values (1, 'Die Form der Zeit')";
sqr[44] = "insert into titel (id, titel) values (2, 'Sakrale zeitlose Inszenierungen')";
sqr[45] = "insert into objekt (id, medium, standort, preis, band) values (1, 1, 1, '30', NULL)"; //aufnahmedatum und sgn durch den trigger
sqr[46] = "insert into objekt (id, medium, standort, preis, band) values (2, 1, 2, '15', NULL)"; //aufnahmedatum und sgn durch den trigger
sqr[47] = "insert into relsachgebiet (objektid, sachgebietid) values (1, 0)";
sqr[48] = "insert into relsachgebiet (objektid, sachgebietid) values (1, 1)";
sqr[49] = "insert into relsachgebiet (objektid, sachgebietid) values (2, 0)";
sqr[50] = "insert into relsachgebiet (objektid, sachgebietid) values (2, 2)";
sqr[51] = "insert into buch (id, auflage, verlag, isbn) values (1, 1, 1, 3518576054)";
sqr[52] = "insert into buch (id, auflage, verlag, isbn) values (2, 1, 1, 9783837662535)";
sqr[53] = `insert into relobjtyp (objektid, zeitschriftid, buchid, aufsatzid, 
    autortyp, hinweis, seiten, erscheinungsjahr, ort) values 
    (1,0,1,0,1, 'Anmerkung zur Geschichte der Dinge', NULL, 983, 1)`;
sqr[54] = `insert into relobjtyp (objektid, zeitschriftid, buchid, aufsatzid, 
    autortyp, hinweis, seiten, erscheinungsjahr, ort) values 
    (2,0,2,0,0, 'Dissertation Leibniz-Universität Hannover', NULL, 1014, 1)`;
sqr[55] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (1,0,1,0,1,0,1)";
sqr[56] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (2,0,2,0,2,0,1)";
sqr[57] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (1,0,1,0,1,1)";
sqr[58] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (2,0,2,0,2,1)";
sqr[59] = "insert into stichwort (id, stichwort) values (1, 'Dinge')";
sqr[60] = "insert into stichwort (id, stichwort) values (2, 'Kunst')";
sqr[61] = "insert into stichwort (id, stichwort) values (3, 'Pawson')";
sqr[62] = "insert into stichwort (id, stichwort) values (4, 'Zumthor')";
sqr[63] = "insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (1,0,1,0,1)";
sqr[64] = "insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (1,0,1,0,2)";
sqr[65] = "insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (2,0,2,0,3)";
sqr[66] = "insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (2,0,2,0,4)";

sqr[67] = "insert into titel (id, titel) values (3, 'Über Ikonen im Mittelalter')";
sqr[68] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (2,0,2,0,3,0,2)";
sqr[69] = "insert into medium (id, medium) values (2, 'Zeitschrift')";//3
//sqr[71] = "insert into medium (id, medium) values (4, 'Artikel')";
sqr[70] = "insert into medium (id, medium) values (3, 'Aufsatz')";//5
sqr[71] = "insert into medium (id, medium) values (4, 'CD')";

sqr[72] = "insert into titel (id, titel) values (4, 'Neuere Erkenntnisse')";
sqr[73] = "insert into objekt (id, medium, standort, preis, band) values (3, 2, 2, '7.30', NULL)";
sqr[74] = "insert into relsachgebiet (objektid, sachgebietid) values (3, 100)";
sqr[75] = "insert into relsachgebiet (objektid, sachgebietid) values (3, 101)";
sqr[76] = `insert into relobjtyp (objektid, zeitschriftid, buchid, aufsatzid, 
    autortyp, hinweis, seiten, erscheinungsjahr, ort) values 
    (3,1,0,0,0, 'Wissenschaft als Suche nach Wahrheit', NULL, 983, NULL)`;
sqr[77] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (3,1,0,0,4,0,1)";
sqr[78] = "insert into stichwort (id, stichwort) values (5, 'Wissenschaft')";
sqr[79] = "insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (3,1,0,0,5)";
sqr[80] = "insert into zeitschrift (id, journal, kuerzel) values (1, 'Soziologie Heute', 'Soz. Heute')";
sqr[81] = "insert into relzeitschrift (zeitschriftid, nr, id) values (1, 3, 1)";
sqr[82] = "insert into autor (id, vorname, name) values (3, 'Herrmann', 'Müller')";
sqr[83] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (2,0,2,0,3,2)";
sqr[84] = "insert into autor (id, vorname, name) values (4, 'Hermine', 'Bauer')";
sqr[85] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (2,0,2,0,4,3)";

// Buchaufsatz
sqr[86] = "insert into titel (id, titel) values (5, 'Dies ist ein Untertitel')";
sqr[87] = `insert into relobjtyp (objektid, zeitschriftid, buchid, aufsatzid, 
    autortyp, hinweis, seiten, erscheinungsjahr, ort) values 
    (1,0,1,1,0, 'test', '12-28', 983, 1)`;
sqr[88] = `insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (1,0,1,1,4)`;
sqr[89] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (1,0,1,1,3,1)";
sqr[90] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (1,0,1,1,5,1,1)";

//Zeitschriftartikel
sqr[91] = "insert into titel (id, titel) values (6, 'Dies ist der Titel eines Artikels')";
sqr[92] = `insert into relobjtyp (objektid, zeitschriftid, buchid, aufsatzid, 
    autortyp, hinweis, seiten, erscheinungsjahr, ort) values 
    (3,1,0,1,0, 'Zeitschriftartikel', '5-10', 980, NULL)`;
sqr[93] = `insert into relstichwort (objektid, zeitschriftid, buchid, aufsatzid, stichwortid) values (3,1,0,1,1)`;
sqr[94] = "insert into relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr) values (3,1,0,1,2,1)";
sqr[95] = "insert into reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) values (3,1,0,1,6,1,1)";

//Weitere Zeitschriften
sqr[96] = "insert into zeitschrift (id, journal, kuerzel) values (2, 'Soziologie Gestern', 'Soz. Gestern')";
sqr[97] = "insert into zeitschrift (id, journal, kuerzel) values (3, 'Mittelweg', 'Mittelweg')";
sqr[98] = "insert into zeitschrift (id, journal, kuerzel) values (4, 'Physik Journal', 'Phys. Journ.')";

//Views

sqr[99] = `CREATE VIEW media_view AS 
  SELECT objekt.id AS objektid, zeitschriftid, buchid, aufsatzid, 
    jahr, preis, band, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, 
    standortsgn, medium.medium, band, kuerzel AS zeitschrift, nr AS zeitschriftNr, 
    sgn, hinweis, status, ort, verlag
    FROM objekt 
    INNER JOIN medium ON medium.id = objekt.medium 
    INNER JOIN standort ON standort.id = objekt.standort 
    INNER JOIN ( 
        SELECT objektid, zeitschriftid, buchid, aufsatzid, 
        jahr, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, kuerzel, nr, hinweis, o AS ort, verlag
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

sqr[100] = `create trigger if not exists trig_update_sgn after update of standort on objekt for each row 
begin 
    update objekt set sgn = ((select standortsgn from standort where standort.id = objekt.standort) || ' ' || objekt.id); 
end;`;

//To avoid unused rows after delete on relational tables
sqr[101] = `CREATE TRIGGER clear_stichwort AFTER DELETE ON relstichwort
WHEN (SELECT COUNT(old.stichwortid) FROM relstichwort WHERE stichwortid = old.stichwortid) = 0 AND old.stichwortid != 0
BEGIN
    DELETE FROM stichwort WHERE id = old.stichwortid;
END;`;

sqr[102] = `CREATE TRIGGER clear_verlag AFTER DELETE ON buch
WHEN (SELECT COUNT(old.verlag) FROM buch WHERE verlag = old.verlag) = 0 AND old.verlag != 0
BEGIN
    DELETE FROM verlag WHERE id = old.verlag;
END;`;

sqr[103] = `CREATE TRIGGER clear_verlag2 AFTER UPDATE OF verlag ON buch
WHEN (SELECT COUNT(old.verlag) FROM buch WHERE verlag = old.verlag) = 0 AND old.verlag != 0
BEGIN
    DELETE FROM verlag WHERE id = old.verlag;
END;`;

sqr[104] = `CREATE TRIGGER clear_ort AFTER DELETE ON relobjtyp
WHEN (SELECT COUNT(old.ort) FROM relobjtyp WHERE ort = old.ort) = 0 AND old.ort != 0
BEGIN
    DELETE FROM ort WHERE id = old.ort;
END;`;

sqr[105] = `CREATE TRIGGER clear_ort2 AFTER UPDATE OF ort ON relobjtyp
WHEN (SELECT COUNT(old.ort) FROM relobjtyp WHERE ort = old.ort) = 0 AND old.ort != 0
BEGIN
    DELETE FROM ort WHERE id = old.ort;
END;`;

sqr[106] = `CREATE TRIGGER clear_autor AFTER DELETE ON relautor
WHEN (SELECT COUNT(old.autorid) FROM relautor WHERE autorid = old.autorid) = 0 AND old.autorid != 0
BEGIN
    DELETE FROM autor WHERE id = old.autorid;
END;`;

sqr[107] = `CREATE TRIGGER clear_titel AFTER DELETE ON reltitel
WHEN (SELECT COUNT(old.titelid) FROM reltitel WHERE titelid = old.titelid) = 0 AND old.titelid != 0
BEGIN
    DELETE FROM titel WHERE id = old.titelid;
END;`;

sqr[108] = `CREATE TRIGGER clear_zeitschrift AFTER DELETE ON relzeitschrift
WHEN (SELECT COUNT(old.id) FROM relzeitschrift WHERE id = old.id) = 0 AND old.id != 0
BEGIN
    DELETE FROM zeitschrift WHERE id = old.id;
END;`;

sqr[109] = `CREATE TABLE test (id INTEGER PRIMARY KEY, wert TEXT)`;
sqr[110] = `INSERT INTO test (id, wert) VALUES (0, NULL)`;

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
    let stmt = db.prepare("INSERT INTO jahr VALUES (?,?)");
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
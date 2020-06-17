/*  
    Erstellen und Auffüllen der Datenbank mit den ersten Beispiel-Einträgen 
    ACHTUNG: Die Einträge mit Index 0 dürfen nicht verändert werden !
*/

let sqr = [];

sqr[0] = `create table if not exists sachgebiet (id integer primary key, sachgebiet text not null, check (id < 9999))`;
sqr[1] = 'create table if not exists medium (id integer primary key, medium text)';
sqr[2] = 'create table if not exists standort (id integer primary key, standort text unique, standortsgn text unique)';
sqr[3] = 'create table if not exists jahr (id integer primary key, jahr integer unique, check (jahr > 999 and jahr < 3001))';
sqr[4] = 'create table if not exists zeitschrift (id integer primary key, journal text unique, kuerzel text unique)';
sqr[5] = 'create table if not exists ort (id integer primary key, ort text unique)';
sqr[6] = 'create table if not exists verlag (id integer primary key, verlag text unique)';
sqr[7] = 'create table if not exists autor (id integer primary key, vorname text, name text, unique(vorname, name))';
sqr[8] = 'create table if not exists titel (id integer primary key, titel text unique)';
sqr[9] = `create table if not exists objekt (id integer primary key, aufnahmedatum text, 
    medium integer references medium, 
    standort integer references standort, 
    sgn text unique, preis real, band integer, status integer default 0, 
    check (id > 0), check (status >= 0 AND status <= 2))`;
// status = 0 (vorhanden) = 1 (nicht vorhanden)
sqr[10] = `create table if not exists relsachgebiet 
    (objektid integer REFERENCES objekt ON DELETE CASCADE, 
    sachgebietid integer REFERENCES sachgebiet ON UPDATE CASCADE, 
    PRIMARY KEY (objektid, sachgebietid))`;
sqr[11] = `create table if not exists buch (id integer primary key, auflage integer, verlag integer references verlag, 
    isbn integer, check (length(isbn)=10 or length(isbn)=13), check (auflage >0 and auflage < 201))`;
sqr[12] = `create table if not exists relzeitschrift (zeitschriftid integer primary key, nr integer, 
    id integer references zeitschrift (id), unique(id, zeitschriftid))`;
sqr[13] = 'create table if not exists stichwort (id integer primary key, stichwort text unique)';
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
    aufsatzid integer, autorid integer references autor, autornr integer default 0, check (autornr > 0 and autornr < 11), 
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

sqr[100] = `CREATE TRIGGER delete_medium AFTER DELETE ON relobjtyp 
BEGIN
    DELETE FROM buch WHERE (id = old.buchid AND id != 0);
    DELETE FROM relzeitschrift WHERE (zeitschriftid = old.zeitschriftid AND id != 0);
END;`;

sqr[101] = `CREATE TRIGGER delete_verlag BEFORE DELETE ON buch
BEGIN
    DELETE FROM verlag WHERE (
        id != 0 AND 
        id = old.verlag AND 
        (SELECT COUNT(id) FROM buch WHERE verlag = old.verlag) = 1
    );
END;`;

sqr[102] = `CREATE TRIGGER delete_autor BEFORE DELETE ON relautor
BEGIN
    DELETE FROM autor WHERE (
        id != 0 AND 
        id = old.autorid AND 
        (SELECT COUNT(DISTINCT objektid) FROM relautor WHERE autorid = old.autorid) = 1
    );
END;`;

sqr[103] = `CREATE TRIGGER delete_stichwort BEFORE DELETE ON relstichwort
BEGIN
    DELETE FROM stichwort WHERE (
        id != 0 AND
        id = old.stichwortid AND
        (SELECT COUNT(DISTINCT objektid) FROM relstichwort WHERE stichwortid = old.stichwortid) = 1  
    );
END;`;

sqr[104] = `CREATE TRIGGER delete_zeitschrift BEFORE DELETE ON relzeitschrift
BEGIN
    DELETE FROM zeitschrift WHERE (
        zeitschrift.id != 0 AND
        zeitschrift.id = old.id AND
        (SELECT COUNT(id) FROM relzeitschrift WHERE id = old.id) = 1  
    );
END;`;

sqr[105] = `CREATE TRIGGER delete_titel BEFORE DELETE ON reltitel
BEGIN
    DELETE FROM titel WHERE (
        id != 0 AND
        id = old.titelid AND
        (SELECT COUNT(DISTINCT objektid) FROM reltitel WHERE titelid = old.titelid) = 1  
    );
END;`;

sqr[106] = `CREATE TRIGGER delete_ort BEFORE DELETE ON relobjtyp 
BEGIN
    DELETE FROM ort WHERE (
        id != 0 AND 
        id = old.ort AND
        (SELECT COUNT(DISTINCT objektid) FROM relobjtyp WHERE ort = old.ort) = 1);
END;`;

sqr[107] = `create trigger if not exists trig_update_sgn after update of standort on objekt for each row 
begin 
    update objekt set sgn = ((select standortsgn from standort where standort.id = objekt.standort) || ' ' || objekt.id); 
end;`;

/*
sqr[99] = `CREATE VIEW media_view AS 
  SELECT objekt.id AS objektid, zeitschriftid, buchid, aufsatzid, 
    jahr, preis, band, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, 
    standortsgn, medium.medium, band, kuerzel AS zeitschrift, nr AS zeitschriftNr, sgn, hinweis, status, verlag, ort
    FROM objekt 
    INNER JOIN medium ON medium.id = objekt.medium 
    INNER JOIN standort ON standort.id = objekt.standort 
    INNER JOIN ( 
        SELECT objektid, zeitschriftid, buchid, aufsatzid, 
        jahr, seiten, autortyp, autornr, autor, titelnr, titel, titeltyp, kuerzel, nr, hinweis, ort
        FROM relobjtyp 
        LEFT OUTER JOIN (
            SELECT id AS buchid, v AS verlag FROM buch
            LEFT OUTER JOIN (
                SELECT id AS i, verlag AS v FROM verlag
            ) ON buch.verlag = i
        ) USING (buchid)
        LEFT OUTER JOIN ( 
            SELECT objektid, zeitschriftid, buchid, aufsatzid, ort 
            autornr, name ||", "|| vorname as autor 
            FROM relautor 
            INNER JOIN autor id ON relautor.autorid = id 
        ) USING (objektid, zeitschriftid, buchid, aufsatzid) 
        LEFT OUTER JOIN jahr ON jahr.id = relobjtyp.erscheinungsjahr 
        LEFT OUTER JOIN ort ON ort.id = relobjtyp.ort
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
*/
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
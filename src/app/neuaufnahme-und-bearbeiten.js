    /*
        XHR Event Listener
    */

    onLoadenedXHR(
        async function ()
        {
            // create bFrm and fill up "standorte" select field and "id" field
            await cBFrmObj();
            cStandorteOptions(document.getElementById("standort"));
            bFrm.elements[0].value = await getMaxID(1);
        }
    )

    /*
        FORMULAR
    */

    let typeOfMedium;
    let aktion;
    // both get values in neuaufnahme.html and bearbeiten.html

    cBFrmObj = function () 
    { 
        document.getElementById("headerTitel").innerHTML = typeOfMedium + " " + aktion; 
        let bFrm = new cformular(
            document.getElementById("bFrm"), 
            document.getElementById("bFrmWarnFld"), 
            document.getElementById("outFld"), 
            document.getElementById("bOKBtn")
        );
        bFrm.elements[1].focus();
        bFrm.defaultSelectedIndex = bFrm.elements[1].selectedIndex;
        bFrm.noIn = bFrm.elements.length - 2;
        bFrm.onenter = function (event) {
            let frm = this;
            let txtLen = frm.textFld.length;
            let i = 0;
            function checkKey (event) {
                if (event.keyCode == 13 || event.which == 13) {
                    frm.sbmtBtn.click();
                } else {return;}
            }
            for (i = 1; i < txtLen + 1; i++) {
                frm.inFld[i].addEventListener("keypress", checkKey);
            }
        }
        bFrm.oninput = function ()
        {
            if (this.style.color == warnColor) {
                this.style.color = defaultColor;
            }
            if (selFrm.warnFld !== undefined) { selFrm.warnFld.innerHTML = ""; }
        }
        bFrm.newReset ( function () 
        {
            /*
                Abbrechen Button:
                alle Änderungen werden rückgängig gemacht
            */

            bFrm.warnFld.innerHTML = "";
            let i;
            for (i = 1; i < bFrm.noIn; i++) {
                switch (i) {
                    case 1: bFrm.elements[1].item(bFrm.defaultSelectedIndex).selected = true; break;
                    default: bFrm.elements[i].value = bFrm.elements[i].defaultValue;
                }
            }
        })
        bFrm.newSbmt(
            function () 
            {
                let warnung = bFrm.warnFld;
                let data;
                let elements = bFrm.elements;
                let zeitschriftkuerzelExistiert; 

                switch (typeOfMedium) {
                    case "Artikel" :
                        let a;
                        zeitschriftkuerzelExistiert = (elements.length == 18) ? true : false;
                        if (zeitschriftkuerzelExistiert) {
                            a = new artikel 
                            (
                                elements[0],     //objekt.ID
                                elements[1],     //standort.ID
                                elements[2],    //autoren
                                elements[3],    //titel des artikels
                                elements[4],    //journal
                                elements[6],           //zeitschriftkuerzel
                                elements[5],     //band
                                elements[7],     //nr
                                elements[8],     //jahr
                                elements[9],    //titel der zeitschrift
                                elements[10],    //preis
                                elements[11],   //seiten
                                elements[12],   //sgnr
                                elements[14],    //hinweis
                                elements[15]    //stichworte
                            );
                        } else {
                            a = new artikel 
                            (
                                elements[0],     //objekt.ID
                                elements[1],     //standort.ID
                                elements[2],    //autoren
                                elements[3],    //titel des artikels
                                elements[4],    //journal
                                "NULL",           //zeitschriftkuerzel
                                elements[5],     //band
                                elements[6],     //nr
                                elements[7],     //jahr
                                elements[8],    //titel der zeitschrift
                                elements[9],    //preis
                                elements[10],   //seiten
                                elements[11],   //sgnr
                                elements[13],    //hinweis
                                elements[14]    //stichworte
                            );
                        }
                        console.log(a);
                        
                        function conformAndValidateArticle(article) 
                        {
                            let articleConformed;
                            err = [];
                            if (zeitschriftkuerzelExistiert) {
                                articleConformed = {
                                    id: article.id,
                                    standort: article.standort,
                                    autoren: conformAndValidateAuthorArr(article.autoren, 2, false),
                                    titel: conformAndValidateTitle(article.titel, 3, true), 
                                    journal: conformAndValidateZeitschrift(article.journal, 4, true),
                                    zeitschriftkuerzel: conformAndValidateZeitschrift(article.zeitschriftkuerzel, 6, true),
                                    band: conformAndValidateNumber(article.band, 5, false),
                                    nr: conformAndValidateNumber(article.nr, 7, false),
                                    jahr: conformAndValidateYear(article.jahr, 8, false),
                                    zeitschrifttitel: conformAndValidateTitle(article.titel, 9, false),
                                    preis: conformAndValidateCosts(article.preis, 10, false),
                                    seiten: conformAndValidatePages(article.seiten, 11, false),
                                    sachgebietsnr: conformAndValidateSgnr(article.sachgebietsnr, 12, false),
                                    hinweis: conformAndValidateComment(article.hinweis, 14, false),
                                    stichworte: conformAndValidateKeywords(article.stichworte, 15, false)
                                };    
                            } else {
                                articleConformed = {
                                    id: article.id,
                                    standort: article.standort,
                                    autoren: conformAndValidateAuthorArr(article.autoren, 2, false),
                                    titel: conformAndValidateTitle(article.titel, 3, true), 
                                    journal: conformAndValidateZeitschrift(article.journal, 4, true),
                                    zeitschriftkuerzel: "NULL",
                                    band: conformAndValidateNumber(article.band, 5, false),
                                    nr: conformAndValidateNumber(article.nr, 6, false),
                                    jahr: conformAndValidateYear(article.jahr, 7, false),
                                    zeitschrifttitel: conformAndValidateTitle(article.titel, 8, false),
                                    preis: conformAndValidateCosts(article.preis, 9, false),
                                    seiten: conformAndValidatePages(article.seiten, 10, false),
                                    sachgebietsnr: conformAndValidateSgnr(article.sachgebietsnr, 11, false),
                                    hinweis: conformAndValidateComment(article.hinweis, 13, false),
                                    stichworte: conformAndValidateKeywords(article.stichworte, 14, false)
                                };
                            }
                            return articleConformed;
                        }                
                        data = conformAndValidateArticle(a);
                    break;

                    case "Zeitschrift" :
                        let z;
                        zeitschriftkuerzelExistiert = (elements.length == 16) ? true : false;

                        if (zeitschriftkuerzelExistiert) {
                            z = new zeitschrift (
                                elements[0],     //objekt.ID
                                elements[1],     //standort.ID
                                elements[2],    //autoren
                                elements[3],    //titel der zeitschrift
                                elements[4],    //journal
                                elements[6],    //zeitschriftkuerzel
                                elements[5],     //band
                                elements[7],     //nr
                                elements[8],     //jahr
                                elements[9],    //preis
                                elements[10],   //sgnr
                                elements[12],    //hinweis
                                elements[13]    //stichworte
                            );
                        } else {
                            z = new zeitschrift (
                                elements[0],     //objekt.ID
                                elements[1],     //standort.ID
                                elements[2],    //autoren
                                elements[3],    //titel der zeitschrift
                                elements[4],    //journal
                                "NULL",         //zeitschriftkuerzel
                                elements[5],     //band
                                elements[6],     //nr
                                elements[7],     //jahr
                                elements[8],    //preis
                                elements[9],   //sgnr
                                elements[11],    //hinweis
                                elements[12]    //stichworte
                            );
                        }
                        
                        function conformAndValidateJournal(journal) 
                        {
                            err = [];
                            let journalConformed;

                            if(zeitschriftkuerzelExistiert) {
                                journalConformed = {
                                    id: journal.id,
                                    standort: journal.standort,
                                    autoren: conformAndValidateAuthorArr(journal.autoren, 2, false),
                                    titel: conformAndValidateTitle(journal.titel, 3, true), 
                                    journal: conformAndValidateZeitschrift(journal.journal, 4, true),
                                    zeitschriftkuerzel: conformAndValidateZeitschrift(journal.zeitschriftkuerzel, 6, true),
                                    band: conformAndValidateNumber(journal.band, 5, false),
                                    nr: conformAndValidateNumber(journal.nr, 7, false),
                                    jahr: conformAndValidateYear(journal.jahr, 8, false),
                                    preis: conformAndValidateCosts(journal.preis, 9, false),
                                    sachgebietsnr: conformAndValidateSgnr(journal.sachgebietsnr, 10, false),
                                    hinweis: conformAndValidateComment(journal.hinweis, 12, false),
                                    stichworte: conformAndValidateKeywords(journal.stichworte, 13, false)
                                };
                            } else {
                                journalConformed = {
                                    id: journal.id,
                                    standort: journal.standort,
                                    autoren: conformAndValidateAuthorArr(journal.autoren, 2, false),
                                    titel: conformAndValidateTitle(journal.titel, 3, true), 
                                    journal: conformAndValidateZeitschrift(journal.journal, 4, true),
                                    zeitschriftkuerzel: "NULL",
                                    band: conformAndValidateNumber(journal.band, 5, false),
                                    nr: conformAndValidateNumber(journal.nr, 7, false),
                                    jahr: conformAndValidateYear(journal.jahr, 8, false),
                                    preis: conformAndValidateCosts(journal.preis, 9, false),
                                    sachgebietsnr: conformAndValidateSgnr(journal.sachgebietsnr, 10, false),
                                    hinweis: conformAndValidateComment(journal.hinweis, 12, false),
                                    stichworte: conformAndValidateKeywords(journal.stichworte, 13, false)
                                };
                            }
                            return journalConformed;
                        }
                        data = conformAndValidateJournal(z);
                    break;

                    case "Aufsatz" :
                        let as = new aufsatz (
                            elements[0],    //objekt.ID
                            elements[1],    //standort.ID
                            elements[2],    //autoren
                            elements[3],    //titel
                            elements[4],    //jahr
                            elements[5],    //ort
                            elements[6],    //seiten
                            elements[7],    //sachgebietsnr
                            elements[9],    //hinweis
                            elements[10]    //stichworte
                        )     
                        function conformAndValidateEssay(essay)
                        {
                            err = [];
                            let essayConformed = {
                                id: essay.id,
                                standort: essay.standort,
                                autoren: conformAndValidateAuthorArr(essay.autoren, 2, false),
                                titel: conformAndValidateTitle(essay.titel, 3, true),
                                jahr: conformAndValidateYear(essay.jahr, 4, false),
                                ort: conformAndValidateStr(essay.ort, 5, false, 500),
                                seiten: conformAndValidatePages(essay.seiten, 6, false),
                                sachgebietsnr: conformAndValidateSgnr(essay.sachgebietsnr, 7, false),
                                hinweis: conformAndValidateComment(essay.hinweis, 9, false),
                                stichworte: conformAndValidateKeywords(essay.stichworte, 10, false)
                            };
                            return essayConformed;
                        }  
                        data = conformAndValidateEssay(as);
                    break;

                    case "Buchaufsatz" :
                        let ba = new buchaufsatz (
                            elements[0],     //objekt.ID
                            elements[1],     //standort.ID
                            elements[2],    //autoren
                            elements[3],    //titel
                            elements[6],    //jahr
                            elements[7],     //ort
                            elements[8],    //verlag
                            elements[9],     //auflage
                            elements[10],     //band
                            elements[11],    //seiten
                            elements[12],   //isbn
                            elements[13],   //preis
                            elements[14],   //sgnr
                            elements[16],    //hinweis
                            elements[17],    //stichworte
                            elements[4],    //herausgeber
                            elements[5]    //buchtitel
                        );
                        function conformAndValidateBookessay(essay) 
                        {
                            err = [];
                            let essayConformed = {
                                id: essay.id,
                                standort: essay.standort,
                                autoren: conformAndValidateAuthorArr(essay.autoren, 2, false),
                                titel: conformAndValidateTitle(essay.titel, 3, true),
                                hrg: conformAndValidateAuthorArr(essay.hrg, 4, false),
                                buchtitel: conformAndValidateTitle(essay.buchtitel, 5, true),
                                jahr: conformAndValidateYear(essay.jahr, 6, false), 
                                ort: conformAndValidateStr(essay.ort, 7, false, 500),
                                verlag: conformAndValidateStr(essay.verlag, 8, false, 500),
                                auflage: conformAndValidateNumber(essay.auflage, 9, false),
                                band: conformAndValidateNumber(essay.band, 10, false),
                                seiten: conformAndValidatePages(essay.seiten, 11, false),
                                isbn: conformAndValidateISBN(essay.isbn, 12, false),
                                preis: conformAndValidateCosts(essay.preis, 13, false),
                                sachgebietsnr: conformAndValidateSgnr(essay.sachgebietsnr, 14, false),
                                hinweis: conformAndValidateComment(essay.hinweis, 16, false),
                                stichworte: conformAndValidateKeywords(essay.stichworte, 17, false)
                            };
                            return essayConformed;
                        }  
                        data = conformAndValidateBookessay(ba);
                    break;

                    default :                   //typeOfMedium = "Buch"
                        let b = new buch (
                            elements[0],     //objekt.ID
                            elements[1],     //standort.ID
                            elements[2],    //autoren
                            elements[3],    //autortyp
                            elements[4],    //titel
                            elements[5],    //jahr
                            elements[6],     //ort
                            elements[7],    //verlag
                            elements[8],     //auflage
                            elements[9],     //band
                            elements[10],    //seiten
                            elements[11],   //isbn
                            elements[12],   //preis
                            elements[13],   //sgnr
                            elements[15],    //hinweis
                            elements[16]    //stichworte
                        );
                        function conformAndValidateBook(book) 
                        {
                            err = [];
                            let bookConformed = {
                                id: book.id.value,
                                standort: book.standort.options[book.standort.selectedIndex].value,
                                autoren: conformAndValidateAuthorArr(book.autoren, 2, false), //Arr[0]: name, vorname
                                autortyp: book.autortyp.value,
                                titel: conformAndValidateTitle(book.titel, 4, true), //Arr[0]: titel1 ...
                                jahr: conformAndValidateYear(book.jahr, 5, false), 
                                ort: conformAndValidateStr(book.ort, 6, false, 500),
                                verlag: conformAndValidateStr(book.verlag, 7, false, 500),
                                auflage: conformAndValidateNumber(book.auflage, 8, false),
                                band: conformAndValidateNumber(book.band, 9, false),
                                seiten: conformAndValidatePages(book.seiten, 10, false),
                                isbn: conformAndValidateISBN(book.isbn, 11, false),
                                preis: conformAndValidateCosts(book.preis, 12, false),
                                sachgebietsnr: conformAndValidateSgnr(book.sachgebietsnr, 13, false),
                                hinweis: conformAndValidateComment(book.hinweis, 15, false),
                                stichworte: conformAndValidateKeywords(book.stichworte, 16, false)
                            };
                            return bookConformed;
                        }  
                        data = conformAndValidateBook(b);
                        console.log(data);
                }
                if (err.length !== 0) {
                    let firstError = err[0].split("*");
                    elements[firstError[0]].style.color = warnColor;
                    elements[firstError[0]].select();
                    warnung.innerHTML = firstError[1];
                    return false;
                } else {
                    (async () => 
                    {
                        await sqlNewBook(data).then();
                        bFrm.reset();
                    })();
                    return true;
                }
            }
        )

        bFrm.sbmtBtn.addEventListener("click", bFrm.sbmt);
        bFrm.btn[1].addEventListener("click",bFrm.reset);
        bFrm.onenter(event);
        for (i = 1; i < bFrm.noIn; i++) {
            bFrm.elements[i].addEventListener("input", bFrm.oninput); 
        }
    }

    /*
        In formular-zeitschrift.html und formular-artikel.html:

        Automatische Erkennung ob ein Eintrag für "Zeitschrift" existiert. Falls nein, soll auch ein
        Zeitschriftkürzel hinzugefügt werden können. Entsprechend wird ein Inputfeld (bei focusout) 
        angehängt
    */
    
    function appendKuerzelInput (tblIndex, rowIndex, maxNoElements)
    {
        let zeitschriftkuerzelExistiert = (bFrm.elements.length == maxNoElelents) ? true : false;
     
        function addKuerzelFld () {
            if (zeitschriftkuerzelExistiert) { return false; }

            function checkKey (event) {
               if (event.keyCode == 13 || event.which == 13) {
                    document.getElementById("bOKBtn").click();
                    return true;
                } else { return false; }
            }

            let parent = document.getElementsByClassName("rTableBody")[tblIndex];
            let row = document.createElement("div");
            row.setAttribute("class", "rTableRow");
            let cell = document.createElement("div");
            cell.setAttribute("class", "rTableCell left");
            let label = document.createElement("label");
            label.innerHTML = "Zeitschriftkürzel";
            let br = document.createElement("br");
            let input = document.createElement("input");
            input.addEventListener("input", bFrm.oninput); 
            input.addEventListener("keypress", checkKey);
            input.setAttribute("type", "text");
            input.setAttribute("class", "txt");
            input.setAttribute("name", "Zeitschriftkurzel");
            input.setAttribute("size", "25");
            input.setAttribute("value", "");
            cell.appendChild(label);
            cell.appendChild(br);
            cell.appendChild(input);
            row.appendChild(cell);
            parent.insertBefore(row, parent.children[rowIndex]);
            return true;
        }
    }

    /*
        SQL
    */

    function sqlNewBook (data)
    {
        let i, sql = [], sqr = [], autorenArr = []; 

        sqr[0] = `SELECT MAX(id) AS id FROM buch`;
        sqr[1] = `SELECT id AS jahrid FROM jahr WHERE jahr = ?`;
        sqr[2] = `INSERT OR IGNORE INTO ort (id, ort) VALUES (NULL, ?)`;
        sqr[3] = `INSERT INTO objekt (id, medium, standort, preis, band, status) 
            VALUES (?, 1, ?, ?, ?, 0)`;
        sqr[4] = `INSERT INTO relobjtyp 
            (objektid, zeitschriftid, buchid, aufsatzid, autortyp, hinweis, seiten, erscheinungsjahr)
            VALUES (?, 0, ?, 0, ?, ?, ?, ?)`;
        sqr[5] = `INSERT OR IGNORE INTO verlag (id, verlag) VALUES (NULL, ?)`;

        sql[0] = `INSERT OR IGNORE INTO stichwort (id, stichwort) VALUES (NULL, ?)`;
        sql[1] = `INSERT INTO relstichwort (objektid, stichwortid) VALUES (?, ?)`;
        sql[2] = `INSERT OR IGNORE INTO autor (id, name, vorname) VALUES (NULL, ?, ?)`;
        sql[3] = `INSERT INTO relautor (objektid, zeitschriftid, buchid, aufsatzid, autorid, autornr)
            VALUES (?, 0, ?, 0, ?, ?)`;
        sql[4] = `INSERT OR IGNORE INTO titel (id, titel) VALUES (NULL, ?)`;
        sql[5] = `INSERT INTO reltitel (objektid, zeitschriftid, buchid, aufsatzid, titelid, titeltyp, titelnr) 
            VALUES (?, 0, ?, 0, ?, 0, ?)`;

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
                                db.run(sql[1], [data.id, row.id], function (err) {console.log(err.message)});
                                return true;
                            }
                        );
                    }
                );
                })(i);
            }   
        }
        function autorInsertions (bid)
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
                                db.run(sql[3], [data.id, bid, row.id, i+1], function (err) 
                                {
                                    if (err) {console.log(err.message)}
                                });
                                return true;
                            }
                        );
                    }
                );
                })(i);
            }   
        }
        function titelInsertions (bid)
        {
            for (i=0; i < data.titel.length; i++) { 
            ((i) => {
                db.run(sql[4], [data.titel[i]], function (err)
                {
                    if (err) {return console.log(err.message);} 
                    db.get(`SELECT id FROM titel WHERE titel = ?`, [data.titel[i]], 
                        function (err, row) 
                        {
                            if (err) {console.log(err.message);}
                            db.run(sql[5], [data.id, bid, row.id, i+1], function (err) 
                                {
                                    if (err) {console.log(err.message);}
                                }
                            );
                        }
                    );
                });
            })(i);
            }
        }

        db.get(sqr[0], [], function (err, row)
        {
            //console.log("1");
            if (err) {console.log(err.message);}
            let buchid = row.id + 1;

            if (data.ort !== null) {
                db.run(sqr[2], [data.ort], (err) => 
                    {
                        if (err) {
                            console.log(err.message);
                        } 
                        //console.log("1.1");
                    } );
            }
            db.run(sqr[3], [data.id, data.standort, data.preis, data.band], (err) => 
                {
                    if (err) {console.log(err.message);} 
                    //console.log("1.2");
                } );
            //let j;
            for (i=0; i<data.sachgebietsnr.length; i++) {
                ((i) => 
                {
            //        j = i + 2;
                    db.run(`INSERT INTO relsachgebiet (objektid, sachgebietid) VALUES (?, ?)`, 
                        [data.id, data.sachgebietsnr[i]], (err) => 
                        {
                            if (err) {console.log(err.message);} 
                        //    console.log("1."+j);
                        });
                })(i);
            }

            db.get(sqr[1], [data.jahr], function (err, row)
            {
                //console.log("2");
                if (err) {console.log(err.message); return false}
                let jahrid = (row === undefined) ? null : row.jahrid;

                db.run(sqr[4], [data.id, buchid, data.autortyp, data.hinweis, data.seiten, jahrid], (err) => 
                    {
                        if (err) {console.log(err.message);} 
                        //console.log("2.1");
                    });
                if (data.stichworte !== null) {stichwortInsertions();}
                if (data.autoren !== null) {autorInsertions(buchid);}
                titelInsertions(buchid); // data.titel is never null
                db.run(sqr[5], [data.verlag], function (err)
                {
                    //console.log("3");
                    if (err) {console.log(err.message);}
                    db.get(`SELECT id AS verlagid FROM verlag WHERE verlag = ?`, [data.verlag], function (err, row)
                    {
                       // console.log("4");
                        if (err) {console.log(err.message);}
                        let verlagid = (row === undefined) ? null : row.verlagid;

                        db.get(`SELECT id AS ortid FROM ort WHERE ort = ?`, [data.ort], function (err, row)
                        {
                        //    console.log("5");
                            if (err) {console.log(err.message);}
                            let ortid = (row === undefined) ? null : row.ortid;
                            
                            db.run(`INSERT INTO buch (id, auflage, ort, verlag, isbn) 
                                VALUES (?, ?, ?, ?, ?)`, [buchid, data.auflage, ortid, verlagid, data.isbn], function (err) 
                            {
                                if (err) {console.log(err.message);}
                            /*    console.log("6");
                                db.get(`SELECT * FROM media_view WHERE objektid = ?`, [data.id], function (err, row)
                                {
                                    if (err) {console.log(err.message);}
                                    console.log(row);
                                });
                            */
                            });
                        });
                    });
                });
                
            });
        });
    }

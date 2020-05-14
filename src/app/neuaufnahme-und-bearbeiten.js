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
        bFrm.onfocusoutSachgebiet = async function ()
        {
            let sgnrTextarea = document.getElementsByName("sachgebietsnr")[0];
            let sgTextarea = document.getElementsByName('sachgebiete')[0];
            sgnrTextarea.style.color = defaultColor;
            let sgArr = [];
            function testSgnr (sgnr)
            {
                let x = strtrim(sgnr);
                if (sachgebietsnrPattern.test(x) == false) {
                    bFrm.warnFld.innerHTML = message[2];
                    sgnrTextarea.style.color = warnColor;
                    sgnrTextarea.focus();
                    return false;
                }
                if (x > 29999) {
                    bFrm.warnFld.innerHTML = message[1]("29'999");
                    sgnrTextarea.style.color = warnColor;
                    sgnrTextarea.focus();
                    return false;
                }
                return x;
            }

            let sgnrArr = document.getElementsByName("sachgebietsnr")[0]
                .value.split("\n").filter(stringNotEmpty).filter(onlyUnique).map(testSgnr);
            sgnrArr.sort();
            
            let promises = [];
            let i;
            for (i=0; i<sgnrArr.length; i++) {
                ((i) => {
                    promises.push(new Promise ((resolve, reject)=>
                    {
                        db.get(`SELECT sachgebiet FROM sachgebiet WHERE id = ?`, [sgnrArr[i]], (err, row) =>
                        {
                            if (err) {reject(err);}
                            let osg = ( sgnrArr[i] === 0 || Number.isInteger(sgnrArr[i]/100) ) ? "OSG - " : "USG - ";
                            resolve(sgArr[i] = osg + row.sachgebiet);
                        }); 
                    }));
                })(i);
            }
            await Promise.all(promises).catch(console.error);
            
            sgnrTextarea.value = sgnrArr.join("\n");
            sgTextarea.innerHTML = sgArr.join("\n");
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
                    case 17: bFrm.elements[17].item(bFrm.defaultSelectedIndex).selected = true; break;
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
                        z = new zeitschrift (
                            elements[0],     //objekt.ID
                            elements[1],     //standort.ID
                            elements[2],    //autoren
                            elements[3],    //titel der zeitschrift
                            elements[4],    //journal
                            elements[7],    //zeitschriftkuerzel
                            elements[6],     //band
                            elements[8],     //nr
                            elements[9],     //jahr
                            elements[10],    //preis
                            elements[11],   //sgnr
                            elements[13],    //hinweis
                            elements[14],    //stichworte
                            elements[15]    //status
                        );
                        
                        function conformAndValidateJournal(journal) 
                        {
                            err = [];
                            let journalConformed;
                            journalConformed = {
                                id: journal.id,
                                standort: journal.standort.options[journal.standort.selectedIndex].value,
                                autoren: conformAndValidateAuthorArr(journal.autoren, 2, false),
                                titel: conformAndValidateTitle(journal.titel, 3, true), 
                                journal: conformAndValidateZeitschrift(journal.journal, 4, true),
                                zeitschriftkuerzel: conformAndValidateZeitschrift(journal.zeitschriftkuerzel, 7, true),
                                band: conformAndValidateNumber(journal.band, 6, false),
                                nr: conformAndValidateNumber(journal.nr, 8, false),
                                jahr: conformAndValidateYear(journal.jahr, 9, false),
                                preis: conformAndValidateCosts(journal.preis, 10, false),
                                sachgebietsnr: conformAndValidateSgnr(journal.sachgebietsnr, 11, false),
                                hinweis: conformAndValidateComment(journal.hinweis, 13, false),
                                stichworte: conformAndValidateKeywords(journal.stichworte, 14, false),
                                status: journal.status.value
                            };
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
                            elements[16],    //stichworte
                            elements[17],   //status
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
                                stichworte: conformAndValidateKeywords(book.stichworte, 16, false),
                                status: book.status.value
                            };
                            return bookConformed;
                        }  
                        data = conformAndValidateBook(b);
                }
                if (err.length !== 0) {
                    let firstError = err[0].split("*");
                    elements[firstError[0]].style.color = warnColor;
                    elements[firstError[0]].select();
                    warnung.innerHTML = firstError[1];
                    return false;
                } else {
                    let confirm = window.confirm("Neues Medium speichern?");
                    if (confirm == true) {
                        async function callback (errArr) 
                        {
                            console.log("callback");
                            if (errArr.length === 0) {
                                bFrm.reset();
                                let x = await getMaxID(1);
                                return bFrm.elements[0].value = x;
                            } else {
                                warnung.innerHTML = "Das Medium konnte nicht gespeichert werden";
                            } 
                        }
                        switch (typeOfMedium) {
                            case "Buch": sqlNewBook(data, callback); break;
                            case "Zeitschrift": sqlNewZeitschrift(data, callback); break;
                        }
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        )

        bFrm.sbmtBtn.addEventListener("click", bFrm.sbmt);
        bFrm.btn[1].addEventListener("click",bFrm.reset);
        bFrm.onenter(event);
        for (i = 1; i < bFrm.noIn; i++) {
            bFrm.elements[i].addEventListener("input", bFrm.oninput); 
        }
        document.getElementsByName('sachgebietsnr')[0].addEventListener("focusout", bFrm.onfocusoutSachgebiet);
    }

    function insertZeitschriftkuerzelIfExists (journal) 
    {
        let kuerzel = document.getElementsByName("zeitschriftkuerzel")[0];

        if (journal !== "") {
            db.get(`SELECT kuerzel FROM zeitschrift WHERE journal = '${journal}'`, [], (err, row) =>
            {
                if (err) {console.log(err.message);}
                if (row !== undefined) {
                    kuerzel.value = row.kuerzel;
                    kuerzel.readOnly = true;
                    kuerzel.tabIndex = -1;
                } else {
                    kuerzel.value = "";
                    kuerzel.readOnly = false;
                    kuerzel.tabIndex = "";
                }
            });
        } else {
            kuerzel.value = "";
            kuerzel.readOnly = false;
            kuerzel.tabIndex = "";
        }
    }

    /*
        SQL
    */

    async function sqlNewBook (data, callback)
    {
        let i, autorenArr = []; 
        let warn = document.getElementById("bFrmWarnFld");
        let errArr = [];
        let promises = [];
/*
        function stichwortInsertions ()
        {
            for (i=0; i < data.stichworte.length; i++) { 
                ((i) => { 
                db.run(sql[6], [data.stichworte[i]], function (err)
                {
                    if (err) {errArr.push(err.message); return callback(errArr);} 
                    else {
                        db.get(sql[12], [data.stichworte[i]], function (err, row) 
                        {
                            if (err) {errArr.push(err.message); return callback(errArr);}
                            else {
                                db.run(sql[7], [data.id, row.id], function (err)
                                {
                                    if (err) {errArr.push(err.message); return callback(errArr);}
                                    else {console.log("stichwort " + i + " inserted");}
                                });}
                        });
                    }
                });
                })(i);
            }   
        }
        function autorInsertions (bid)
        {
            for (i=0; i < data.autoren.length; i++) { 
                ((i) => {
                    if (data.autoren[i].includes(",")) {
                        autorenArr = data.autoren[i].split(",").map(strtrim);
                    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                        autorenArr = [data.autoren.toString(), ""];
                    }
                    db.run(sql[8], [autorenArr[0], autorenArr[1]], function (err)
                    {
                        if (err) {errArr.push(err.message); return callback(errArr);} 
                        else {
                            db.get(sql[13], [autorenArr[0], autorenArr[1]], function (err, row) 
                            {
                                if (err) {errArr.push(err.message); return callback(errArr);}
                                else {
                                    let autorid = row.id;
                                    db.run(sql[9], [data.id, 0, bid, 0, autorid, i+1], function (err)
                                    {
                                        if (err) {errArr.push(err.message); return callback(errArr);}
                                        else {return console.log("autor " + i + " inserted");}
                                    });
                                }
                            });
                        }
                    });
                })(i);
            }   
        }
        function titelInsertions (bid)
        {
            for (i=0; i < data.titel.length; i++) { 
            ((i) => {
                db.run(sql[10], [data.titel[i]], function (err)
                {
                    if (err) {errArr.push(err.message); return callback(errArr);}
                    else { 
                        db.get(sql[14], [data.titel[i]], function (err, row) 
                        {
                            if (err) {errArr.push(err.message); return callback(errArr);}
                            else {
                                let titelid = row.id;
                                db.run(sql[11], [data.id, 0, bid, 0, titelid, 0, i+1], function (err)
                                {
                                    if (err) {errArr.push(err.message); return callback(errArr);}
                                    else {return console.log("titel " + i + " inserted");}
                                });
                            }
                        });
                    }
                });
            })(i);
            }
        }
    */

        function getBuchid () 
        {
            return new Promise((resolve, reject) =>
            {
                db.all(sql[0], [], function (err, row)
                {
                if (err) {
                    errArr.push(err.message); 
                    reject(errArr);
                } else { 
                    let buchid = row.id + 1;
                    resolve(buchid);
                }
                });
            });
        }

        function sqlPromises (buchid) 
        {
            promises.push(new Promise((resolve, reject) =>
            {
                db.run(sql[3], [data.id, 1, data.standort, data.preis, data.band, data.status], function (err)
                {
                    if (err) {
                        errArr.push(err.message); 
                        console.log("errArr[0]");
                        reject(errArr);
                    } else {
                        resolve("objekt inserted");
                    }
                });
            }));
            if (data.ort !== null) {
                promises.push(new Promise ((resolve, reject) =>
                {
                    db.run(sql[2], [data.ort], function (err)
                    {
                        if (err) {
                            errArr.push(err.message); 
                            console.log("errArr[0]");
                            reject(errArr);
                        } else {
                            resolve("Ort inserted");
                        }
                    });
                }));
            }
            if (data.sachgebietsnr !== null) {
                for (i=0; i<data.sachgebietsnr.length; i++) {
                    ((i) => 
                    {
                        promises.push(new Promise ((resolve, reject) =>
                        {
                            db.run(sql[15], [data.id, data.sachgebietsnr[i]], function (err)
                            {
                                if (err) {
                                    errArr.push(err.message); 
                                    console.log("errArr[0]");
                                    reject(errArr);
                                } else {
                                    resolve("relsachgebiet " + i + " inserted");
                                }
                            });
                        }));
                    })(i);
                }
            }
            if (data.stichworte !== null) {
                for (i=0; i < data.stichworte.length; i++) { 
                    ((i) => { 
                        promises.push(new Promise ((resolve, reject) =>
                        {
                            db.run(sql[6], [data.stichworte[i]], function (err)
                            {
                                if (err) {
                                    errArr.push(err.message);
                                    reject(errArr);
                                } else {
                                    db.get(sql[12], [data.stichworte[i]], function (err, row) 
                                    {
                                        if (err) {
                                            errArr.push(err.message); 
                                            reject(errArr);
                                        } else {
                                            db.run(sql[7], [data.id, row.id], function (err)
                                            {
                                                if (err) {
                                                    errArr.push(err.message); 
                                                    reject(errArr);
                                                } else {
                                                    resolve("stichwort " + i + " inserted");
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }));
                    })(i);
                }
            }
            if (data.autoren !== null) {
                for (i=0; i < data.autoren.length; i++) { 
                    ((i) => {
                        promises.push(new Promise ((resolve, reject) => 
                        {
                            if (data.autoren[i].includes(",")) {
                                autorenArr = data.autoren[i].split(",").map(strtrim);
                            } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                                autorenArr = [data.autoren.toString(), ""];
                            }
                            db.run(sql[8], [autorenArr[0], autorenArr[1]], function (err)
                            {
                                if (err) {
                                    errArr.push(err.message); 
                                    reject(errArr);
                                } else {
                                    db.get(sql[13], [autorenArr[0], autorenArr[1]], function (err, row) 
                                    {
                                        if (err) {
                                            errArr.push(err.message); 
                                            reject(errArr);
                                        } else {
                                            let autorid = row.id;
                                            db.run(sql[9], [data.id, 0, buchid, 0, autorid, i+1], function (err)
                                            {
                                                if (err) {
                                                    errArr.push(err.message); 
                                                    reject(errArr);
                                                } else {
                                                    resolve("autor " + i + " inserted");
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }));
                    })(i);
                }
            }
            for (i=0; i < data.titel.length; i++) { 
                ((i) => {
                    promises.push(new Promise ((resolve, reject) =>
                    {  
                        db.run(sql[10], [data.titel[i]], function (err)
                        {
                            if (err) {
                                errArr.push(err.message); 
                                reject(errArr);
                            } else { 
                                db.get(sql[14], [data.titel[i]], function (err, row) 
                                {
                                    if (err) {
                                        errArr.push(err.message); 
                                        reject(errArr);
                                    } else {
                                        let titelid = row.id;
                                        db.run(sql[11], [data.id, 0, buchid, 0, titelid, 0, i+1], function (err)
                                        {
                                            if (err) {
                                                errArr.push(err.message); 
                                                reject(errArr);
                                            } else {
                                                resolve("titel " + i + " inserted");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }));
                })(i);
            }
            promises.push(new Promise ((resolve, reject) =>
            {
                db.get(sql[1], [data.jahr], function (err, row)
                {
                    if (err) {
                        errArr.push(err.message); 
                        reject(errArr);
                    } else {
                        let jahrid = (row === undefined) ? null : row.jahrid;
                        db.run(sql[4], [data.id, 0, buchid, 0, data.autortyp, data.hinweis, data.seiten, jahrid], function (err)
                        {
                            if (err) {
                                errArr.push(err.message); 
                                reject(errArr);
                            } else {
                                resolve("relobjtyp inserted");
                            }
                        });
                    }
                });
            }));
            promises.push(new Promise ((resolve, reject) => 
            {
                db.run(sql[5], [data.verlag], function (err)
                {
                    if (err) {
                        errArr.push(err.message); 
                        reject(errArr);
                    } else {
                        db.get(sql[16], [data.verlag], function (err, row)
                        {
                            if (err) {
                                errArr.push(err.message); 
                                reject(errArr);
                            } else {
                                let verlagid = (row === undefined) ? null : row.verlagid;
                                db.get(sql[17], [data.ort], function (err, row)
                                {
                                    if (err) {
                                        errArr.push(err.message); 
                                        reject(errArr);
                                    } else {
                                        let ortid = (row === undefined) ? null : row.ortid;   
                                        db.run(sql[18], [buchid, data.auflage, ortid, verlagid, data.isbn], function (err) 
                                        {
                                            if (err) {
                                                errArr.push(err.message); 
                                                reject(errArr);
                                            } else {
                                                resolve("buch inserted");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }));
        }

        db.serialize( () => {
            db.run(`BEGIN TRANSACTION`);
            getBuchid()
                .then(buchid => {console.log(promises); return sqlPromises(buchid)})
                .then(() => {return Promise.all(promises)})
                .then((result)=> {console.log(result); db.run(`COMMIT`); callback(errArr);})
                .catch((error) => {console.log(error); db.run(`ROLLBACK`); callback(errArr);});
        });

        /*
        db.serialize( () => {
        db.run(`BEGIN TRANSACTION`);
        db.get(sql[0], [], function (err, row)
        {
            if (err) {errArr.push(err.message); return callback(errArr);}
            else { 
                let buchid = row.id + 1;
                db.run(sql[3], [data.id, 1, data.standort, data.preis, data.band, data.status], function (err)
                {
                    if (err) {errArr.push(err.message); return callback(errArr);}
                    else {return console.log("objekt inserted");}
                });
                if (data.ort !== null) {
                    db.run(sql[2], [data.ort], function (err)
                    {
                        if (err) {errArr.push(err.message); return callback(errArr);}
                        else {return console.log("Ort inserted");}
                    });
                }
                if (data.sachgebietsnr !== null) {
                    for (i=0; i<data.sachgebietsnr.length; i++) {
                        ((i) => 
                        {
                            db.run(sql[15], [data.id, data.sachgebietsnr[i]], function (err)
                            {
                                if (err) {errArr.push(err.message); return callback(errArr);}
                                else {return console.log("relsachgebiet " + i + " inserted");}
                            });
                        })(i);
                    }
                }
                if (data.stichworte !== null) {stichwortInsertions();}
                if (data.autoren !== null) {autorInsertions(buchid);}
                titelInsertions(buchid); // data.titel is never null
                db.get(sql[1], [data.jahr], function (err, row)
                {
                    if (err) {errArr.push(err.message); return callback(errArr);}
                    else {
                        let jahrid = (row === undefined) ? null : row.jahrid;
                        db.run(sql[4], [data.id, 0, buchid, 0, data.autortyp, data.hinweis, data.seiten, jahrid], function (err)
                        {
                            if (err) {errArr.push(err.message); return callback(errArr);}
                            else {return console.log("relobjtyp inserted");}
                        });
                    }
                });
                db.run(sql[5], [data.verlag], function (err)
                {
                    if (err) {errArr.push(err.message); return callback(errArr);}
                    else {
                        db.get(sql[16], [data.verlag], function (err, row)
                        {
                            if (err) {errArr.push(err.message); return callback(errArr);}
                            else {
                                let verlagid = (row === undefined) ? null : row.verlagid;
                                db.get(sql[17], [data.ort], function (err, row)
                                {
                                    if (err) {errArr.push(err.message); return callback(errArr);}
                                    else {
                                        let ortid = (row === undefined) ? null : row.ortid;   
                                        db.run(sql[18], [buchid, data.auflage, ortid, verlagid, data.isbn], function (err) 
                                        {
                                            if (err) {errArr.push(err.message); return callback(errArr);} 
                                            else {
                                                console.log("buch inserted");
                                                return callback(errArr);
                                             
                                                db.get(`SELECT * FROM media_view WHERE objektid = ?`, [data.id], function (err, row)
                                                {
                                                    if (err) {console.log(err.message);}
                                                    else {
                                                        console.log(row);
                                                        return callback(errArr); 
                                                    }
                                                });
                                            
                                            //return callback(errArr);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            };
        })});
    */
    }

function sqlNewZeitschrift (data, callback)
    {
        let i, autorenArr = []; 

        function stichwortInsertions ()
        {
            for (i=0; i < data.stichworte.length; i++) { 
                ((i) => { 
                db.run(sql[6], [data.stichworte[i]], 
                    function (err)
                    {
                        if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;} 
                        db.get(sql[12], [data.stichworte[i]], 
                            function (err, row) 
                            {
                                if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;}
                                db.run(sql[7], [data.id, row.id], rollback);
                                return true;
                            }
                        );
                    }
                );
                })(i);
            }   
        }
        function autorInsertions (zid)
        {
            for (i=0; i < data.autoren.length; i++) { 
                ((i) => {
                if (data.autoren[i].includes(",")) {
                    autorenArr = data.autoren[i].split(",").map(strtrim);
                } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                    autorenArr = [data.autoren.toString(), ""];
                }
                db.run(sql[8], [autorenArr[0], autorenArr[1]], 
                    function (err)
                    {
                        if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;} 
                        db.get(sql[13], [autorenArr[0], autorenArr[1]], 
                            function (err, row) 
                            {
                                if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;}
                                let autorid = row.id;
                                db.run(sql[9], [data.id, zid, 0, 0, autorid, i+1], rollback);
                                return true;
                            }
                        );
                    }
                );
                })(i);
            }   
        }
        function titelInsertions (zid)
        {
            for (i=0; i < data.titel.length; i++) { 
            ((i) => {
                db.run(sql[10], [data.titel[i]], function (err)
                {
                    if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;} 
                    db.get(sql[14], [data.titel[i]], 
                        function (err, row) 
                        {
                            if (err) {console.log(err.message); db.run(`ROLLBACK`); return false;}
                            let titelid = row.id;
                            db.run(sql[11], [data.id, zid, 0, 0, titelid, 0, i+1], rollback);
                        }
                    );
                });
            })(i);
            }
        }

        db.serialize( () => {
        db.run(`BEGIN TRANSACTION`);
        db.get(sql[20], [], function (err, row)
        {
            if (err) {console.log(err.message); return false;}
            let zeitschriftid = row.id + 1;
            console.log("zid: "+ zeitschriftid);
            db.run(sql[3], [data.id, 3, data.standort, data.preis, data.band, data.status], rollback);
            db.run(sql[21], [data.journal, data.zeitschriftkuerzel], rollback);
            for (i=0; i<data.sachgebietsnr.length; i++) {
                ((i) => 
                {
                    db.run(sql[15], [data.id, data.sachgebietsnr[i]], rollback);
                })(i);
            }
            db.get(sql[1], [data.jahr], function (err, row)
            {
                if (err) {console.log(err.message); db.run(`ROLLBACK`); return false}
                let jahrid = (row === undefined) ? null : row.jahrid;
                console.log("jahrid: " + jahrid);
                db.run(sql[4], [data.id, zeitschriftid, 0, 0, 1, data.hinweis, data.seiten, jahrid], rollback);
                if (data.stichworte !== null) {stichwortInsertions();}
                if (data.autoren !== null) {autorInsertions(zeitschriftid);}
                titelInsertions(zeitschriftid); // data.titel is never null
                db.get(sql[22], [data.journal], function (err, row)
                {
                    if (err) {console.log(err.message); db.run(`ROLLBACK`); return false}
                    console.log("zeitschrift.id: " + row.id);
                    db.run(sql[23], [row.id, zeitschriftid, data.nr], function (err)
                    {
                        (async () =>
                        {
                            let warn = document.getElementById("bFrmWarnFld");
                            warn.innerHTML = await rollback(err);
                            if (warn.innerHTML.includes("ERROR")) {
                                console.log("error");
                                return false;
                            } else {
                                db.run(`COMMIT`);
                                return callback();
                            }
                        })();
                    });
                });
            });
        })});
    }


/*

TODO
    - css: textfield wrapping
    - sachgebiete und sachgebietsnummern
    - Verallgemeinern der Datenlisten Anzeige Funktion
*/
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
            if (bFrm.warnFld !== undefined) {bFrm.warnFld.innerHTML = "";}
        }
        bFrm.onfocusoutSachgebiet = async function ()
        {
            let errmessage;
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
            if (sgnrArr.includes(false)) {
                return false;
            } else {
                let i;
                let index = Array.from(bFrm.elements).indexOf(sgnrTextarea);
                let promises = [];
                sgnrArr.sort();
                for (i=0; i<sgnrArr.length; i++) {
                    ((i) => {
                        promises.push(new Promise ((resolve, reject)=>
                        {
                            db.get(`SELECT sachgebiet FROM sachgebiet WHERE id = ?`, [sgnrArr[i]], (err, row) =>
                            {
                                if (err) {
                                    reject(err);
                                }
                                if (row === undefined) {
                                    sgArr[i] = "ERROR";
                                    reject("Das Sachgebiet existiert nicht");
                                } else {
                                    let osg = ( sgnrArr[i] === 0 || Number.isInteger(sgnrArr[i]/100) ) ? "OSG - " : "USG - ";
                                    resolve(sgArr[i] = osg + row.sachgebiet);
                                }
                            }); 
                        }));
                    })(i);
                }
                await Promise.all(promises)
                    .then(result => 
                    {
                        sgnrTextarea.value = sgnrArr.join("\n");
                        sgTextarea.value = result.join("\n");
                        return errmessage = "";
                    })
                    .catch(error => 
                    {
                        sgnrTextarea.value = sgnrArr.join("\n");
                        sgTextarea.value = sgArr.join("\n");
                        return errmessage = error;
                    });
                if (errmessage !== "") {
                    bFrm.warnFld.innerHTML = errmessage;
                    sgnrTextarea.focus();
                    sgnrTextarea.style.color = warnColor;
                } 
                return errmessage;
            }
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
            async function () 
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
                        data = journalData(document.forms.bFrm);
                        break;
                    case "Aufsatz" :  
                        data = essayData(document.forms.bFrm);
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

                    default : //typeOfMedium = "Buch"                        
                        data = bookData(document.forms.bFrm);
                }
                if (err.length !== 0) {
                    let firstError = err[0].split("*");
                    elements[firstError[0]].style.color = warnColor;
                    elements[firstError[0]].select();
                    warnung.innerHTML = firstError[1];
                    return false;
                } else {
                    let sachgebietError = await bFrm.onfocusoutSachgebiet();
                    if (sachgebietError !== "") {
                        return false;
                    } else {
                        let confirm = window.confirm("Neues Medium speichern?");
                        if (confirm == true) {
                            async function callback (boolean) 
                            {
                                if (boolean === true) {
                                    bFrm.reset();
                                    let x = await getMaxID(1);
                                    bFrmWarnFld.innerHTML = "Der Datensatz wurde gespeichert";
                                    return bFrm.elements[0].value = x;
                                } else {
                                    return bFrmWarnFld.innerHTML = "Der Datensatz konnte nicht gespeichert werden";
                                }
                            }
                            switch (typeOfMedium) {
                                case "Buch": addBook(data, callback); break;
                                case "Zeitschrift": addJournal(data, callback); break;
                                case "Aufsatz": addEssay(data, callback); break;
                            }
                            return true;
                        } else {
                            return false;
                        }
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

    /*
        SQL
    */

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

TODO
    - ORT IN TABELLEN ÄNDERN - RELATION NACH RELOBJTYP NICHT NACH BUCH !!! DAMIT AUCH EIN AUFSATZ EINEN ORT HABEN KANN
        DANN MÜSSEN AUCH DIE SPEICHER_SQLs ANGEPASST WERDEN !!! EBENFALLS DIE SUCHE !!! IN INDEX.HTML. ANPASSEN AUCH 
        IN BOOKDATA.JS usw.
    - css: textfield wrapping
    - Verallgemeinern der Datenlisten Anzeige Funktion
    - preis funktioniert nicht mit kommastellen
*/
    //POSSIBLE PARENTS: (Beachte die global definierten Variablen !)
    // neuaufnahme.html 
    // aendern.html

    /*
        XHR Event Listener
    */

    onLoadenedXHR(
        async function ()
        {
            if (document.forms.bFrm !== undefined) {
            // create bFrm and fill up "standorte" select field and "id" field
                await cBFrmObj();
                if (document.getElementById("standort") !== null) {
                    cStandorteOptions(document.getElementById("standort"));
                }
                if (document.getElementsByName("id")[0] !== undefined) {
                    bFrm.elements[0].value = await getMaxID(1);
                }
            }
            if (typeOfMedium === "Artikel" || typeOfMedium === "Buchaufsatz") {
                if (document.forms.bFrm === undefined) { // only formular-selid.html is loaded
                    document.getElementById("selIDStr").focus();
                }
                document.getElementById("selIDStr").addEventListener("keypress", function (event)
                {
                    if (event.keyCode == 13 || event.which == 13) {
                        event.preventDefault();
                        document.getElementById("selIDOKBtn").click();
                    } else {return;}
                });
                if (typeOfMedium === "Artikel") {
                    document.getElementById("selIDOKBtn").onclick = (()=>
                    {
                        return getJournalData(
                            document.getElementById("selIDStr").value, 
                            document.getElementById("selIDFrmWarnFld"),
                            document.getElementById("selIDOutFld"),
                            "formular-artikel.html"
                        );
                    });
                }
            }
        }
    )

    /*
        FORMULAR
    */

    cBFrmObj = function () 
    { 
        let bFrm = new cformular(
            document.getElementById("bFrm"), 
            document.getElementById("bFrmWarnFld"), 
            document.getElementById("outFld"), 
            document.getElementById("bOKBtn")
        );
        if (document.getElementsByName("id")[0] !== undefined) {
            bFrm.elements[1].focus();
        } else {
            bFrm.elements[0].focus();
        }
        bFrm.noIn = bFrm.elements.length - 2;
        bFrm.onenter = function (event) {
            let frm = this;
            let txtLen = frm.textFld.length;
            let i = 0;
            function checkKey (event) {
                if (event.keyCode == 13 || event.which == 13) {
                    event.preventDefault();
                    frm.sbmtBtn.click();
                } else {return;}
            }
            for (i = 0; i < txtLen; i++) {
                frm.textFld[i].addEventListener("keypress", checkKey);
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
            let elArr = Array.from(bFrm.elements);
            elArr.forEach(element => 
            {
                if (element.name === "id") {
                    return element;
                }
                if (element.type === "select-one" && element.item(0) !== null) {
                    return element.item(0).selected = true;
                } else {
                    return element.value = element.defaultValue;
                }
            });
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
                        data = articleData(document.forms.bFrm);
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
                    if (document.getElementsByName("sachgebietsnr")[0] !== undefined) {
                        let sachgebietError = await bFrm.onfocusoutSachgebiet();
                        if (sachgebietError !== "") {
                            return false;
                        } 
                    }
                    let confirm = window.confirm("Neues Medium speichern?");
                    if (confirm === true) {
                        async function callback (boolean) 
                        {
                            if (boolean === true) {
                                if (document.forms.selIDFrm !== undefined) {
                                    document.getElementById("selIDOutFld").innerHTML = "";
                                    document.getElementById("selIDStr").value = "";
                                    document.getElementById("selIDStr").focus();
                                    return document.getElementById("selIDFrmWarnFld").innerHTML = "Der Datensatz wurde gespeichert";
                                } else {
                                    bFrm.reset();
                                    let x = await getMaxID(1);
                                    bFrm.elements[0].value = x;
                                    return bFrmWarnFld.innerHTML = "Der Datensatz wurde gespeichert";
                                }
                            } else {
                                return bFrmWarnFld.innerHTML = "Der Datensatz konnte nicht gespeichert werden";
                            }
                        }
                        switch (typeOfMedium) {
                            case "Buch": addBook(data, callback); break;
                            case "Zeitschrift": addJournal(data, callback); break;
                            case "Aufsatz": addEssay(data, callback); break;
                            case "Artikel": addArticle(data, callback); break;
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
        if (document.getElementsByName('sachgebietsnr')[0] !== undefined) {
            document.getElementsByName('sachgebietsnr')[0].addEventListener("focusout", bFrm.onfocusoutSachgebiet);
        }
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
    - css: textfield wrapping
    - Verallgemeinern der Datenlisten Anzeige Funktion
    - preis funktioniert nicht mit kommastellen
*/
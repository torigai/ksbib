    // Global definierten Variablen
    // neuaufnahme.html -> aktion = "hinzufügen"
    // bearbeiten.html -> aktion = "bearbeiten"
    // typeOfMedium, mediumData, aktion, olddata    (definiert in: bearbeiten.html und/oder neuaufnahme.html)

    /*
        XHR Event Listener
    */

    onLoadenedXHR(
        async function ()
        {
            if (aktion === "hinzufügen") {  // from neuaufnahme.html
                if (document.forms.bFrm !== undefined) {
                // create bFrm and fill up "standorte" select field and "id" field
                    await cBFrmObj();
                    if (document.getElementById("standort") !== null) {
                        cStandorteOptions(document.getElementById("standort"));
                    }
                    if (document.getElementsByName("id")[0] !== undefined) {
                        let minID = (await dbGet(`SELECT MIN(id) AS id FROM objekt`, [])).id;
                        if ( minID > 1) {
                            bFrm.elements[0].value = 1;
                        } else {
                            bFrm.elements[0].value = await getMaxID();
                        }
                    }
                    document.getElementsByTagName("body")[0]
                        .addEventListener("keydown", function () 
                        {
                            return strgC(event, document.getElementById("abbrBtn"))
                        }, false);

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
                            if (document.getElementById("selIDStr").value === "") {
                                return document.getElementById("selIDFrmWarnFld").innerHTML = "Bitte gib eine ID ein";
                            } else {
                                function getJournalData (id, warnFld, outFld, link)
                                {
                                    warnFld.innerHTML = "";
                                    warnFld.setAttribute("class", "warning");
                                    db.get(sql[31], [id], function (err, row)
                                    {
                                        if (err) {
                                            return console.log(err); 
                                        } 
                                        if (row === undefined) {
                                            outFld.innerHTML = "";
                                            return warnFld.innerHTML = 'Es gibt keine Zeitschrift zu der ID'; 
                                        } 
                                        if (row.medium !== 'Zeitschrift') {
                                            outFld.innerHTML = "";
                                            return warnFld.innerHTML = 'Es gibt keine Zeitschrift zu der ID';
                                        } else {
                                            let jahr = (row.jahr !== null) ? ', ' + row.jahr : '';
                                            let band = (row.band !== null) ? ', Band ' + row.band : '';
                                            let nr = (row.zeitschriftNr !== null) ? ' Nr. ' + row.zeitschriftNr : '';
                                            if (!row.titel.endsWith('.')) { row.titel = row.titel + '.'; }
                                            let xhttpResponse = function (xhttp)
                                            {
                                                return outFld.innerHTML = xhttp.responseText;
                                            }
                                            warnFld.removeAttribute("class");
                                            warnFld.setAttribute("class", "center margin");
                                            warnFld.innerHTML = "<b>Zeitschrift: </b>" 
                                                + row.titel + ' <i>' + row.zeitschrift + band + nr + '</i>' + jahr;
                                            xhr(link, xhttpResponse);
                                            return selectedID = id;
                                        }
                                    });
                                }
                                return getJournalData(
                                    document.getElementById("selIDStr").value, 
                                    document.getElementById("selIDFrmWarnFld"),
                                    document.getElementById("selIDOutFld"),
                                    "formular-artikel+buchaufsatz.html"
                                );
                            }
                        });
                    }
                    if (typeOfMedium === "Buchaufsatz") {
                        document.getElementById("selIDOKBtn").onclick = (()=>
                        {
                            if (document.getElementById("selIDStr").value === "") {
                                return document.getElementById("selIDFrmWarnFld").innerHTML = "Bitte gib eine ID ein";
                            } else {
                                function getIncollectionData (id, warnFld, outFld, link)
                                {
                                    warnFld.innerHTML = "";
                                    warnFld.setAttribute("class", "warning");
                                    db.get(sql[30], [id], function (err, row)
                                    {
                                        if (err) {
                                           return console.log(err); 
                                        }    
                                        if (row === undefined) {
                                            outFld.innerHTML = "";
                                            return warnFld.innerHTML = 'Es gibt kein Buch zu der ID'; 
                                        } 
                                        if (row.medium !== 'Buch') {
                                            outFld.innerHTML = "";
                                            return warnFld.innerHTML = 'Es gibt kein Buch zu der ID';
                                        } else {
                                            let autortyp = (row.autortyp === 0) ? "" : " (Hrg.)";
                                            let autoren;
                                            if (row.autor !== null) { 
                                            // In media_view wird (Name = "Müller" Vorname = "") als "Müller, " 
                                            // gespeichert
                                            // Das "," soll in diesem Fall nicht angezeigt werden
                                                autoren = strtrim(row.autor).endsWith(",") ? 
                                                strtrim(row.autor).slice(0, row.autor.indexOf(",")) + autortyp + ": " : 
                                                row.autor + autortyp + ": "; 
                                            } else {
                                                autoren = "";
                                            }
                                            let jahr = (row.jahr !== null) ? ', ' + row.jahr : '';
                                            let band = (row.band !== null) ? ', Band ' + row.band : '';
                                            let verlag = (row.verlag !== null) ? row.verlag : '';
                                            if (!row.titel.endsWith('.')) { row.titel = row.titel + '.'; }
                                            let xhttpResponse = function (xhttp)
                                            {
                                                outFld.innerHTML = xhttp.responseText;
                                            }
                                            warnFld.removeAttribute("class");
                                            warnFld.setAttribute("class", "center margin");
                                            warnFld.innerHTML = "<b>Buch: </b>" + autoren + 
                                                '<i>' + row.titel + '</i>' + band + verlag + jahr;
                                            xhr(link, xhttpResponse);
                                            return selectedIncollID = id;
                                        }
                                    });
                                }
                                return getIncollectionData (
                                    document.getElementById("selIDStr").value, 
                                    document.getElementById("selIDFrmWarnFld"),
                                    document.getElementById("selIDOutFld"),
                                    "formular-artikel+buchaufsatz.html"
                                );
                            }
                        });
                    }
                }
            } else if (aktion === "bearbeiten") {   //from bearbeiten.html
                if (document.forms.bFrm !== undefined) {
                    let standort, autoren, titel, sachgebietsnr, stichworte;
                    let datacoll;
                    function fillOutInputFlds (fieldname, dataObj)
                    {
                        let i = Object.keys(dataObj).indexOf(fieldname);
                        if (document.getElementsByName(fieldname)[0] !== undefined) {
                                return document.getElementsByName(fieldname)[0].defaultValue = 
                                    (dataObj[Object.keys(dataObj)[i]] === null) ? "" : dataObj[Object.keys(dataObj)[i]];
                        }
                    }

                    await cBFrmObj();
                    document.getElementsByTagName("body")[0]
                        .addEventListener("keydown", function () 
                        {
                            return strgC(event, document.getElementById("abbrBtn"))
                        }, false);

                    if (document.getElementsByName("id")[0] !== undefined) {
                        document.getElementsByName("id")[0].value = mediumData[0];
                    }
                    datacoll = await dbGet(sql[41], mediumData).catch(err => {return console.error(err)});
                    fillOutInputFlds("jahr", datacoll);
                    fillOutInputFlds("ort", datacoll);
                    fillOutInputFlds("verlag", datacoll);
                    fillOutInputFlds("band", datacoll);
                    fillOutInputFlds("seiten", datacoll);
                    fillOutInputFlds("hinweis", datacoll);
                    fillOutInputFlds("preis", datacoll);
                    fillOutInputFlds("link", datacoll);
                    if (datacoll.autortyp === 1 && document.getElementsByName("autortyp")[0] !== undefined) {
                        document.getElementsByName("autortyp")[0].checked = true;
                    }
                    if (document.getElementById("status") !== null) {
                        Array.from(document.getElementById("status").options).forEach(option =>
                        {
                            if (option.value == datacoll.status) {
                                return option.setAttribute("selected", "selected");
                            } else {
                                if (option.hasAttribute("selected")) {
                                    return option.removeAttribute("selected");
                                } else {
                                    return option;
                                }
                            }
                        });
                    }
                    if (typeOfMedium === "Buch") {
                        datacoll = await dbGet(sql[42], mediumData[0]).catch(err => {return console.error(err)});
                        datacoll = (datacoll === undefined) ? {auflage: null, isbn: null} : datacoll;
                        fillOutInputFlds("auflage",datacoll);
                        fillOutInputFlds("isbn",datacoll);
                    }
                    if (typeOfMedium === "Zeitschrift") {
                        let zeitschrift = await dbGet(sql[43], mediumData[1]).catch(err => {return console.error(err)});
                        document.getElementsByName("zeitschrift")[0].defaultValue = zeitschrift.journal;
                        document.getElementsByName("zeitschriftkuerzel")[0].defaultValue = zeitschrift.kuerzel;
                        document.getElementsByName("nr")[0].defaultValue = zeitschrift.nr;
                    }
                    if (typeOfMedium === "Artikel") {
                        //selectedID is defined in articleData.js and there defines data.id
                        selectedID = mediumData[0];
                    }
                    if (typeOfMedium === "Buchaufsatz") {
                        //selectedIncollID is defined in incollectionData.js and there defines data.id
                        selectedIncollID = mediumData[0];
                    }
                    if (document.getElementById("standort") !== null) {
                        cStandorteOptions(document.getElementById("standort"));
                        standort = await dbGet(sql[36], mediumData[0]).catch(err => {return console.error(err)});
                        Array.from(document.getElementById("standort")).forEach(item =>
                        {
                            if (item.innerHTML.includes(standort.standortsgn)) {
                                return item.selected = true;
                            } else {
                                return item;
                            }
                        });
                    }
                    if (document.getElementsByName("sachgebietsnr")[0] !== undefined) {
                        sachgebiete = await dbAll(sql[39], mediumData[0]).catch(err => {return console.error(err)});
                        if (sachgebiete !== undefined) {
                            sachgebiete.forEach(sachgebiet =>
                            {
                                document.getElementsByName("sachgebietsnr")[0].innerHTML += 
                                    sachgebiet.sachgebietid + "\n";
                                let sg = (Number(sachgebiet.sachgebietid)%100 === 0) ? 
                                    "OSG - " + sachgebiet.sachgebiet :
                                    "USG - " + sachgebiet.sachgebiet;
                                document.getElementsByName("sachgebiete")[0].innerHTML += sg + "\n";
                            });
                        }
                    }
                    autoren = await dbAll(sql[37], mediumData).catch(err => {return console.error(err)});
                    if (autoren !== undefined) {
                        autoren.forEach(autor =>
                        {
                            if (autor.vorname === "") {
                                return document.getElementsByName("autoren")[0].innerHTML += 
                                    autor.name + "\n";
                            } else {
                                return document.getElementsByName("autoren")[0].innerHTML += 
                                    autor.name + ", " + autor.vorname + "\n";
                            }
                        });
                    }
                    titel = await dbAll(sql[38], mediumData).catch(err => {return console.error(err)});
                    titel.forEach(titel =>
                    {
                        return document.getElementsByName("titel")[0].innerHTML += titel.titel + "\n";
                    });
                    stichworte = await dbAll(sql[40], mediumData).catch(err => {return console.error(err)});
                    if (stichworte !== undefined) {
                        stichworte.forEach(stichwort =>
                        {
                            return document.getElementsByName("stichworte")[0].innerHTML +=
                                stichwort.stichwort + "\n";
                        });
                    }

                    switch (typeOfMedium) {
                    case "Artikel" :
                        return olddata = articleData(document.forms.bFrm);
                        break;
                    case "Zeitschrift" :
                        return olddata = journalData(document.forms.bFrm);
                        break;
                    case "Aufsatz" :  
                        return olddata = essayData(document.forms.bFrm);
                        break;
                    case "Buchaufsatz" :
                        return olddata = incollectionData(document.forms.bFrm);
                    break;
                    default : //typeOfMedium = "Buch"                        
                        return olddata = bookData(document.forms.bFrm);
                }
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
                if (frm.textFld[i].name === "zeitschrift") {
                    continue;
                } else {
                    frm.textFld[i].addEventListener("keypress", checkKey);
                }
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
                            db.get(sql[44], [sgnrArr[i]], (err, row) =>
                            {
                                if (err) {
                                    reject(err);
                                }
                                if (row === undefined) {
                                    sgArr[i] = "ERROR";
                                    reject("Das Sachgebiet existiert nicht");
                                } else {
                                    let osg = ( sgnrArr[i] === 0 || Number.isInteger(sgnrArr[i]/100) ) ? 
                                        "OSG - " : "USG - ";
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
            if (aktion === "hinzufügen") {
                let elArr = Array.from(bFrm.elements);
                elArr.forEach(element => 
                {
                    if (element.name === "id") {
                        return element;
                    }
                    if (element.name === "autortyp") {
                        return element.checked = false;
                    }
                    if (element.type === "select-one" && element.item(0) !== null) {
                        return element.item(0).selected = true;
                    } else {
                        return element.value = element.defaultValue;
                    }
                });    
                return bFrm.warnFld.innerHTML = "";
            } 
            if (aktion === "bearbeiten") {
                bFrm.outFld.innerHTML = `
                    <div class="info"><p>
                        Bitte gib die ID des Mediums ein, das Du bearbeiten möchtest. Die ID ist der Zähler in
                        der Signatur des Mediums, z.B. "400" bei dem Medium mit Signatur "CD-2 400". Falls Du
                        die ID nicht kennst, kannst Du das Medium <a href="index.html">suchen</a> und von den
                        Suchergebnissen aus die Maske zum Bearbeiten des Mediums öffnen.
                    </p></div>`;
                selFrm.textFld[0].value = "";
                selFrm.textFld[1].value = "";
                document.getElementById("headerTitel").innerHTML = "Medien bearbeiten"; 
                return selFrm.textFld[0].focus();
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
                        data = articleData(document.forms.bFrm);
                        break;
                    case "Zeitschrift" :
                        data = journalData(document.forms.bFrm);
                        break;
                    case "Aufsatz" :  
                        data = essayData(document.forms.bFrm);
                        break;
                    case "Buchaufsatz" :
                        data = incollectionData(document.forms.bFrm);
                    break;
                    default :                     
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
                    let confirm = window.confirm("Medium speichern?");
                    if (confirm === true) {
                        async function callback (boolean) 
                        {
                            if (boolean === true) {
                                if (aktion === "hinzufügen") {
                                    if (document.forms.selIDFrm !== undefined) {
                                        document.getElementById("selIDOutFld").innerHTML = "";
                                        document.getElementById("selIDStr").value = "";
                                        document.getElementById("selIDStr").focus();
                                        return document.getElementById("selIDFrmWarnFld").innerHTML = 
                                            "Der Datensatz wurde gespeichert";
                                    } else {
                                        bFrm.reset();
                                        let x = await getMaxID(1);
                                        bFrm.elements[0].value = x;
                                        bFrm.elements[1].focus();
                                        return bFrmWarnFld.innerHTML = "Der Datensatz wurde gespeichert";
                                    }
                                }
                                if (aktion === "bearbeiten") {
                                    bFrm.outFld.innerHTML = "";
                                    selFrm.textFld[0].value = "";
                                    selFrm.textFld[1].value = "";
                                    selFrm.textFld[0].focus();
                                    return selFrm.warnFld.innerHTML = "Der Datensatz wurde gespeichert";   
                                }
                            } else {
                                return bFrmWarnFld.innerHTML = "Der Datensatz konnte nicht gespeichert werden";
                            }
                        }
                        if (aktion === "hinzufügen") {
                            switch (typeOfMedium) {
                                case "Buch": addBook(data, callback); break;
                                case "Zeitschrift": addJournal(data, callback); break;
                                case "Aufsatz": addEssay(data, callback); break;
                                case "Artikel": addArticle(data, callback); break;
                                case "Buchaufsatz": addIncollection(data, callback); break;
                            }
                        } 
                        if (aktion === "bearbeiten") {
                            switch (typeOfMedium) {
                                case "Buch": updateBook(data, olddata, callback); break;
                                case "Zeitschrift": updateJournal(data, olddata, callback); break;
                                case "Aufsatz": updateEssay(data, olddata, callback); break;
                                case "Artikel": updateArticle(data, olddata, callback); break;
                                case "Buchaufsatz": updateIncollection(data, olddata, callback); break;
                            }  
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


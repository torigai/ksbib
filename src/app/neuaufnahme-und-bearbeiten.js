    // Global definierten Variablen
    // neuaufnahme.html -> aktion = "hinzufügen"
    // bearbeiten.html -> aktion = "bearbeiten"
    // typeOfMedium, mediumData, aktion, olddata 

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
        bFrm.formular.setAttribute("autocomplete","off");
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

        bFrm.sbmtBtn.onclick = function () {return bFrm.sbmt();}
        bFrm.btn[1].onclick = function () {return bFrm.reset();}
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

    //needed in formular-zeitschrift.html
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


let selectedIncollID;

function incollection (autoren, titel, jahr, ort, seiten, hinweis, stichworte) 
{
    this.autoren = autoren;    
    this.titel = titel;
    this.jahr = jahr;
    this.ort = ort;
    this.seiten = seiten;
    this.hinweis = hinweis;
    this.stichworte = stichworte; 
    this.autortyp = 0;  // Autor
    this.titeltyp = 1;  // Aufsatztitel
    this.zeitschriftid = 0;
}

function conformAndValidateIncollection(formular, incoll) 
{
    err = [];   //from validation.js
    function index (element)
    {
        return Array.from(formular.elements).indexOf(element);
    }
    return incollConformed = {
        id: Number(selectedIncollID),
        autoren: conformAndValidateAuthorArr(incoll.autoren, index(incoll.autoren), false),
        titel: conformAndValidateTitle(incoll.titel, index(incoll.titel), true), 
        jahr: conformAndValidateYear(incoll.jahr, index(incoll.jahr), false),
        ort: conformAndValidateStr(incoll.ort, index(incoll.ort), false, 500),
        seiten: conformAndValidatePages(incoll.seiten, index(incoll.seiten), false),
        hinweis: conformAndValidateComment(incoll.hinweis, index(incoll.hinweis), false),
        stichworte: conformAndValidateKeywords(incoll.stichworte, index(incoll.stichworte), false),
        autortyp: incoll.autortyp,
        titeltyp: incoll.titeltyp,
        zeitschriftid: incoll.zeitschriftid
    };    
}

function incollectionData (formular)
{
    let ic = new incollection (
        document.getElementsByName("autoren")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("ort")[0],
        document.getElementsByName("seiten")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0]
    );
    return conformAndValidateIncollection(formular, ic);
}

function addIncollection (data, callback)
{
    let i, autorenArr = [];
    let procIncoll = new cSQLProcessor(callback);

    // globals
    procIncoll.add(sql[26], [data.id], "aufsatzid");
    procIncoll.add(sql[28], [data.id], "buchid");
    if (data.ort !== null) {procIncoll.add(sql[2], [data.ort])}; //ort
    procIncoll.add(sql[17], [data.ort], "ortid"); //=> ortid

    //locals
    procIncoll.add(sql[1], [data.jahr]);
    procIncoll.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, "buchid", "aufsatzid", data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });
    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procIncoll.add(sql[6], [data.stichworte[i]]); 
                procIncoll.add(sql[12], [data.stichworte[i]]);
                procIncoll.add(sql[7], function (result) {return [data.id, data.zeitschriftid, "buchid", "aufsatzid", result]});
            })(i);
        }
    }
    if (data.autoren !== null) {
        for (i=0; i < data.autoren.length; i++) { 
            ((i) => 
            {   
                if (data.autoren[i].includes(",")) {
                    autorenArr = data.autoren[i].split(",").map(strtrim);
                } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                    autorenArr = [data.autoren.toString(), ""];
                }
                procIncoll.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procIncoll.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procIncoll.add(sql[9], function (result) 
                {
                    return [data.id, data.zeitschriftid, "buchid", "aufsatzid", result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procIncoll.add(sql[10], [data.titel[i]]);
            procIncoll.add(sql[14], [data.titel[i]]);
            procIncoll.add(sql[11], function (result) 
            {
                return [data.id, data.zeitschriftid, "buchid", "aufsatzid", result, data.titeltyp, i+1]
            });
        })(i);
    }
    procIncoll.run();
}

function updateIncollection (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procIncoll = new cSQLProcessor(callback);
    let i;
    function compare (oldObj, newObj) 
    {
        let noChanges;
        let obj = {};
        for (const key in oldObj) {
            if (Array.isArray(oldObj[key])) {
                noChanges = 0;
                if (newObj[key] === null) {
                    noChanges = 1;
                } else if (oldObj[key].length !== newObj[key].length) {
                    noChanges = 1;
                } else {
                    oldObj[key].forEach(element => 
                    {
                        let i = oldObj[key].indexOf(element);
                        if (element !== newObj[key][i]) {
                            return noChanges = noChanges + 1;
                        } else {
                            return noChanges;
                        }
                    });
                }
                obj[key] = (noChanges === 0) ? 0 : 1;
            } else {
                obj[key] = (oldObj[key] === newObj[key]) ? 0 : 1;
            }
        }
        return obj;
    }
    function columsToUpdate (compareObj, newData, namesArr)
    {
        let resultArr = [];
        namesArr.map(name => 
        {
            if (compareObj[name] === 1) {
                let datum = (typeof newData[name] === "string") ? `'${newData[name]}'` : newData[name];
                resultArr.push(name + "=" + datum);
            }
        });
        return resultArr.toString();
    }
    compareResult = compare(olddata, data);
    if (!Object.values(compareResult).includes(1)) { //no changes
        return callback(true);
    } else {
        //Globals
        //globale Variable mediumData von bearbeiten.html (mediumData = [objektid, zeitschriftid, buchid, aufsatzid])

        if (compareResult.hinweis !== 0) {
            procIncoll.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [data.id, data.zeitschriftid, mediumData[2], mediumData[3]]
            );
        }
        if (compareResult.jahr !== 0) {
            procIncoll.add(sql[1], [data.jahr]);  //select jahrid
            procIncoll.add(sql[48], function (result) 
            {
                return [result, data.id, data.zeitschriftid, mediumData[2], mediumData[3]]
            });
        }
        if (compareResult.stichworte !== 0) {
            if (olddata.stichworte !== null) {  //delete all from relstichw
                procIncoll.add(sql[57], [data.id, data.zeitschriftid, mediumData[2], mediumData[3]]);
            } 
            if (data.stichworte !== null) {
                data.stichworte.forEach(stichwort =>  //add all new to relstichw.
                {
                    procIncoll.add(sql[6], [stichwort]);  //insert or ignore
                    procIncoll.add(sql[12], [stichwort]); //select id
                    procIncoll.add(sql[7], function (result)
                    {
                        return [data.id, data.zeitschriftid, mediumData[2], mediumData[3], result]
                    });
                });
            }       
        }
        if (compareResult.autoren !== 0) {
            if (olddata.autoren !== null) { //delete all old relations in relautor
                olddata.autoren.forEach(autor =>
                {
                    procIncoll.add(sql[59], [data.id, data.zeitschriftid, mediumData[2], mediumData[3]]); 
                });
            }
            if (data.autoren !== null) {   //insert all new relations in relautor
                for (i=0; i < data.autoren.length; i++) { ((i) => {
                    if (data.autoren[i].includes(",")) {
                        autorenArr = data.autoren[i].split(",").map(strtrim);
                    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                        autorenArr = [data.autoren.toString(), ""];
                    }
                    procIncoll.add(sql[8], [autorenArr[0], autorenArr[1]]);
                    procIncoll.add(sql[13], [autorenArr[0], autorenArr[1]]);
                    procIncoll.add(sql[9], function (result) 
                    {
                        return [data.id, data.zeitschriftid, mediumData[2], mediumData[3], result, i+1]
                    }); 
                })(i);}
            }
        }
        if (compareResult.titel !== 0) {
            procIncoll.add(sql[60], [data.id, data.zeitschriftid, mediumData[2], mediumData[3]]); // delete all old in reltitel
            for (i=0; i < data.titel.length; i++) { ((i) => {   //add all new in reltitel
                procIncoll.add(sql[10], [data.titel[i]]);
                procIncoll.add(sql[14], [data.titel[i]]);
                procIncoll.add(sql[11], function (result) 
                {
                    return [data.id, data.zeitschriftid, mediumData[2], mediumData[3], result, data.titeltyp, i+1]
                });
            })(i);}
        }
        procIncoll.run();
    }
}

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
                // In media_view wird (Name = "Müller" Vorname = "") als "Müller, " gespeichert
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
            warnFld.innerHTML = "<b>Buch: </b>" + autoren + '<i>' + row.titel + '</i>' + band + verlag + jahr;
            xhr(link, xhttpResponse);
            return selectedIncollID = id;
        }
    });
}


//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

function essay (id, standort, autoren, titel, jahr, ort, seiten, sachgebietsnr, hinweis, stichworte, status)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;     
    this.titel = titel;         
    this.jahr = jahr;
    this.ort = ort;
    this.seiten = seiten;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte;
    this.status = status; 
    this.medientyp = 3;
    this.buchid = 0;
    this.zeitschriftid = 0;
    this.autortyp = 0;  //Autor
    this.titeltyp = 1;  //Aufsatztitel
}
function conformAndValidateEssay(formular, essay)
{
    err = []; //from validation.js
    function index (element)
    {
        return Array.from(formular.elements).indexOf(element);
    }
    let essayConformed = {
        id: essay.id.value,
        standort: essay.standort.options[essay.standort.selectedIndex].value,
        autoren: conformAndValidateAuthorArr(essay.autoren, index(essay.autoren), false),
        titel: conformAndValidateTitle(essay.titel, index(essay.titel), true),
        jahr: conformAndValidateYear(essay.jahr, index(essay.jahr), false),
        ort: conformAndValidateStr(essay.ort, index(essay.ort), false, 500),
        seiten: conformAndValidatePages(essay.seiten, index(essay.seiten), false),
        sachgebietsnr: conformAndValidateSgnr(essay.sachgebietsnr, index(essay.sachgebietsnr), false),
        hinweis: conformAndValidateComment(essay.hinweis, index(essay.hinweis), false),
        stichworte: conformAndValidateKeywords(essay.stichworte, index(essay.stichworte), false),
        status: essay.status.value,
        medientyp: essay.medientyp,
        buchid: essay.buchid,
        zeitschriftid: essay.zeitschriftid,
        autortyp: essay.autortyp,
        titeltyp: essay.titeltyp
    };
    return essayConformed;
}
function essayData (formular)
{
    let e = new essay (
        document.getElementsByName("id")[0],
        document.getElementById("standort"),
        document.getElementsByName("autoren")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("ort")[0],
        document.getElementsByName("seiten")[0],
        document.getElementsByName("sachgebietsnr")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0],
        document.getElementById("status")
    );
    return conformAndValidateEssay(formular, e);
}
function addEssay (data, callback)
{
    let i, autorenArr = []; 
    let procEssay = new cSQLProcessor(callback);
    
    //Globally used result
    procEssay.add(sql[24], [], "aufsatzid");
    if (data.ort !== null) {procEssay.add(sql[2], [data.ort])};
    procEssay.add(sql[17], [data.ort], "ortid");

    //Others
    procEssay.add(sql[3], [data.id, data.medientyp, data.standort, null, null, data.status]);
    procEssay.add(sql[1], [data.jahr]);
    procEssay.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });
    if (data.sachgebietsnr.length !== 0) {
        for (i=0; i<data.sachgebietsnr.length; i++) {
            ((i) => 
            {
                procEssay.add(sql[15], [data.id, data.sachgebietsnr[i]]); 
            })(i);
        }
    }
    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procEssay.add(sql[6], [data.stichworte[i]]); 
                procEssay.add(sql[12], [data.stichworte[i]]);
                procEssay.add(sql[7], function (result) {return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result]});
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
                procEssay.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procEssay.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procEssay.add(sql[9], function (result) 
                {
                    return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procEssay.add(sql[10], [data.titel[i]]);
            procEssay.add(sql[14], [data.titel[i]]);
            procEssay.add(sql[11], function (result) 
            {
                return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, data.titeltyp, i+1]
            });
        })(i);
    }

    procEssay.run();
}

function updateEssay (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procEssay = new cSQLProcessor(callback);
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
        console.log(data);
        //Globals
        procEssay.add(sql[61], [data.id], "aufsatzid");

        if (compareResult.standort !== 0 || compareResult.status !== 0) {
            procEssay.add(sqlUpdate(
                    "objekt", 
                    columsToUpdate(compareResult, data, ["standort", "status"]),
                    "id = ?"
                ), [data.id]
            );
        }
        if (compareResult.sachgebietsnr !== 0) {
            if (data.sachgebietsnr.length === olddata.sachgebietsnr.length) { //Update
                data.sachgebietsnr.forEach(nr => 
                {
                    return procEssay.add(sql[45], [nr, data.id]);
                });
            } else { //Delete all relations, then insert new relations
                if (olddata.sachgebietsnr !== null) {
                    procEssay.add(sql[51], [data.id]);   
                }
                if (data.sachgebietsnr !== null) {
                    data.sachgebietsnr.forEach(nr =>    
                    {
                        return procEssay.add(sql[15], [data.id, nr]);
                    });
                }
            }
        }
        if (compareResult.ort !== 0) { //insert or ignore new ort and update relobjtyp
            procEssay.add(sql[2], [data.ort]);   //insert or ignore
            procEssay.add(sql[17], [data.ort]);  //select
            procEssay.add(sql[54], function (result)
            {
                return [result, data.id, data.zeitschriftid, data.buchid, "aufsatzid"];
            });
        }
        if (compareResult.hinweis !== 0 || compareResult.seiten !== 0) {
            procEssay.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis", "seiten"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [data.id, data.zeitschriftid, data.buchid, "aufsatzid"]
            );
        }
        if (compareResult.jahr !== 0) {
            procEssay.add(sql[1], [data.jahr]);  //select jahrid
            procEssay.add(sql[48], function (result) 
            {
                return [result, data.id, data.zeitschriftid, data.buchid, "aufsatzid"]
            });
        }
        if (compareResult.stichworte !== 0) {
            if (olddata.stichworte !== null) {  //delete all from relstichw
                procEssay.add(sql[57], [data.id, data.zeitschriftid, data.buchid, "aufsatzid"]);
            } 
            if (data.stichworte !== null) {
                data.stichworte.forEach(stichwort =>  //add all new to relstichw.
                {
                    procEssay.add(sql[6], [stichwort]);  //insert or ignore
                    procEssay.add(sql[12], [stichwort]); //select id
                    procEssay.add(sql[7], function (result)
                    {
                        return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result]
                    });
                });
            }       
        }
        if (compareResult.autoren !== 0) {
            if (olddata.autoren !== null) { //delete all old relations in relautor
                olddata.autoren.forEach(autor =>
                {
                    procEssay.add(sql[59], [data.id, data.zeitschriftid, data.buchid, "aufsatzid"]); 
                });
            }
            if (data.autoren !== null) {   //insert all new relations in relautor
                for (i=0; i < data.autoren.length; i++) { ((i) => {
                    if (data.autoren[i].includes(",")) {
                        autorenArr = data.autoren[i].split(",").map(strtrim);
                    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                        autorenArr = [data.autoren.toString(), ""];
                    }
                    procEssay.add(sql[8], [autorenArr[0], autorenArr[1]]);
                    procEssay.add(sql[13], [autorenArr[0], autorenArr[1]]);
                    procEssay.add(sql[9], function (result) 
                    {
                        return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, i+1]
                    }); 
                })(i);}
            }
        }
        if (compareResult.titel !== 0) {
            procEssay.add(sql[60], [data.id, data.zeitschriftid, data.buchid, "aufsatzid"]); // delete all old in reltitel
            for (i=0; i < data.titel.length; i++) { ((i) => {   //add all new in reltitel
                procEssay.add(sql[10], [data.titel[i]]);
                procEssay.add(sql[14], [data.titel[i]]);
                procEssay.add(sql[11], function (result) 
                {
                    return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, data.titeltyp, i+1]
                });
            })(i);}
        }
        procEssay.run();
    }
}
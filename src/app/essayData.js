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

function autorToArr (autor)
{
    if (autor.includes(",")) {
        return autor.split(",").map(strtrim);
    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
        return [autor.toString(), ""];
    }
}

function addEssay (data, callback)
{
    let procMedium = new cSQLProcessor(callback);
    
    //Globally used result
    procMedium.add(sql[24], [], "aufsatzid");
    if (data.ort !== null) {
        procMedium.add(sqlFindGap("ort"),[]);
        procMedium.add(sql[71], function (result)
        {
            return [result, data.ort];
        });
    };
    procMedium.add(sql[17], [data.ort], "ortid");

    //Others
    procMedium.add(sql[3], [data.id, data.medientyp, data.standort, null, null, data.status]);
    procMedium.add(sql[1], [data.jahr]);
    procMedium.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", 
            data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });
    if (data.sachgebietsnr.length !== 0) {
        data.sachgebietsnr.forEach(sgnr =>
        {
            procMedium.add(sql[15], [data.id, sgnr]);
        });
    }
    if (data.stichworte !== null) {
        data.stichworte.forEach(stichwort =>
        {   
            procMedium.add(sqlFindGap("stichwort"),[]);
            procMedium.add(sql[75], function (result) 
            {
                return [result, stichwort];
            });
            procMedium.add(sql[12], [stichwort]);
            procMedium.add(sql[7], function (result)
            {
                return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result]
            });
        });
    }
    if (data.autoren !== null) {
        data.autoren.forEach(autor =>
        {
            let autorenArr = (autor.includes(",")) ? autor.split(",").map(strtrim) : [autor.toString(), ""];
            let i = data.autoren.indexOf(autor);
            procMedium.add(sqlFindGap("autor"), []);
            procMedium.add(sql[72], function (result) 
            {
                return [result, autorenArr[0], autorenArr[1]];
            });
            procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
            procMedium.add(sql[9], function (result) 
            {
                return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, i+1]
            });
        });
    }
    //requires: data.titel is never null !
    data.titel.forEach(titel =>
    {
        let i = data.titel.indexOf(titel);
        procMedium.add(sqlFindGap("titel"), []);
        procMedium.add(sql[76], function (result)
        {
            return [result, titel];
        });
        procMedium.add(sql[14], [titel]);
        procMedium.add(sql[11], function (result) 
        {
            return [data.id, data.zeitschriftid, data.buchid, "aufsatzid", result, data.titeltyp, i+1]
        });
    });
    procMedium.run();
}

function updateEssay (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procMedium = new cSQLProcessor(callback);
 
    compareResult = compare(olddata, data);
    if (!Object.values(compareResult).includes(1)) { //no changes
        return callback(true);
    } else {
        if (compareResult.standort !== 0 || compareResult.status !== 0) {
            procMedium.add(sqlUpdate(
                    "objekt", 
                    columsToUpdate(compareResult, data, ["standort", "status"]),
                    "id = ?"
                ), [mediumData[0]]
            );
        }
        if (compareResult.sachgebietsnr !== 0) {
            if (data.sachgebietsnr.length === olddata.sachgebietsnr.length) { //Update
                data.sachgebietsnr.forEach(nr => 
                {
                    return procMedium.add(sql[45], [nr, data.id]);
                });
            } else { //Delete all relations, then insert new relations
                if (olddata.sachgebietsnr !== null) {
                    procMedium.add(sql[51], [data.id]);   
                }
                if (data.sachgebietsnr !== null) {
                    data.sachgebietsnr.forEach(nr =>    
                    {
                        return procMedium.add(sql[15], [data.id, nr]);
                    });
                }
            }
        }
        if (compareResult.ort !== 0) {
            if (data.ort !== null) {
                procMedium.add(sqlFindGap("ort"),[]);
                procMedium.add(sql[71], function (result)
                {
                    return [result, data.ort];
                });
                procMedium.add(sql[17], data.ort);
                procMedium.add(sql[54], function (result)
                {
                    return [result, mediumData[0], mediumData[1], mediumData[2], mediumData[3]]
                });
            } else {
                procMedium.add(sql[54], [0, mediumData[0], mediumData[1], mediumData[2], mediumData[3]]);
            }
        }
        if (compareResult.hinweis !== 0 || compareResult.seiten !== 0) {
            procMedium.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis", "seiten"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [mediumData[0], mediumData[1], mediumData[2], mediumData[3]]
            );
        }
        if (compareResult.jahr !== 0) {
            procMedium.add(sql[1], [data.jahr]);  //select jahrid
            procMedium.add(sql[48], function (result) 
            {
                return [result, mediumData[0], mediumData[1], mediumData[2], mediumData[3]]
            });
        }
        if (compareResult.stichworte !== 0) {
            function rmStichworteFct (stichwort)
            {
                procMedium.add(sql[12], stichwort);
                procMedium.add(sql[64], function (result)
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });
            }
            function addStichworteFct (stichwort)
            {
                procMedium.add(sqlFindGap("stichwort"),[]);
                procMedium.add(sql[75], function (result) 
                {
                    return [result, stichwort];
                });
                procMedium.add(sql[12], [stichwort]);
                procMedium.add(sql[7], function (result)
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });
            }
            updateArray(olddata.stichworte, data.stichworte, rmStichworteFct, addStichworteFct);      
        }
        if (compareResult.autoren !== 0) {
            function rmAutorenFct (autor)
            {
                let autorenArr = (autor.includes(",")) ? autor.split(",").map(strtrim) : [autor.toString(), ""];
                procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procMedium.add(sql[69], function (result)
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });     
            }
            function updateAutorenFct (autor)
            {
                let i = data.autoren.indexOf(autor);
                let autorenArr = (autor.includes(",")) ? autor.split(",").map(strtrim) : [autor.toString(), ""];
                procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procMedium.add(sql[70], function (result)
                {
                    return [i+1, mediumData[0], mediumData[1], mediumData[2], mediumData[3], result];
                });
            }
            function addAutorenFct (autor)
            {
                let i = data.autoren.indexOf(autor);
                let autorenArr = (autor.includes(",")) ? autor.split(",").map(strtrim) : [autor.toString(), ""];
                procMedium.add(sqlFindGap("autor"), []);
                procMedium.add(sql[72], function (result) 
                {
                    return [result, autorenArr[0], autorenArr[1]]
                });
                procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procMedium.add(sql[9], function (result) 
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result, i+1]
                });
            }
            updateArray(olddata.autoren, data.autoren, rmAutorenFct, addAutorenFct, updateAutorenFct);
        }
        if (compareResult.titel !== 0) {
            function rmTitelFct (titel)
            {
                procMedium.add(sql[14], [titel]);
                procMedium.add(sql[73], function (result) 
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });                
            }
            function updateTitelFct (titel)
            {
                let i = data.titel.indexOf(titel);
                procMedium.add(sql[14], [titel]);
                procMedium.add(sql[74], function (result)
                {
                    return [i+1, mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });
            }
            function addTitelFct (titel)
            {
                let i = data.titel.indexOf(titel);
                procMedium.add(sqlFindGap("titel"), []);
                procMedium.add(sql[76], function (result)
                {
                    return [result, titel];
                });
                procMedium.add(sql[14], [titel]);
                procMedium.add(sql[11], function (result) 
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result, data.titeltyp, i+1]
                });
            }
            updateArray(olddata.titel, data.titel, rmTitelFct, addTitelFct, updateTitelFct);
        }
        procMedium.run();
    }
}
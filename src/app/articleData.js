//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js
//REQUIRES sqlProcFunctions.js

let selectedID;

function article (autoren, titel, jahr, ort, seiten, hinweis, stichworte) 
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
    this.buchid = 0;
}

function conformAndValidateArticle(formular, article) 
{
    err = [];   //from validation.js
    function index (element)
    {
        return Array.from(formular.elements).indexOf(element);
    }
    return articleConformed = {
        id: Number(selectedID),
        autoren: conformAndValidateAuthorArr(article.autoren, index(article.autoren), false),
        titel: conformAndValidateTitle(article.titel, index(article.titel), true), 
        jahr: conformAndValidateYear(article.jahr, index(article.jahr), false),
        ort: conformAndValidateStr(article.ort, index(article.ort), false, 500),
        seiten: conformAndValidatePages(article.seiten, index(article.seiten), false),
        hinweis: conformAndValidateComment(article.hinweis, index(article.hinweis), false),
        stichworte: conformAndValidateKeywords(article.stichworte, index(article.stichworte), false),
        autortyp: article.autortyp,
        titeltyp: article.titeltyp,
        buchid: article.buchid
    };    
}

function articleData (formular)
{
    let a = new article (
        document.getElementsByName("autoren")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("ort")[0],
        document.getElementsByName("seiten")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0]
    );
    return conformAndValidateArticle(formular, a);
}

function autorToArr (autor)
{
    if (autor.includes(",")) {
        return autor.split(",").map(strtrim);
    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
        return [autor.toString(), ""];
    }
}

function addArticle (data, callback)
{
    let autorenArr = [];
    let procMedium = new cSQLProcessor(callback);

    // globals
    procMedium.add(sql[25], [data.id], "aufsatzid");
    procMedium.add(sql[27], [data.id], "zeitschriftid");
    if (data.ort !== null) {
        procMedium.add(sqlFindGap("ort"),[]);
        procMedium.add(sql[71], function (result)
        {
            let x = (result === undefined) ? NULL : result;
            return [x, data.ort];
        });
    };
    procMedium.add(sql[17], [data.ort], "ortid");

    //locals
    procMedium.add(sql[1], [data.jahr]);
    procMedium.add(sql[4], function (result) 
    {
        return [data.id, "zeitschriftid", data.buchid, "aufsatzid", 
            data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });

    if (data.stichworte !== null) {
        data.stichworte.forEach(stichwort =>
        {   
            procMedium.add(sqlFindGap("stichwort"),[]);
            procMedium.add(sql[75], function (result) 
            {
                let x = (result === undefined) ? NULL : result;
                return [x, stichwort];
            });
            procMedium.add(sql[12], [stichwort]);
            procMedium.add(sql[7], function (result)
            {
                return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result]
            });
        });
    }
    if (data.autoren !== null) {
        data.autoren.forEach(autor =>
        {
            autorenArr = autorToArr(autor);
            let i = data.autoren.indexOf(autor);
            procMedium.add(sqlFindGap("autor"), []);
            procMedium.add(sql[72], function (result) 
            {
                let x = (result === undefined) ? NULL : result;
                return [x, autorenArr[0], autorenArr[1]];
            });
            procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
            procMedium.add(sql[9], function (result) 
            {
                return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result, i+1]
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
            let x = (result === undefined) ? NULL : result;
            return [result, titel];
        });
        procMedium.add(sql[14], [titel]);
        procMedium.add(sql[11], function (result) 
        {
            return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result, data.titeltyp, i+1]
        });
    });
    procMedium.run();
}

function updateArticle (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procMedium = new cSQLProcessor(callback);
    
    compareResult = compare(olddata, data); 
    if (!Object.values(compareResult).includes(1)) { //no changes
        return callback(true);
    } else {
        if (compareResult.hinweis !== 0 || compareResult.seiten !== 0) {
            procMedium.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis", "seiten"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [mediumData[0], mediumData[1], mediumData[2], mediumData[3]]
            );
        }
        if (compareResult.ort !== 0) {
            if (data.ort !== null) {
                procMedium.add(sqlFindGap("ort"),[]);
                procMedium.add(sql[71], function (result)
                {
                    let x = (result === undefined) ? NULL : result;
                    return [x, data.ort];
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
        if (compareResult.jahr !== 0) {
            procMedium.add(sql[1], [data.jahr]); 
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
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result];
                });
            }
            function addStichworteFct (stichwort)
            {
                procMedium.add(sqlFindGap("stichwort"),[]);
                procMedium.add(sql[75], function (result) 
                {
                    let x = (result === undefined) ? NULL : result;
                    return [x, stichwort];
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
                autorenArr = autorToArr(autor);
                procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procMedium.add(sql[69], function (result)
                {
                    return [mediumData[0], mediumData[1], mediumData[2], mediumData[3], result]
                });     
            }
            function updateAutorenFct (autor)
            {
                let i = data.autoren.indexOf(autor);
                autorenArr = autorToArr(autor);
                procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procMedium.add(sql[70], function (result)
                {
                    return [i+1, mediumData[0], mediumData[1], mediumData[2], mediumData[3], result];
                });
            }
            function addAutorenFct (autor)
            {
                let i = data.autoren.indexOf(autor);
                autorenArr = autorToArr(autor);
                procMedium.add(sqlFindGap("autor"), []);
                procMedium.add(sql[72], function (result) 
                {
                    let x = (result === undefined) ? NULL : result;
                    return [x, autorenArr[0], autorenArr[1]]
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
                    let x = (result === undefined) ? NULL : result;
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




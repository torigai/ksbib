//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js
//REQUIRES main.js
//REQUIRES sqlProcFunctions.js

function buch (id, standort, autoren, autortyp, titel, jahr, ort, verlag, auflage, band, seiten, isbn, preis, sachgebietsnr, hinweis, stichworte, status, link)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;        
    this.autortyp = autortyp;    //typ 0 (autor) oder 1 (hrg)
    this.titel = titel;          
    this.jahr = jahr;
    this.ort = ort;
    this.verlag = verlag;
    this.auflage = auflage;
    this.band = band;
    this.seiten = seiten;
    this.isbn = isbn;
    this.preis = preis;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte;
    this.status = status;
    this.medientyp = 1; //buch
    this.titeltyp = 0;  //buchtitel
    this.zeitschriftid = 0;
    this.aufsatzid = 0;
    this.link = link;
}
function conformAndValidateBook(formular, book) 
{
    err = [];   //from validation.js
    function index (element)
    {
        return Array.from(formular.elements).indexOf(element);
    }
    return bookConformed = {
        id: Number(book.id.value),
        standort: Number(book.standort.options[book.standort.selectedIndex].value),
        autoren: conformAndValidateAuthorArr(book.autoren, index(book.autoren), false), //Arr[0]: name, vorname
        autortyp: Number(book.autortyp.value),
        titel: conformAndValidateTitle(book.titel, index(book.titel), true), //Arr[0]: titel1 ...
        jahr: conformAndValidateYear(book.jahr, index(book.jahr), false), 
        ort: conformAndValidateStr(book.ort, index(book.ort), false, 500),
        verlag: conformAndValidateStr(book.verlag, index(book.verlag), false, 500),
        auflage: conformAndValidateNumber(book.auflage, index(book.auflage), false),
        band: conformAndValidateNumber(book.band, index(book.band), false),
        seiten: conformAndValidatePages(book.seiten, index(book.seiten), false),
        isbn: conformAndValidateISBN(book.isbn, index(book.isbn), false),
        preis: conformAndValidateCosts(book.preis, index(book.preis), false),
        sachgebietsnr: conformAndValidateSgnr(book.sachgebietsnr, index(book.sachgebietsnr), false),
        hinweis: conformAndValidateComment(book.hinweis, index(book.hinweis), false),
        stichworte: conformAndValidateKeywords(book.stichworte, index(book.stichworte), false),
        status: Number(book.status.value),
        medientyp: book.medientyp,
        titeltyp: book.titeltyp,
        zeitschriftid: book.zeitschriftid,
        aufsatzid: book.aufsatzid,
        link: conformAndValidateLink(book.link, index(book.link), false)
    };
}  
function bookData (formular)
{
    let b = new buch (
        document.getElementsByName("id")[0],
        document.getElementById("standort"),
        document.getElementsByName("autoren")[0],
        document.getElementsByName("autortyp")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("ort")[0],
        document.getElementsByName("verlag")[0],
        document.getElementsByName("auflage")[0],
        document.getElementsByName("band")[0],
        document.getElementsByName("seiten")[0],
        document.getElementsByName("isbn")[0],
        document.getElementsByName("preis")[0],
        document.getElementsByName("sachgebietsnr")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0],
        document.getElementById("status"),
        document.getElementsByName("link")[0]
    );
    return conformAndValidateBook(formular, b);
}

function autorToArr (autor)
{
    if (autor.includes(",")) {
        return autor.split(",").map(strtrim);
    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
        return [autor.toString(), ""];
    }
}

function addBook (data, callback)
{
    let procMedium = new cSQLProcessor(callback);

    //Globally used results
    procMedium.add(sql[0],[], "buchid");
    if (data.ort !== null) {
        procMedium.add(sqlFindGap("ort"),[]);
        procMedium.add(sql[71], function (result)
        {
            return [result, data.ort];
        });
    };
    procMedium.add(sql[17], [data.ort], "ortid");
    if (data.verlag !== null) {
        procMedium.add(sqlFindGap("verlag"), []);
        procMedium.add(sql[77], function (result)
        {
            return [result, data.verlag];
        });
    }
    procMedium.add(sql[16], [data.verlag], "verlagid");
    
    //locals
    procMedium.add(sql[3],[data.id, data.medientyp, data.standort, data.preis, data.band, data.status]);
    procMedium.add(sql[18], ["buchid", data.auflage, "verlagid", data.isbn]);
    procMedium.add(sql[1], [data.jahr]);
    procMedium.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, 
            data.autortyp, data.hinweis, data.seiten, result, "ortid", data.link]
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
                return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result]
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
                return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, i+1]
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
            return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, data.titeltyp, i+1]
        });
    });
    procMedium.run();
}


function updateBook (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procMedium = new cSQLProcessor(callback);
    compareResult = compare(olddata, data);
    if (!Object.values(compareResult).includes(1)) { //no changes
        return callback(true);
    } else {
        if (compareResult.standort !== 0 || compareResult.preis !== 0 
            || compareResult.band !== 0 || compareResult.status !== 0) {
            procMedium.add(sqlUpdate(
                    "objekt", 
                    columsToUpdate(compareResult, data, ["standort", "preis", "band", "status"]),
                    "id = ?"
                ), [mediumData[0]]
            );
        }
        if (compareResult.sachgebietsnr !== 0) {
            //Delete all relations, then insert new relations
            // ! Don't change or add triggers like if_usg_also_osg !
            if (olddata.sachgebietsnr !== null) {
                procMedium.add(sql[51], [mediumData[0]]);   
            }
            if (data.sachgebietsnr !== null) {
                data.sachgebietsnr.forEach(nr =>    
                {
                    return procMedium.add(sql[15], [mediumData[0], nr]);
                });
            }
        }
        if (compareResult.verlag !== 0) {
            if (data.verlag !== null) {
                procMedium.add(sqlFindGap("verlag"), []);
                procMedium.add(sql[77], function (result)
                {
                    return [result, data.verlag];
                });
                procMedium.add(sql[16], [data.verlag]);   //select verlagid
                procMedium.add(sql[46], function (result) {return [result, mediumData[2]]});   //update
            } else {
                procMedium.add(sql[46], [0, mediumData[2]]);
            }
        }
        if (compareResult.auflage !== 0 || compareResult.isbn !== 0) {
            procMedium.add(sqlUpdate(
                "buch",
                columsToUpdate(compareResult, data, ["auflage", "isbn"]),
                "id = ?"
                ), [mediumData[2]]
            );
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
        if (compareResult.autortyp !== 0 || compareResult.hinweis !== 0 
                || compareResult.seiten !== 0 || compareResult.link !== 0) {
            procMedium.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["autortyp", "hinweis", "seiten", "link"]),
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

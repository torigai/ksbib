//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

function buch (id, standort, autoren, autortyp, titel, jahr, ort, verlag, auflage, band, seiten, isbn, preis, sachgebietsnr, hinweis, stichworte, status)
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
        aufsatzid: book.aufsatzid      
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
        document.getElementById("status")
    );
    return conformAndValidateBook(formular, b);
}

function addBook (data, callback)
{
    let i, autorenArr = []; 
    let procBook = new cSQLProcessor(callback);

    //Globally used results
    procBook.add(sql[0],[], "buchid"); //=> buchid
    if (data.ort !== null) {procBook.add(sql[2], [data.ort])}; //ort
    procBook.add(sql[17], [data.ort], "ortid"); //=> ortid
    procBook.add(sql[5], [data.verlag]); //verlag
    procBook.add(sql[16], [data.verlag], "verlagid"); //=> verlag    

    //Others
    //first parents
    procBook.add(sql[3],[data.id, data.medientyp, data.standort, data.preis, data.band, data.status]); //objekt
    procBook.add(sql[18], ["buchid", data.auflage, "verlagid", data.isbn]); //buch
    procBook.add(sql[1], [data.jahr]);
    procBook.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });
    if (data.sachgebietsnr.length !== 0) {
        for (i=0; i<data.sachgebietsnr.length; i++) {
            ((i) => 
            {
                procBook.add(sql[15], [data.id, data.sachgebietsnr[i]]);   //insert
            })(i);
        }
    }
    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procBook.add(sql[6], [data.stichworte[i]]);    // insert
                procBook.add(sql[12], [data.stichworte[i]]);
                procBook.add(sql[7], function (result) {return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result]});
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
                procBook.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procBook.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procBook.add(sql[9], function (result) 
                {
                    return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procBook.add(sql[10], [data.titel[i]]);
            procBook.add(sql[14], [data.titel[i]]);
            procBook.add(sql[11], function (result) 
            {
                return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, data.titeltyp, i+1]
            });
        })(i);
    }
    procBook.run();
}

function updateBook (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procBook = new cSQLProcessor(callback);
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

        if (compareResult.standort !== 0 || compareResult.preis !== 0 
            || compareResult.band !== 0 || compareResult.status !== 0) {
            procBook.add(sqlUpdate(
                    "objekt", 
                    columsToUpdate(compareResult, data, ["standort", "preis", "band", "status"]),
                    "id = ?"
                ), [data.id]
            );
        }
        if (compareResult.sachgebietsnr !== 0) {
            if (data.sachgebietsnr.length === olddata.sachgebietsnr.length) { //Update
                data.sachgebietsnr.forEach(nr => 
                {
                    return procBook.add(sql[45], [nr, data.id]);
                });
            } else { //Delete all relations, then insert new relations
                if (olddata.sachgebietsnr !== null) {
                    procBook.add(sql[51], [data.id]);   
                }
                if (data.sachgebietsnr !== null) {
                    data.sachgebietsnr.forEach(nr =>    
                    {
                        return procBook.add(sql[15], [data.id, nr]);
                    });
                }
            }
        }
        if (compareResult.verlag !== 0) { //insert or ignore new verlag and update buch
            procBook.add(sql[5], [data.verlag]);    //insert or ignore
            procBook.add(sql[16], [data.verlag]);   //select verlagid
            procBook.add(sql[46], function (result) {return [result, mediumData[2]]});   //update
        }
        if (compareResult.auflage !== 0 || compareResult.isbn !== 0) {
            procBook.add(sqlUpdate(
                "buch",
                columsToUpdate(compareResult, data, ["auflage", "isbn"]),
                "id = ?"
                ), [mediumData[2]]
            );
        }
        if (compareResult.ort !== 0) { //insert or ignore new ort and update relobjtyp
            procBook.add(sql[2], [data.ort]);   //insert or ignore
            procBook.add(sql[17], [data.ort]);  //select
            procBook.add(sql[54], function (result)
            {
                return [result, data.id, data.zeitschriftid, mediumData[2], data.aufsatzid];
            });
        }
        if (compareResult.autortyp !== 0 || compareResult.hinweis !== 0 || compareResult.seiten !== 0) {
            procBook.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["autortyp", "hinweis", "seiten"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid]
            );
        }
        if (compareResult.jahr !== 0) {
            procBook.add(sql[1], [data.jahr]);  //select jahrid
            procBook.add(sql[48], function (result) 
            {
                return [result, data.id, data.zeitschriftid, mediumData[2], data.aufsatzid]
            });
        }
        if (compareResult.stichworte !== 0) {
            if (olddata.stichworte !== null) {  //delete all from relstichw
                procBook.add(sql[57], [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid]);
            } 
            if (data.stichworte !== null) {
                data.stichworte.forEach(stichwort =>  //add all new to relstichw.
                {
                    procBook.add(sql[6], [stichwort]);  //insert or ignore
                    procBook.add(sql[12], [stichwort]); //select id
                    procBook.add(sql[7], function (result)
                    {
                        return [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid, result]
                    });
                });
            }       
        }
        if (compareResult.autoren !== 0) {
            if (olddata.autoren !== null) { //delete all old relations in relautor
                olddata.autoren.forEach(autor =>
                {
                    procBook.add(sql[59], [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid]); 
                });
            }
            if (data.autoren !== null) {   //insert all new relations in relautor
                for (i=0; i < data.autoren.length; i++) { ((i) => {
                    if (data.autoren[i].includes(",")) {
                        autorenArr = data.autoren[i].split(",").map(strtrim);
                    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                        autorenArr = [data.autoren.toString(), ""];
                    }
                    procBook.add(sql[8], [autorenArr[0], autorenArr[1]]);
                    procBook.add(sql[13], [autorenArr[0], autorenArr[1]]);
                    procBook.add(sql[9], function (result) 
                    {
                        return [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid, result, i+1]
                    }); 
                })(i);}
            }
        }
        if (compareResult.titel !== 0) {
            procBook.add(sql[60], [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid]); // delete all old in reltitel
            for (i=0; i < data.titel.length; i++) { ((i) => {   //add all new in reltitel
                procBook.add(sql[10], [data.titel[i]]);
                procBook.add(sql[14], [data.titel[i]]);
                procBook.add(sql[11], function (result) 
                {
                    return [data.id, data.zeitschriftid, mediumData[2], data.aufsatzid, result, data.titeltyp, i+1]
                });
            })(i);}
        }
        procBook.run();
    }
}
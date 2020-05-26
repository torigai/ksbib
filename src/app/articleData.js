//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

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

function addArticle (data, callback)
{
    let i, autorenArr = [];
    let procArticle = new cSQLProcessor(callback);

    // globals
    procArticle.add(sql[25], [data.id], "aufsatzid");
    procArticle.add(sql[27], [data.id], "zeitschriftid");
    if (data.ort !== null) {procArticle.add(sql[2], [data.ort])}; //ort
    procArticle.add(sql[17], [data.ort], "ortid"); //=> ortid



    //locals
    procArticle.add(sql[1], [data.jahr]);
    procArticle.add(sql[4], function (result) 
    {
        return [data.id, "zeitschriftid", data.buchid, "aufsatzid", data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });

    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procArticle.add(sql[6], [data.stichworte[i]]); 
                procArticle.add(sql[12], [data.stichworte[i]]);
                procArticle.add(sql[7], function (result) {return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result]});
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
                procArticle.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procArticle.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procArticle.add(sql[9], function (result) 
                {
                    return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procArticle.add(sql[10], [data.titel[i]]);
            procArticle.add(sql[14], [data.titel[i]]);
            procArticle.add(sql[11], function (result) 
            {
                return [data.id, "zeitschriftid", data.buchid, "aufsatzid", result, data.titeltyp, i+1]
            });
        })(i);
    }
    procArticle.run();
}

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
                outFld.innerHTML = xhttp.responseText;
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


//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

function zeitschrift (id, standort, autoren, titel, journal, kuerzel, band, nr, jahr, preis, sachgebietsnr, hinweis, stichworte, status, link)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;        
    this.titel = titel;           
    this.journal = journal;
    this.zeitschriftkuerzel = kuerzel;
    this.band = band;
    this.nr = nr;
    this.jahr = jahr;
    this.preis = preis;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte;  
    this.status = status; 
    this.medientyp = 2;	//Zeitschrift
    this.autortyp = 1;	//Hrg
    this.titeltyp = 0;	//Buchtitel
    this.aufsatzid = 0;
    this.buchid = 0;
    this.link = link;
}

function conformAndValidateJournal(formular, journal) 
{
  	err = [];	//from validation.js
  	function index (element)
	{
  		return Array.from(formular.elements).indexOf(element);
	}
   	return journalConformed = {
    	id: journal.id.value,
       	standort: journal.standort.options[journal.standort.selectedIndex].value,
       	autoren: conformAndValidateAuthorArr(journal.autoren, index(journal.autoren), false),
       	titel: conformAndValidateTitle(journal.titel, index(journal.titel), true), 
       	journal: conformAndValidateZeitschrift(journal.journal, index(journal.journal), true),
       	zeitschriftkuerzel: conformAndValidateZeitschrift(journal.zeitschriftkuerzel, index(journal.zeitschriftkuerzel), true),
       	band: conformAndValidateNumber(journal.band, index(journal.band), false),
       	nr: conformAndValidateNumber(journal.nr, index(journal.nr), false),
       	jahr: conformAndValidateYear(journal.jahr, index(journal.jahr), false),
       	preis: conformAndValidateCosts(journal.preis, index(journal.preis), false),
       	sachgebietsnr: conformAndValidateSgnr(journal.sachgebietsnr, index(journal.sachgebietsnr), false),
       	hinweis: conformAndValidateComment(journal.hinweis, index(journal.hinweis), false),
       	stichworte: conformAndValidateKeywords(journal.stichworte, index(journal.stichworte), false),
       	status: journal.status.value,
     	medientyp: journal.medientyp,
     	autortyp: journal.autortyp,
     	titeltyp: journal.titeltyp,
     	aufsatzid: journal.aufsatzid,
     	buchid: journal.buchid,
        link: conformAndValidateLink(journal.link, index(journal.link), false)	
	};
}

function journalData (formular) 
{
	let z = new zeitschrift (
        document.getElementsByName("id")[0],
        document.getElementById("standort"),
        document.getElementsByName("autoren")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("zeitschrift")[0],
        document.getElementsByName("zeitschriftkuerzel")[0],
        document.getElementsByName("band")[0],
        document.getElementsByName("nr")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("preis")[0],
        document.getElementsByName("sachgebietsnr")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0],
        document.getElementById("status"),
        document.getElementsByName("link")[0]
    );
	return conformAndValidateJournal(formular, z);
}

function autorToArr (autor)
{
    if (autor.includes(",")) {
        return autor.split(",").map(strtrim);
    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
        return [autor.toString(), ""];
    }
}

function addJournal (data, callback)
{
    let procMedium = new cSQLProcessor(callback);
 
    //Globally used result
    procMedium.add(sql[20], [], "zeitschriftid");    

    //Locals
    //requires that journal and zeitschriftkuerzel is never null !
    procMedium.add(sqlFindGap("zeitschrift"),[]);
    procMedium.add(sql[78], function (result)
    {
        return [result, data.journal, data.zeitschriftkuerzel];
    });
    procMedium.add(sql[22], [data.journal]);
    procMedium.add(sql[23], function (result) {return [result, "zeitschriftid", data.nr]});
    procMedium.add(sql[3], [data.id, data.medientyp, data.standort, data.preis, data.band, data.status]);
    procMedium.add(sql[1], [data.jahr]);
    procMedium.add(sql[4], function (result) 
    {
        return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, 
            data.autortyp, data.hinweis, data.seiten, result, null, data.link]
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
                return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result]
            });
        });
    }
    if (data.autoren !== null) {
        data.autoren.forEach(autor =>
        {
            let i = data.autoren.indexOf(autor);
            let autorenArr = (autor.includes(",")) ? autor.split(",").map(strtrim) : [autor.toString(), ""];
            procMedium.add(sqlFindGap("autor"), []);
            procMedium.add(sql[72], function (result) 
            {
                return [result, autorenArr[0], autorenArr[1]];
            });
            procMedium.add(sql[13], [autorenArr[0], autorenArr[1]]);
            procMedium.add(sql[9], function (result) 
            {
                return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result, i+1]
            });
        });
    }
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
            return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result, data.titeltyp, i+1]
        });
    });
    procMedium.run();
}

function updateJournal (data, olddata, callback)
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
            if (data.sachgebietsnr.length === olddata.sachgebietsnr.length) { //Update
                data.sachgebietsnr.forEach(nr => 
                {
                    return procMedium.add(sql[45], [nr, mediumData[0]]);
                });
            } else { //Delete all relations, then insert new relations
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
        }
        if (compareResult.zeitschrift !== 0 || compareResult.zeitschriftkuerzel !== 0) {
            //requires that zeitschrift and zeitschriftkuerzel are never null !
            procMedium.add(sqlFindGap("zeitschrift"),[]);
            procMedium.add(sql[78], function (result)
            {
                return [result, data.journal, data.zeitschriftkuerzel];
            });
            procMedium.add(sql[22], [data.journal]);
            procMedium.add(sql[62], function (result) {return [data.nr, result, mediumData[1]]});
        }
        if (compareResult.hinweis !== 0 || compareResult.link !== 0) {
            procMedium.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis", "link"]),
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
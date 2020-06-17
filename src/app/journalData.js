//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

function zeitschrift (id, standort, autoren, titel, journal, kuerzel, band, nr, jahr, preis, sachgebietsnr, hinweis, stichworte, status)
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
     	buchid: journal.buchid  	
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
        document.getElementById("status")
    );
	return conformAndValidateJournal(formular, z);
}

function addJournal (data, callback)
{
    let i, autorenArr = []; 
    let procZeitschrift = new cSQLProcessor(callback);
 
    //Globally used result
    procZeitschrift.add(sql[20], [], "zeitschriftid");    

    //Others
    procZeitschrift.add(sql[21], [data.journal, data.zeitschriftkuerzel]);
    procZeitschrift.add(sql[22], [data.journal]);
    procZeitschrift.add(sql[23], function (result) {return [result, "zeitschriftid", data.nr]});
    procZeitschrift.add(sql[3], [data.id, data.medientyp, data.standort, data.preis, data.band, data.status]);
    procZeitschrift.add(sql[1], [data.jahr]);
    procZeitschrift.add(sql[4], function (result) 
    {
        return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, data.autortyp, data.hinweis, data.seiten, result, null]
    });
    if (data.sachgebietsnr.length !== 0) {
        for (i=0; i<data.sachgebietsnr.length; i++) {
            ((i) => 
            {
                procZeitschrift.add(sql[15], [data.id, data.sachgebietsnr[i]]); 
            })(i);
        }
    }
    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procZeitschrift.add(sql[6], [data.stichworte[i]]); 
                procZeitschrift.add(sql[12], [data.stichworte[i]]);
                procZeitschrift.add(sql[7], function (result) {return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result]});
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
                procZeitschrift.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procZeitschrift.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procZeitschrift.add(sql[9], function (result) 
                {
                    return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procZeitschrift.add(sql[10], [data.titel[i]]);
            procZeitschrift.add(sql[14], [data.titel[i]]);
            procZeitschrift.add(sql[11], function (result) 
            {
                return [data.id, "zeitschriftid", data.buchid, data.aufsatzid, result, data.titeltyp, i+1]
            });
        })(i);
    }
    procZeitschrift.run();
}

function updateJournal (data, olddata, callback)
{
    let compareResult = {};    //intended: with keys as in data and values 0 (unchanged), 1 (changed)
    let procZeitschrift = new cSQLProcessor(callback);
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
            procZeitschrift.add(sqlUpdate(
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
                    return procZeitschrift.add(sql[45], [nr, data.id]);
                });
            } else { //Delete all relations, then insert new relations
                if (olddata.sachgebietsnr !== null) {
                    procZeitschrift.add(sql[51], [data.id]);   
                }
                if (data.sachgebietsnr !== null) {
                    data.sachgebietsnr.forEach(nr =>    
                    {
                        return procZeitschrift.add(sql[15], [data.id, nr]);
                    });
                }
            }
        }
        if (compareResult.zeitschrift !== 0 || compareResult.zeitschriftkuerzel !== 0) {
            procZeitschrift.add(sql[21], [data.journal, data.zeitschriftkuerzel]); //insert or ignore
            procZeitschrift.add(sql[22], [data.journal]);   //select
            procZeitschrift.add(sql[62], function (result) {return [data.nr, result, mediumData[1]]});
        }
        if (compareResult.hinweis !== 0) {
            procZeitschrift.add(sqlUpdate(
                "relobjtyp",
                columsToUpdate(compareResult, data, ["hinweis"]),
                "objektid = ? AND zeitschriftid = ? AND buchid = ? AND aufsatzid = ?"
                ), [data.id, mediumData[1], data.buchid, data.aufsatzid]
            );
        }
        if (compareResult.jahr !== 0) {
            procZeitschrift.add(sql[1], [data.jahr]);  //select jahrid
            procZeitschrift.add(sql[48], function (result) 
            {
                return [result, data.id, mediumData[1], data.buchid, data.aufsatzid]
            });
        }
        if (compareResult.stichworte !== 0) {
            if (olddata.stichworte !== null) {  //delete all from relstichw
                procZeitschrift.add(sql[57], [data.id, mediumData[1], data.buchid, data.aufsatzid]);
            } 
            if (data.stichworte !== null) {
                data.stichworte.forEach(stichwort =>  //add all new to relstichw.
                {
                    procZeitschrift.add(sql[6], [stichwort]);  //insert or ignore
                    procZeitschrift.add(sql[12], [stichwort]); //select id
                    procZeitschrift.add(sql[7], function (result)
                    {
                        return [data.id, mediumData[1], data.buchid, data.aufsatzid, result]
                    });
                });
            }       
        }
        if (compareResult.autoren !== 0) {
            if (olddata.autoren !== null) { //delete all old relations in relautor
                olddata.autoren.forEach(autor =>
                {
                    procZeitschrift.add(sql[59], [data.id, mediumData[1], data.buchid, data.aufsatzid]); 
                });
            }
            if (data.autoren !== null) {   //insert all new relations in relautor
                for (i=0; i < data.autoren.length; i++) { ((i) => {
                    if (data.autoren[i].includes(",")) {
                        autorenArr = data.autoren[i].split(",").map(strtrim);
                    } else { //ein Name der Art "Müller" oder "Hans" wird immer als Nachname gespeichert
                        autorenArr = [data.autoren.toString(), ""];
                    }
                    procZeitschrift.add(sql[8], [autorenArr[0], autorenArr[1]]);
                    procZeitschrift.add(sql[13], [autorenArr[0], autorenArr[1]]);
                    procZeitschrift.add(sql[9], function (result) 
                    {
                        return [data.id, mediumData[1], data.buchid, data.aufsatzid, result, i+1]
                    }); 
                })(i);}
            }
        }
        if (compareResult.titel !== 0) {
            procZeitschrift.add(sql[60], [data.id, mediumData[1], data.buchid, data.aufsatzid]); // delete all old in reltitel
            for (i=0; i < data.titel.length; i++) { ((i) => {   //add all new in reltitel
                procZeitschrift.add(sql[10], [data.titel[i]]);
                procZeitschrift.add(sql[14], [data.titel[i]]);
                procZeitschrift.add(sql[11], function (result) 
                {
                    return [data.id, mediumData[1], data.buchid, data.aufsatzid, result, data.titeltyp, i+1]
                });
            })(i);}
        }
        procZeitschrift.run();
    }
}
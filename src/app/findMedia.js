/*
    Given an array of IDs: idArr = [id1, id2, ..., idN] where the ids are all distinct and themselves
    arrays of the form idk = [objektid_k, zeitschriftid_k, buchid_k, aufsatzid_k], the main function of this
    script findMediaResultArr(idArr) requests information concerning these database ids, prepares the information
    and returns an array of arrays of the form [objektid, autoren, titelUndVerweise, jahr, medientyp, standort, status]. 
    
    In other words each idk -> [objektid_k, autoren_k, titelUndVerweise_k, jahr_k, medientyp_k, standort_k, status_k]
*/


function compose (object, index, self)
{
    // REQUIRES: ORDER BY id, zeitschriftid, buchid, aufsatzid, titeltyp, titelnr, autortyp, autornr ASC
    let i = self.indexOf(object);
    let previousObject = ( self[i-1] !== undefined ) ? self[i-1] : "nonExistent";
    if (previousObject !== "nonExistent" && previousObject.objektid === object.objektid) {
        if (previousObject.titeltyp === object.titeltyp && previousObject.titelnr < object.titelnr) {
            if ( !previousObject.titel.endsWith(".") ) {
                previousObject.titel = previousObject.titel + ".";
            }
            object.titel = previousObject.titel + " " + object.titel;
            previousObject.objektid = "x";    //TO BE DELETED
        } 
        if (previousObject.autor !== null && previousObject.autortyp === object.autortyp && previousObject.autornr < object.autornr) {
            if (object.autornr < 4) {
                object.autor = previousObject.autor + "; " + object.autor;
            } else if (object.autornr === 4) {
                let m = previousObject.autor.indexOf(";");
                object.autor = previousObject.autor.slice(0,m) + " et al.";
            } else {
                object.autor = object.autor;
            }
            object.titel = previousObject.titel;
            previousObject.objektid = "x";
        }
    } 
    return object;
}

function onlyComposedResults (object) { return object.objektid !== "x"; }

async function findMediaResultArr (matchingIDs) 
{
    let i;
    let result = [];
    let parentsIDs = [], parents = [];  // Zu Buchaufsätzen zugehörige Bücher
    let promises = [];

    async function outputArray (object) 
    {
        let i, titelUndVerweise, medientyp;
        let autortyp = (object.autortyp === 0) ? "" : " (Hrg.)";
        let autoren;
        if (object.autor !== null) { 
            // In media_view wird (Name = "Müller" Vorname = "") als "Müller, " gespeichert
            // Das "," soll in diesem Fall nicht angezeigt werden
            autoren = strtrim(object.autor).endsWith(",") ? 
                strtrim(object.autor).slice(0, object.autor.indexOf(",")) + autortyp : 
                object.autor + autortyp; 
        } else {
            autoren = "";
        }
        let id = object.objektid;
        let standort = object.standortsgn;
        let jahr = (object.jahr !== null) ? object.jahr : "";
        let preis = (object.preis !== null) ? ", " + object.preis + " &euro;" : "";
        let band = (object.band !== null) ? ", Band " + object.band : ""; 
        let seiten = (object.seiten !== null) ? ", S. " + object.seiten : "";
        let nr = (object.zeitschriftNr !== null) ? " Nr. " + object.zeitschriftNr : "";
        let hinweis = (object.hinweis !== null) ? "<p><i>Hinweis</i>: " + object.hinweis + "</p>" : "";
        let ort = (object.ort !== null) ? ", " + object.ort : "";
        let verlag = (object.verlag !== null) ? ", " + object.verlag : ""; 
        let link = "";
        if (object.link !== null) {
            if (filenamePattern.test(object.link)) {
                let filepath = (await dbGet(`SELECT path FROM filepath`, [])).path;
                if (filepath === null) { //filepathDefault from main.js
                    console.log(filepathDefault+object.link);
                    link = "<br><a href='"+filepathDefault+object.link+"' target='_blank'>" + object.link + "</a>";
                } else {
                    console.log(filepath+object.link);
                    link = "<br><a href='"+filepath+object.link+"' target='_blank'>" + object.link + "</a>";
                }
            } else {
                link = "<br><a href='"+object.link+"' target='_blank'>" + object.link + "</a>";
            }
        } else {
            link = "";
        }
        let status;
        if (object.status === 0) {
            status = "vorhanden";
        } else if (object.status === 1) {
            status = "abhanden";
        } else {
            status = "verliehen";
        }

        if (object.buchid !== 0 && object.aufsatzid === 0) {    // Buch   
            titelUndVerweise = object.titel + band + verlag + ort + preis  + link + hinweis;
            medientyp = "Buch";
        }
        if (object.buchid !== 0 && object.aufsatzid !== 0) {     // Buchaufsatz
            i = parents.indexOf(parents.find( ({objektid}) => objektid === object.objektid ));   
            if (!object.titel.endsWith(".")) { object.titel = object.titel + "."; }
            titelUndVerweise = object.titel + " <i> In: " + parents[i].autor + 
                " (Hrg): " + parents[i].titel + "</i>" + band + verlag + ort + preis + link + hinweis;
            medientyp = "Buchaufsatz";
        }
        if (object.zeitschriftid !== 0 && object.aufsatzid === 0) { // Zeitschrift
            if (!object.titel.endsWith(".")) { object.titel = object.titel + "."; }
            titelUndVerweise = object.titel + " <i>" + object.zeitschrift + band + nr + "</i>" + preis + link + hinweis;
            medientyp = "Zeitschrift"; 
        }
        if (object.zeitschriftid !== 0 && object.aufsatzid !== 0) { // Artikel
            if (!object.titel.endsWith(".")) { object.titel = object.titel + "."; }
            titelUndVerweise = object.titel + " <i>" + object.zeitschrift + band + nr + seiten + "</i>" + link + hinweis;
            medientyp = "Artikel";
        }
        if (object.zeitschriftid === 0 && object.buchid === 0) { // Aufsatz
            titelUndVerweise = object.titel + ort + seiten + "</i>" + link + hinweis;
            medientyp = "Aufsatz";
        }
        return [id, autoren, titelUndVerweise, jahr, medientyp, standort, status];
    }

    for (i = 0; i < matchingIDs.length; i++) { 
        ((i)=> 
        {
            promises.push(new Promise (function(resolve, reject)
            {
                db.all(sqlSearchForMediumData(matchingIDs[i]), [], function (err, rows)
                {
                    if (err) {reject(err);}
                    else {
                        rows.forEach((row) => 
                        { 
                            result.push(row);
                            //Parents for essays in books (not needed for articles that won't be cited
                            //with title etc. in the result table):
                            if (row.buchid !== 0  && row.aufsatzid !== 0) {  
                                parentsIDs.push([row.objektid, 0, row.buchid, 0]);
                            }
                        });
                        resolve(result);
                    }
                });
            }));
        })(i);
    }
    await Promise.all(promises).catch(err => {return console.error(err)});
    //sorting the results such that they conform the order of mathingIDs
    //required by bearbeiten.html, callFormularBearbeiten()
    result.sort(function (a, b) 
    {
        let val1 = (a.objektid).toString() + (a.zeitschriftid).toString() + (a.buchid).toString() + (a.aufsatzid).toString();
        let val2 = (b.objektid).toString() + (b.zeitschriftid).toString() + (b.buchid).toString() + (b.aufsatzid).toString();
        return val1 - val2;
    });
    if (parentsIDs.length !== 0) { // Data for books belonging to articles in books
        parentsIDs = parentsIDs
            .map((item) => item.toString()).filter(onlyUnique)
            .map((item)=> {return item.split(",").map(Number)});
        for (i = 0; i < parentsIDs.length; i++) {
            parents = await sqr(sqlCollectionBelongingToArticle(parentsIDs[i]), [], parents);
        }
    }
    parents = parents.map(compose).filter(onlyComposedResults);
    result = result.map(compose).filter(onlyComposedResults).map(outputArray);
    result = Promise.all(result);
    return result;
}

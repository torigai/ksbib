/*
    This script handles the table input for media search requests
    like in index.html or sachgebietssuche.html
*/


// requires table.js

function showResult (result, outputFld, warnFld, nameOfTbl, nameOfSelect, getResultFct, limit, offset)
{
    if (document.getElementById("infoFld") === null) {
        // infoFld ist Container für die Tabelle - damit die Vor/Zurück Pfeile darunter angeheftet werden können
        let newContainer = document.createElement("div");
        newContainer.setAttribute("id", "infoFld");
        newContainer.setAttribute("class", "info");
        outputFld.appendChild(newContainer);
    }
    let tblOutputFld = document.getElementById("infoFld");        
    let counter = 0;
    let stopDBRequests = false;
    let sel, tbl;
    let container = [], div = [];
    if (outputFld.lastElementChild.id !== "infoFld") { // Remove Forward/Backward Btns
        outputFld.removeChild(outputFld.lastElementChild);
    }
    if (result === false) {
        tblOutputFld.innerHTML = "";
        outputFld.innerHTML = "";
        document.getElementById("abbrBtn").focus();
        warnFld.innerHTML = "Kein Suchergebnis";
        return false;
    } else {
        tblOutputFld.innerHTML = "";
        async function onForward ()
        {
            if (stopDBRequests === false) { // there may be open results
                offset = offset + limit;
                result = await getResultFct(limit, offset);
                console.log(result);
                if (result === false) {
                    offset = offset - limit;
                    stopDBRequests = true;
                    return counter;
                } else {
                    document.getElementsByName("nameOfSelect")[counter].options[0].selected = "selected";
                    container[counter].style.display = "none";
                    counter = counter + 1; 
                    cOrderedTbl(counter);
                    return counter;
                }
            } else {    // all results are aquired
                if (document.getElementsByName("nameOfTbl")[counter + 1] !== undefined) {
                    document.getElementsByName("nameOfSelect")[counter].options[0].selected = "selected";
                    container[counter].style.display = "none";
                    container[counter+1].style.display = "";
                    offset = offset + limit;
                    counter = counter + 1;
                    return counter;
                } else {
                    return counter;
                }
            }
        }
        async function onBackward ()
        {   
            offset = offset - limit;
            if (offset < 0) {
                offset = 0;
                return counter = 0;
            } else {
                document.getElementsByName("nameOfSelect")[counter].options[0].selected = "selected";
                container[counter].style.display = "none";
                container[counter-1].style.display = "";
                return counter = counter - 1;
            }
        }
        async function cOrderedTbl (i) 
        {
            div[i] = document.createElement("div");
            container[i] = tblOutputFld.appendChild(div[i]);
            await cOutputTbl(container[i], "nameOfTbl", 
                ["ID", "Autoren", "Titel und Verweise", "Jahr", "Typ", "Standort", "Status"], result);
            tbl = document.getElementsByName("nameOfTbl")[i];
            cSortFld (container[i], "nameOfSelect", [0, 1, 5], tbl);
            return container[i];
        }
        cOrderedTbl(counter);
        cForwardAndBackwardBtns (outputFld, onForward, onBackward);
        return true;
    }
}
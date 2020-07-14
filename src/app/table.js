/*
    This script allows to create a table, if wished with forward and backward buttons,
    for an array of arrays of data as obtained from findMedia.js.   
*/

let tblSelColor = "rgb(255, 77, 77)";
let tblHoverColor = "rgb(230, 230, 230)";
let tblDefaultColor = "initial";

function cOutputTbl (container, tblName, headerNamesArr, entriesArr, boolean) 
{   
    //boolean: undefined, true
    //true: the cells contain all input fields
    //undefined: the first cell contains a button, the others no input fields
    let i;
    let j = 1;
    let data = entriesArr;    // ist ein Array von Arrays: [[1,2,3],[4,5,6], ...]
    let noCols = headerNamesArr.length;
    let noRows = data.length; 
    let th = [], td = [], tr = [], btn = [], txt = [];
    let table = document.createElement("table");
    table.setAttribute("class", "center");
    table.setAttribute("name", tblName);
    container.appendChild(table);
    let header = table.createTHead();
    let headerRow = header.insertRow(0);
    for (i = 0; i < headerNamesArr.length; i++) {
        th[i] = headerRow.insertCell(i);
        th[i].setAttribute("class", "tableHeader");
        th[i].innerHTML = headerNamesArr[i];
    }
    while (j < noRows + 1) {
        tr[j] = table.insertRow(j);
        for (i=0; i < noCols; i++) {
            td[i] = tr[j].insertCell(i);
            td[i].setAttribute("class", "tableCell");
            if (boolean === true) {
                txt[i] = document.createElement("input");
                txt[i].setAttribute("type", "text");
                txt[i].setAttribute("class", "plain txt");
                txt[i].setAttribute("name", "tblTxtFld");
                txt[i].setAttribute("tabindex", "-1");
            }
            if (i === 0) {
                btn[j] = document.createElement("input");
                btn[j].setAttribute("type", "button");
                btn[j].setAttribute("class", "plain");
                btn[j].setAttribute("name", "tblBtn");
                btn[j].setAttribute("tabindex", "-1");
                btn[j].value = data[j-1][i];
                td[i].appendChild(btn[j]);
            } else {
                if (boolean === true) {
                    txt[i].value = data[j-1][i];
                    td[i].appendChild(txt[i]);
                } else {
                    td[i].innerHTML = data[j-1][i];
                }
            }
        }
        j++;
    }
}

function sortTable(val, tbl) 
{
    let table, rows, switching, i, m, n, shouldSwitch;
    table = tbl;
    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            m = Number(rows[i].cells[val].innerHTML) || rows[i].cells[val].innerHTML.toLowerCase();
            n = Number(rows[i + 1].cells[val].innerHTML) || rows[i + 1].cells[val].innerHTML.toLowerCase();
            if (m > n) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function cSortFld (container, selName, colArr, tbl)
{
    let i = 0;
    let opt = [];
    let val;
    let div = document.createElement("div");
    div.setAttribute("class", "center margin margin-bottom");
    let sel = document.createElement("select");
    sel.onchange = function () {sortTable(sel.options[sel.options.selectedIndex].value, tbl);}
    sel.setAttribute("name", selName);
    for (i = 0; i < colArr.length; i++) {
        opt[i] = document.createElement("option");
        opt[i].setAttribute("value", colArr[i]);
        opt[i].innerHTML = tbl.rows[0].cells[colArr[i]].innerHTML;
        sel.appendChild(opt[i]);
    }
    div.appendChild(sel);
    container.insertBefore(div, container.firstElementChild);
    return sortTable(0, tbl);
}

function cForwardAndBackwardBtns (container, onForward, onBackward)
{
    let div = document.createElement("div");
    div.setAttribute("class", "center margin");
    let vorwartsBtn = document.createElement("input");
    vorwartsBtn.setAttribute("type", "button");
    vorwartsBtn.setAttribute("value", "\u2BC8");
    vorwartsBtn.setAttribute("class", "btn distance");
    vorwartsBtn.addEventListener("click", onForward);
    let zuruckBtn = document.createElement("input");
    zuruckBtn.setAttribute("type", "button");
    zuruckBtn.setAttribute("value", "\u2BC7");
    zuruckBtn.setAttribute("class", "btn distance");
    zuruckBtn.addEventListener("click", onBackward);
    div.appendChild(zuruckBtn);
    div.appendChild(vorwartsBtn);
    container.appendChild(div);
}

function tblOnArrow (event)
{
    //move either from button to button or from text-field to text-field
    let elements = (document.activeElement.type === "text") ? 
        Array.from(document.getElementsByName("tblTxtFld")) : Array.from(document.getElementsByName("tblBtn"));
    let l = elements.length;
    let i = elements.indexOf(document.activeElement);
    let activeRow = elements[i].parentElement.parentElement;
    
    if (event.key === "ArrowDown" || event.code === "ArrowDown") {
        event.preventDefault();
        let nextRow = (elements[i+1] !== undefined) ? 
            elements[i+1].parentElement.parentElement : elements[0].parentElement.parentElement;
        if (activeRow.style.backgroundColor == tblSelColor) {
            activeRow.style.backgroundColor = tblSelColor;
        } else {
            activeRow.removeAttribute("style");
        }
        nextRow.style.backgroundColor = (nextRow.style.backgroundColor == tblSelColor) ? 
            tblSelColor : tblHoverColor;
        let nextEl = (elements[i+1] !== undefined) ? elements[i+1] : elements[0];    
        nextEl.focus();
    }
    if (event.key === "ArrowUp" || event.code === "ArrowUp") {
        event.preventDefault();
        let nextRow = (elements[i-1] !== undefined) ? 
            elements[i-1].parentElement.parentElement : elements[l-1].parentElement.parentElement;
        let nextEl = (elements[i-1] !== undefined) ? elements[i-1] : elements[l-1];
        if (activeRow.style.backgroundColor == tblSelColor) {
            activeRow.style.backgroundColor = tblSelColor;
        } else {
            activeRow.removeAttribute("style");
        }
        nextRow.style.backgroundColor = (nextRow.style.backgroundColor == tblSelColor) ? 
            tblSelColor : tblHoverColor;
        nextEl.focus();
    }
}

function enterTableOnArrowDown (event, tblName) 
{
    if (event.key === "ArrowDown" || event.code === "ArrowDown") {
        event.preventDefault();
        if (document.getElementsByName(tblName)[0] !== undefined) {
            let btns = Array.from(document.getElementsByName("tblBtn"));
            let row = btns[0].parentElement.parentElement;
            row.style.backgroundColor = (row.style.backgroundColor == tblSelColor) ? tblSelColor : tblHoverColor;
            btns[0].focus();
            return true;
        } else {
            return false;
        }
    }
}

function tblAddEventListenerArrow ()
{
    Array.from(document.getElementsByName("tblBtn")).forEach(btn => 
    {
        return btn.addEventListener("keydown", tblOnArrow)
    });
    if (document.getElementsByName("tblTxtFld")[0] !== undefined) {
        Array.from(document.getElementsByName("tblTxtFld")).forEach(fld => 
        {
            return fld.addEventListener("keydown", tblOnArrow)
        });
    }
}
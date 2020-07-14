//REQUIRES
// table.js

async function createFormular (frm, labelName, callback)
{
      let tbl = document.createElement("div");
      tbl.setAttribute("class", "rTable");
      let tblBody = document.createElement("div");
      tblBody.setAttribute("class", "rTableBody");
      let tblRow = document.createElement("div");
      tblRow.setAttribute("class", "rTableRow margin-bottom");                        
      let tblCell1 = document.createElement("div");
      tblCell1.setAttribute("class", "rTableCell middle");
      let tblCell2 = document.createElement("div");
      tblCell2.setAttribute("class", "rTableCell middle");
      let txt = document.createElement("input");
      txt.setAttribute("type","text");
      txt.setAttribute("size","10");
      txt.setAttribute("id", "fld");
      let label = document.createElement("label");
      label.innerHTML = labelName;
      let br1 = document.createElement("br");
      let br2 = document.createElement("br");
      let btn = document.createElement("input");
      btn.setAttribute("type", "button");
      btn.setAttribute("class", "btn");
      btn.setAttribute("value", "+");
      btn.setAttribute("id", "OKBtn");
      tblCell1.appendChild(label);
      tblCell1.appendChild(br1);
      tblCell1.appendChild(txt);
      tblCell2.appendChild(br2);
      tblCell2.appendChild(btn);
      tblRow.appendChild(tblCell1);
      tblRow.appendChild(tblCell2);
      tblBody.appendChild(tblRow);
      tbl.appendChild(tblBody);

      let warndiv = document.createElement("div");
      warndiv.setAttribute("id", "warnTbl");
      warndiv.setAttribute("class", "center warning");

      let outdiv = document.createElement("div");
      outdiv.setAttribute("id", "outTbl");
      outdiv.setAttribute("class", "center margin-bottom");

      let tbl2 = document.createElement("div");
      tbl2.setAttribute("class", "rTable margin");
      let tbl2Body = document.createElement("div");
      tbl2Body.setAttribute("class", "rTableBody");
      let tbl2Row = document.createElement("div");
      tbl2Row.setAttribute("class", "rTableRow");                        
      let tbl2Cell1 = document.createElement("div");
      tbl2Cell1.setAttribute("class", "rTableCell middle");
      let tbl2Cell2 = document.createElement("div");
      tbl2Cell2.setAttribute("class", "rTableCell middle");
      let save = document.createElement("input");
      save.setAttribute("type", "button");
      save.setAttribute("class", "btn");
      save.setAttribute("value", "Speichern");
      save.setAttribute("id", "saveBtn");
      let abbr = document.createElement("input");
      abbr.setAttribute("type", "button");
      abbr.setAttribute("class", "btn");
      abbr.setAttribute("value", "Abbrechen");
      abbr.setAttribute("id", "abbrBtn");
      tbl2Cell1.appendChild(save);
      tbl2Cell2.appendChild(abbr);
      tbl2Row.appendChild(tbl2Cell1);
      tbl2Row.appendChild(tbl2Cell2);
      tbl2Body.appendChild(tbl2Row);
      tbl2.appendChild(tbl2Body);

      frm.outFld.innerHTML = "";          
      await frm.outFld.appendChild(tbl);
      await frm.outFld.appendChild(warndiv);
      await frm.outFld.appendChild(outdiv);
      await frm.outFld.appendChild(tbl2);
      return await callback();   
}

function selRow (link) 
{ 
    if (link.style.backgroundColor == tblSelColor) {
        link.removeAttribute("style");
    } else {
        link.style.backgroundColor = tblSelColor;
    }
}

function keypressBtn (event, link, fieldToFocus) 
{
    if (event.key === "Delete" || event.which === 46) {
        event.preventDefault();
        let parentRow = link.parentElement.parentElement;
        if (link.classList.contains("neu")) {
            let i = parentRow.rowIndex;
            parentRow.parentElement.parentElement.deleteRow(i);
            return fieldToFocus.focus();
        } else {
          let empty = Array.from(parentRow.children).filter(el => {return (strtrim(el.firstElementChild.value) === "")});
          if (empty.length > 0) {
            return false;
          } else {
            return selRow(parentRow);
          }
        }
    }
    if (!link.classList.contains("neu")) {
      if (event.keyCode === 32 || event.which === 32 ) {
          event.preventDefault();
            return link.parentElement.nextElementSibling.firstElementChild.focus();  
      }
    }
    if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault();
        return document.getElementById("saveBtn").click();
    }
}

function keypressSgInput (event) 
{ 
    if (event.key === "Delete" || event.which === 46) {
      console.log("delete");
        event.preventDefault();
        let parentRow = this.parentElement.parentElement;
        let empty = Array.from(parentRow.children).filter(el => {return (strtrim(el.firstElementChild.value) === "")});
        if (empty.length > 0) {
          return false;
        } else {
          return selRow(parentRow);
        }
    }
    if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault();
        document.getElementById("saveBtn").focus();
        return document.getElementById("saveBtn").click();
    }
}

function onfocusNewInput (tableName)
{
    if (document.getElementsByName(tableName)[0] !== undefined) {
      let allRows = Array.from(document.getElementsByName(tableName)[0].rows);
      allRows.forEach(row =>
      {
          if (row.style.backgroundColor === tblHoverColor) {
              return row.style.backgroundColor = "transparent";
          } else {return false;}
      });
    }
}

function onEnterNewInput (event)
{
  if (event.keyCode === 13 || event.which === 13) {
    event.preventDefault();
    document.getElementById("OKBtn").click();
  } else { return false; }  
}

async function addToTable (newDataArr, tableName, callback, fieldToFocus, form)
{
    //Exactly one column has to be an input field because of function tblOnArrow from table.js
    //movement either along buttons or along text-fields
    let row = document.getElementsByName(tableName)[0].insertRow(1);
    row.setAttribute("class", "hoverable");

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("class", "plain txt");
    input.setAttribute("name", "tblTxtFld");
    input.setAttribute("tabindex", "-1");
    input.setAttribute("readonly", "readonly");
    input.addEventListener("keydown", tblOnArrow);
    input.value = newDataArr[1];

    let btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "plain neu");
    btn.setAttribute("name", "tblBtn");
    btn.setAttribute("tabindex", "-1");
    btn.value = newDataArr[0];
    btn.addEventListener("keypress", function () 
    {
        return keypressBtn (event, btn, fieldToFocus, form)
    });
    btn.addEventListener("keydown", tblOnArrow);

    let cell1 = await row.insertCell(0);
    cell1.setAttribute("class", "tableCell");
    await cell1.appendChild(btn);

    let cell2 = await row.insertCell(1);
    cell2.setAttribute("class", "tableCell");
    await cell2.appendChild(input);

    if (form !== undefined) {
      let input2 = document.createElement("textnode");
      input2.innerHTML = newDataArr[2];      
      
      let cell3 = await row.insertCell(2);
      cell3.setAttribute("class", "tableCell");
      await cell3.appendChild(input2);      
    }

    return await callback();
}

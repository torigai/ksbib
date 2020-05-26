function strtrim (str) { return str.replace(/\s+/g,' ').trim(); }
function stringNotEmpty (str) { return strtrim(str) !== ""; }
function onlyUnique (value, index, self) { return self.indexOf(value) === index; }

/* 
    XHR 
*/

handleEvent = function () 
{
    return;
}
onLoadenedXHR = function (newFct) 
{
    handleEvent = newFct;    
}

function xhr (url, cFunction) 
{
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.addEventListener("loadend", handleEvent);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cFunction(this);
        }
    };
    xhttp.open("POST", url, true);
    xhttp.send();
}


/* 
    FORMULAR 
*/

function cformular (varFormular, varWarnfield, varOutputfield, varSubmitBtn) 
{
    this.formular = varFormular;
    this.formular.setAttribute("onsubmit", "return false");
    this.warnFld = varWarnfield;
    this.outFld = varOutputfield;
    this.sbmtBtn = varSubmitBtn;
    this.elements = this.formular.elements;
    this.inFld = this.formular.getElementsByTagName("input");
    this.textFld = this.formular.getElementsByClassName("txt");
    this.btn = this.formular.getElementsByClassName("btn");
    this.sbmt = function () 
    {
        return;
    }
    this.newSbmt = function (newFct) 
    {
        this.sbmt = newFct;
    }
    this.res = function (xhttp) 
    {
        this.outFld.innerHTML = xhttp.responseText;
    }
    this.reset = function () 
    {
        varFormular.reset();
    }
    this.newReset = function (newFct) 
    {
        this.reset = newFct;
    }
}


/*
    FOOTER
*/

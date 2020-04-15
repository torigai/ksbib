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
    DATEN OBJEKT
*/

function buch (id, standort, autoren, autortyp, titel, jahr, ort, verlag, auflage, band, seiten, isbn, preis, sachgebietsnr, hinweis, stichworte)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;         //typ 0 (autor) oder 1 (hrg)
    this.autortyp = autortyp;
    this.titel = titel;             //typ 0 buchtitel
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
}
function buchaufsatz (id, standort, autoren, titel, jahr, ort, verlag, auflage, band, seiten, isbn, preis, sachgebietsnr, hinweis, stichworte, hrg, buchtitel)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;         //typ 0 (autor)
    this.titel = titel;             //typ 0 buchtitel
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
    this.hrg = hrg;                 //herausgebernamen mit autortyp 1 : hrg
    this.buchtitel = buchtitel;     //typ 0 : buchtitel
}
function zeitschrift (id, standort, autoren, titel, journal, kuerzel, band, nr, jahr, preis, sachgebietsnr, hinweis, stichworte)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;         //typ 1 : hrg
    this.titel = titel;             //typ 0 : zeitschrifttitel
    this.journal = journal;
    this.zeitschriftkuerzel = kuerzel;
    this.band = band;
    this.nr = nr;
    this.jahr = jahr;
    this.preis = preis;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte;   
}
function artikel (id, standort, autoren, titel, journal, kuerzel, band, nr, jahr, zeitschrifttitel, preis, seiten, sachgebietsnr, hinweis, stichworte) 
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;         //typ 0 : autoren
    this.titel = titel;             //typ 0 : titel des artikels
    this.journal = journal;
    this.zeitschriftkuerzel = kuerzel;
    this.band = band;
    this.nr = nr;
    this.jahr = jahr;
    this.preis = preis;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte; 
    this.zeitschrifttitel = zeitschrifttitel; //typ 0 : buch-/zeitschrifttitel
    this.seiten = seiten;
}
function aufsatz (id, standort, autoren, titel, jahr, ort, seiten, sachgebietsnr, hinweis, stichworte)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;     //typ 0 : autor
    this.titel = titel;         //typ 1 : aufsatztitel/track
    this.jahr = jahr;
    this.ort = ort;
    this.seiten = seiten;
    this.sachgebietsnr = sachgebietsnr;
    this.hinweis = hinweis;
    this.stichworte = stichworte;
}


/*
    FOOTER
*/

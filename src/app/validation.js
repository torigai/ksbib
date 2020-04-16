
const warnColor = "red";
const defaultColor = "#232627";
let err = [];
let message = [];


/*
    REGEX PATTERN
*/

const sachgebietsnrPattern = /^0$|[1-9]{1}[0-9]{0,4}$/;  //[0,99999]
const textPattern = /^[\d\wÄÖÜäüöß\s.,:!°?"\-'()#+;]*$/;  //Normaler Text
const buchstabenPattern = /^[a-zäüöß\s]*$/i;          //Buchstaben und Leerzeichen
const zahlenPattern = /^\d+$/;
//const zahlenPattern = /^0$|^[1-9]{1}[0-9]{0,2}$/;     //ganze Zahlen [0,999]
const reelleZahlenPattern = /^\d+(,?)(\d+)?$/;        //Null und postive reelle Zahlen
const jahreszahlPattern = /^[1-9]{1}[0-9]{3}$/;       //vierstellige ganze Zahl > 1000
const seitenPattern = /^[xiv]+(\s?-\s?[xiv]+)?$|^[1-9]{1}[0-9]{0,4}(\s?-\s?[1-9]{1}[0-9]{0,4})?$/; //max fünfstellige Seiten; von 3 - 10
const isbnPattern = /^(\d{10}|\d{13})$/;              //10 oder 13 stellige ganze Zahl > 0
const namenPattern = /^[a-züöäß]+(,\s[a-zäüöß]+(\s[a-zäüöß].){0,2})?$/i;  // "Müller, Adam" oder "Müller, Adam A." 
                                                                        // oder "Müller, Adam A. B." oder "Müller"


/*
    NACHRICHTEN AN DEN USER
*/


message[0] = function (string) { return "Bitte gib " + string + " ein"; }
message[1] = function (string) { return "Die Eingabe ist auf " + string + " beschränkt"; }
message[2] = "Die Eingabe ist ungültig";
message[3] = function (string) { return string + " exisitert nicht"; }
message[4] = function (string) { return string + " exisitert bereits"; }


/*
    FILTER UND DATENBEARBEITUNG
*/


function stringNotEmpty (str) { return strtrim(str) !== ""; }
function onlyUnique (value, index, self) { return self.indexOf(value) === index; }
function strtrim (str) { return str.replace(/\s+/g,' ').trim(); }

/*
    TESTFUNKTIONEN

    der Index j ist true, falls die Eingabe Pflicht ist, sonst false
    el ist ein formularelement, i dessen index
*/


function conformAndValidateYear (el, i, j)     
{
    let jahr = el.value.trim();
    if (j == true && jahr == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && jahr == "") {
        return null;
    }
    if (jahr !== "" && jahreszahlPattern.test(jahr) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    } else {
        return jahr;
    }
}
    
function conformAndValidateNumber (el, i, j)
{
    let zahl = el.value.trim();
    if (j == true && zahl == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    } 
    if (j == false && zahl == "") {
        return null;
    }
    if (zahl !== "" && zahlenPattern.test(zahl) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    } 
    if (zahl > 500) {
        err[err.length] = i + "*" + message[1]("eine Zahl kleiner oder gleich 500");
        return false;
    }
    return zahl;
}

function conformAndValidateCosts (el, i, j)
{
    let preis = el.value.trim();
    let d = preis - 10000;
    if (j == true && preis == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && preis == "") {
        return null;
    }
    if (preis !== "" && zahlenPattern.test(preis) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    }
    if (d > 0) {
        err[err.length] = i + "*" + message[1]("10'000");
        return false;
    }
    return preis;
}

function conformAndValidateZeitschrift (el, i, j) 
{
    let journal = strtrim(el.value);      
    if( textPattern.test(journal) == false ) {
        err[err.length] = i + "*" + message[2];
        return false;
    }
    if (j == false && journal == "") {
        return null;
    }
    if (j == true && journal == "") {
        err[err.length] = i + "*" + message[0]("einen Namen");
        return false;
    }
    return journal;
}

function conformAndValidateAuthor (el, i, j)
{
    let name = strtrim(el.value);            
    if (j == true && name == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && name == "") {
        return null;
    }
    if (namenPattern.test(name) == false) {
        err[err.length] = i + "*" + message[2];
        return false;   
    }
    return name;
}

function conformAndValidateAuthorArr (el, i, j)
{
    let autorenarr = [];
    if (j == false && el.value.match(/[a-zöäüß]/i) == null) {
        return null;
    }
    if (j == true && el.value.match(/[a-zöäüß]/i) == null) {
        err[err.length] = i + "*" + message[0]("einen Autornamen");
        return false;
    } else {
        autorenarr = el.value.replace(/\n/g, "*").split("*").filter(stringNotEmpty);
        if (autorenarr.length>20) {
            err[er.length] = i + "*" + message[1]("20 Autoren");
            return false;
        }
        function testName (autor) 
        {
            let name = strtrim(autor);            
            if (namenPattern.test(name) == false) {
                err[err.length] = i + "*" + message[2];
                return false;   
            }
            return name;
        }
        return autorenarr.map(testName).filter(onlyUnique);
    }
}

function conformAndValidateTitle (el, i, j)  //der Index j ist true, falls die Eingabe eines Titels Pflicht ist, sonst false
{
    if (j == true && el.value.match(/[a-zöäüß]/i) == null) {
        err[err.length] = i + "*" + message[0]("einen Titel");
        return false;
    } else {
        function testTitleLength (titelarr)
        {
            if (titelarr.length > 3) {
                err[err.length] = i + "*" + message[1]("einen Titel und zwei Untertitel");
                return false;    
            }
            return titelarr;
        }
        function validateTitle (title)
        {
            if (textPattern.test(title) == false) {
                err[err.length] = i + "*" + message[2];
                return false;
            } else {
                return title;
            }
        }
        let titelarr = el.value.replace(/\n/g, "*").split("*").filter(stringNotEmpty).map(strtrim);
        testTitleLength(titelarr);
        return titelarr.map(validateTitle).filter(onlyUnique);
    }
}

function conformAndValidatePages (el, i, j)
{
    let pages = strtrim(el.value);   
    if (j == true && pages == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && pages == "") {
        return null;
    }
    if (pages !== "" && seitenPattern.test(pages) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    }
    if (pages.match(/-/) && pages.match(/\d/)) {
        let m = pages.indexOf("-");
        let d = pages.slice(0,m) - pages.slice(m+1);
        if (d >= 0) {
            err[err.length] = i + "*" + message[2];
            return false;
        }
    }
    return pages;
}

function conformAndValidateComment (el, i, j)
{
    let comment = strtrim(el.value);
    if (j == true && comment == "") {
        err[err.length] = i + "*" + message[0]("eine Anmerkung");
        return false;
    }
    if (j == false && comment == "") {
        return null;
    }
    if (comment.length > 1000) {
        err[err.length] = i + "*" + message[1]("1000 Zeichen");
        return false;
    }
    if (textPattern.test(comment) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    } else {
        return comment;
    }
}

function conformAndValidateSgnr (el, i, j)
{
    let sgnrarr = el.value.replace(/\n/g, "*").split("*").filter(stringNotEmpty);
    if (j == true && strtrim(el.value) == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (sgnrarr.length > 20) {
        err[err.length] = i + "*" + message[1]("20 Sachgebietsnummern");
        return false;
    }
    function testSgnr (sgnr)
        {
            let x = sgnr.replace(/\s+/g,'');
            if (sachgebietsnrPattern.test(x) == false) {
                err[err.length] = i + "*" + message[2];
                return false;
            }
            if (x > 29999) {
                err[err.length] = i + "*" + message[1]("29'999");
                return false;
            }
            return x;
        }
    return sgnrarr.map(testSgnr).filter(onlyUnique);
}

function conformAndValidateKeywords (el, i, j)
{
    let keywordarr = el.value.replace(/\n/g, "*").split("*").filter(stringNotEmpty).map(strtrim);
    if (j == true && strtrim(el.value) == "") {
        err[err.length] = i + "*" + message[0]("ein Stichwort");
        return false;
    }
    if (j == false && strtrim(el.value) == "") {
        return null;
    }
    if (keywordarr.length > 20 ) {
        err[err.length] = i + "*" + message[0]("20 Stichwörter");
        return false;
    }
    function testStr (str)
    {
        if (str.length > 100) {
            err[err.length] = i + "*" + message[1]("100 Zeichen");
            return false;
        }
        if (buchstabenPattern.test(str) == false) {
            err[err.length] = i + "*" + message[2];
            return false;
        } else {
            return str;
        }
    }
    return keywordarr.map(testStr).filter(onlyUnique);
}

function conformAndValidateStr (el, i, j, l)
{
    if (j == true && strtrim(el.value) == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && strtrim(el.value) == "") {
        return null;
    }
    if (textPattern.test(strtrim(el.value)) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    } 
    if (el.value.length > l) {
        err[err.length] = i + "*" + message[2];
        return false;  
    }
    return strtrim(el.value);
}

function conformAndValidateISBN (el, i, j)
{
    let isbn = strtrim(el.value);
    if (j == true && isbn == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && isbn == "") {
        return null;
    }
    if (isbn !== "" && isbnPattern.test(isbn) == false) {
        err[err.length] = i + "*" + message[1]("10 oder 13 Stellen und Ziffern größer oder gleich Null");
        return false;
    }
    return isbn;
}

function conformAndValidateSgn (el, i, j)
{
    let sgn = strtrim(el.value);
    if (j == true && sgn == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && sgn == "") {
        return null;
    }
    if (sgn.length > 10 || textPattern.test(sgn) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    }
    return sgn;
}

function conformAndValidateSearchStr (el, i, j)
{
    // Eingabe String, Ausgabe Array (Fall "@x": [ , x]; "x@": [x, ]; "x": [x])
    let data = strtrim(el.value);
    let dataArr;
    function testTxt (txt) 
    {
        if (textPattern.test(txt) == false) {
            err[err.length] = i + "*" + message[2];
            return false;
        }
        return txt;
    }

    if (data.match(/@/g) !== null) {
        let noAT = data.match(/@/g).length;
        if (noAT > 1) {               //es darf nur ein @ vorkommen
            err[err.length] = i + "*" + message[2]; 
            return false;
        }
        if (noAT == 1) {
            dataArr = data.split("@").map(strtrim);
            if (j == true && dataArr[0] == "" && dataArr[1] == "") { 
                err[err.length] = i + "*" + message[0]("einen Suchbegriff"); 
                return false;
            } else {
                return dataArr.map(testTxt);
            }
        }
    } else {
        data = testTxt(data);
        if (j == true && data == "") { 
            err[err.length] = i + "*" + message[0]("einen Suchbegriff"); 
            return false;
        }
        if (data.length > 50) {
            err[err.length] = i + "*" + message[1]('50 Zeichen');
            return false;
        }
        dataArr = [data]; 
        return dataArr;
    }
}

function conformAndValidateStandorteArr (el) 
{
    return conformAndValidateStr(el, "sto" + this.indexOf(el), false, 100);
}

function conformAndValidateStandortSgnArr (el)
{
    return conformAndValidateStr (el, "sgn" + this.indexOf(el), false, 15);
}

function conformAndValidateSachgebiet (el)
{
    return conformAndValidateStr(el, this.indexOf(el), true, 100);
}
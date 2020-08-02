
const warnColor = "red";
const defaultColor = "#232627";
let err = [];
let message = [];


/*
    REGEX PATTERN
*/

const sachgebietsnrPattern = /^0$|[1-9]{1}[0-9]{0,4}$/;  //[0,99999]
const textPattern = /^[À-ú\d\wÄÖÜäüöß\s.,:!°?"\-'()#+\/;]*$/;  //Normaler Text
const buchstabenPattern = /^[À-úa-zäüöß\s]*$/i;          //Buchstaben und Leerzeichen
const zahlenPattern = /^\d+$/;
//const zahlenPattern = /^0$|^[1-9]{1}[0-9]{0,2}$/;     //ganze Zahlen [0,999]
const reelleZahlenPattern = /^\d+((,|.)\d{1,2})?$/;        //Null und postive reelle Zahlen
const jahreszahlPattern = /^[1-9]{1}[0-9]{3}$/;       //vierstellige ganze Zahl > 1000
const seitenPattern = /^[xiv]+(\s?-\s?[xiv]+)?$|^[1-9]{1}[0-9]{0,4}(\s?-\s?[1-9]{1}[0-9]{0,4})?$/; //max fünfstellige Seiten; von 3 - 10
const isbnPattern = /^(\d{10}|\d{13})$/;              //10 oder 13 stellige ganze Zahl > 0
const namenPattern = /^[À-úa-züöäß]+(,\s[À-úa-zäüöß]+(\s[À-úa-zäüöß].){0,2})?$/i;  // "Müller, Adam" oder "Müller, Adam A." 
                                                                        // oder "Müller, Adam A. B." oder "Müller"
const urlPattern = /^(ftp|http|https):\/\/[^ "<>]+$/;
const filenamePattern = /[a-zäüöß0-9\-\_\+]+(.pdf)/i;
const filepathPattern = /^(..\/)+[a-zäüöß0-9\-\_\+]+(\/)/i;


/*
    NACHRICHTEN AN DEN USER
*/


message[0] = function (string) { return "Bitte gib " + string + " ein"; }
message[1] = function (string) { return "Die Eingabe ist auf " + string + " beschränkt"; }
message[2] = "Die Eingabe ist ungültig";
message[3] = function (string) { return string + " exisitert nicht"; }
message[4] = function (string) { return string + " exisitert bereits"; }

/*
    TESTFUNKTIONEN

    der Index j ist true, falls die Eingabe Pflicht ist, sonst false
    el ist ein formularelement, i dessen index
*/

function conformAndValidateFilepath (el)
{
    let link = strtrim(el.value);
    if (link === "") {
        err[0] = message[0]("einen Wert");
        return false;
    } 
    if (filepathPattern.test(link)) {
        return link;
    } else {
        err[0] = message[2];
        return false;
    }
}

function conformAndValidateLink (el, i, j) {
    //Requires main.js
    let link = strtrim(el.value);
    if (j === true && link === "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j === false && link === "") {
        return null;
    }
    if (link !== "" && urlPattern.test(link) === false) {
        if (filenamePattern.test(link) === false) {
            err[err.length] = i + "*" + message[2];
            return false;    
        } else {
            return link;
        }
    } 
    if (link !== "" && urlPattern.test(link) === true) {
        return link;
    }
}

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
        return Number(jahr);
    }
}
    
function conformAndValidateID (el, i, j)
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
    return Number(zahl);
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
    return Number(zahl);
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
    if (preis !== "" && reelleZahlenPattern.test(preis) == false) {
        err[err.length] = i + "*" + message[2];
        return false;
    }
    if (d > 0) {
        err[err.length] = i + "*" + message[1]("10'000");
        return false;
    }
    if (preis.includes(',')) {
        preis = preis.replace(',', '.');
    }
    return Number(preis);
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
    if (j == true && strtrim(el.value) == "") {
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
    let sgnrarr = el.value.split("\n").filter(stringNotEmpty);
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
        let x = strtrim(sgnr);
        if (sachgebietsnrPattern.test(x) == false) {
            err[err.length] = i + "*" + message[2];
            return false;
        }
        if (x > 9999) {
            err[err.length] = i + "*" + message[1]("9'999");
            return false;
        }
        return Number(x);
    }
    return sgnrarr.map(testSgnr).filter(onlyUnique);
}

function conformAndValidateKeywords (el, i, j)
{
    let keywordarr = el.value.split("\n").filter(stringNotEmpty).map(strtrim);
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

function conformAndValidateSachgebietName (el, i, j, l)
{
    if (j == true && strtrim(el.value) == "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    }
    if (j == false && strtrim(el.value) == "") {
        return null;
    }
    if (buchstabenPattern.test(strtrim(el.value)) == false) {
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
    return Number(isbn);
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

function conformAndValidateSachgebiet (el, elColl, j)
{
    //j true: el.value not ""! j false: el.value can be ""
    //elArr is a HTML collection of elements
    return conformAndValidateSachgebietName(el, Array.from(elColl).indexOf(el), j, 100);
}

function conformAndValidateSachgebietsnr (el, i, j)
{
    let val = strtrim(el.value);
    if (j === true && val === "") {
        err[err.length] = i + "*" + message[0]("einen Wert");
        return false;
    } else if (j === false && val === "") {
        return null;
    } else {
        if (val > 9999) {
            err[err.length] = i + "*" + message[1]("9'999");
            return false;
        } else if (sachgebietsnrPattern.test(val) === false) {
            err[err.length] = i + "*" + message[2];
            return false;
        } else {
            return Number(val);       
        }
    }
}

//REQUIRES validation.js
//REQUIRES sqlproc.js
//REQUIRES sql.js

function buch (id, standort, autoren, autortyp, titel, jahr, ort, verlag, auflage, band, seiten, isbn, preis, sachgebietsnr, hinweis, stichworte, status)
{
    this.id = id;
    this.standort = standort;
    this.autoren = autoren;        
    this.autortyp = autortyp;    //typ 0 (autor) oder 1 (hrg)
    this.titel = titel;          
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
    this.status = status;
    this.medientyp = 1; //buch
    this.titeltyp = 0;  //buchtitel
    this.zeitschriftid = 0;
    this.aufsatzid = 0;
}
function conformAndValidateBook(formular, book) 
{
    err = [];   //from validation.js
    function index (element)
    {
        return Array.from(formular.elements).indexOf(element);
    }
    return bookConformed = {
        id: book.id.value,
        standort: book.standort.options[book.standort.selectedIndex].value,
        autoren: conformAndValidateAuthorArr(book.autoren, index(book.autoren), false), //Arr[0]: name, vorname
        autortyp: book.autortyp.value,
        titel: conformAndValidateTitle(book.titel, index(book.titel), true), //Arr[0]: titel1 ...
        jahr: conformAndValidateYear(book.jahr, index(book.jahr), false), 
        ort: conformAndValidateStr(book.ort, index(book.ort), false, 500),
        verlag: conformAndValidateStr(book.verlag, index(book.verlag), false, 500),
        auflage: conformAndValidateNumber(book.auflage, index(book.auflage), false),
        band: conformAndValidateNumber(book.band, index(book.band), false),
        seiten: conformAndValidatePages(book.seiten, index(book.seiten), false),
        isbn: conformAndValidateISBN(book.isbn, index(book.isbn), false),
        preis: conformAndValidateCosts(book.preis, index(book.preis), false),
        sachgebietsnr: conformAndValidateSgnr(book.sachgebietsnr, index(book.sachgebietsnr), false),
        hinweis: conformAndValidateComment(book.hinweis, index(book.hinweis), false),
        stichworte: conformAndValidateKeywords(book.stichworte, index(book.stichworte), false),
        status: book.status.value,
        medientyp: book.medientyp,
        titeltyp: book.titeltyp,
        zeitschriftid: book.zeitschriftid,
        aufsatzid: book.aufsatzid      
    };
}  
function bookData (formular)
{
    let b = new buch (
        document.getElementsByName("id")[0],
        document.getElementById("standort"),
        document.getElementsByName("autoren")[0],
        document.getElementsByName("autortyp")[0],
        document.getElementsByName("titel")[0],
        document.getElementsByName("jahr")[0],
        document.getElementsByName("ort")[0],
        document.getElementsByName("verlag")[0],
        document.getElementsByName("auflage")[0],
        document.getElementsByName("band")[0],
        document.getElementsByName("seiten")[0],
        document.getElementsByName("isbn")[0],
        document.getElementsByName("preis")[0],
        document.getElementsByName("sachgebietsnr")[0],
        document.getElementsByName("hinweis")[0],
        document.getElementsByName("stichworte")[0],
        document.getElementById("status")
    );
    return conformAndValidateBook(formular, b);
}

function addBook (data, callback)
{
    let i, autorenArr = []; 
    let procBook = new cSQLProcessor(callback);

    //Globally used results
    procBook.add(sql[0],[], "buchid"); //=> buchid
    if (data.ort !== null) {procBook.add(sql[2], [data.ort])}; //insert ortid
    procBook.add(sql[17], [data.ort], "ortid"); //=> ortid
    procBook.add(sql[5], [data.verlag]); //insert verlag
    procBook.add(sql[16], [data.verlag], "verlagid"); //=> verlag    

    //Others
    procBook.add(sql[3],[data.id, data.medientyp, data.standort, data.preis, data.band, data.status]);
    if (data.sachgebietsnr.length !== 0) {
        for (i=0; i<data.sachgebietsnr.length; i++) {
            ((i) => 
            {
                procBook.add(sql[15], [data.id, data.sachgebietsnr[i]]);   //insert
            })(i);
        }
    }
    if (data.stichworte !== null) {
        for (i=0; i < data.stichworte.length; i++) { 
            ((i) => 
            { 
                procBook.add(sql[6], [data.stichworte[i]]);    // insert
                procBook.add(sql[12], [data.stichworte[i]]);
                procBook.add(sql[7], function (result) {return [data.id, result]});
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
                procBook.add(sql[8], [autorenArr[0], autorenArr[1]]);
                procBook.add(sql[13], [autorenArr[0], autorenArr[1]]);
                procBook.add(sql[9], function (result) 
                {
                    return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, i+1]
                }); 
            })(i);
        }
    }
    for (i=0; i < data.titel.length; i++) { 
        ((i) => 
        {
            procBook.add(sql[10], [data.titel[i]]);
            procBook.add(sql[14], [data.titel[i]]);
            procBook.add(sql[11], function (result) 
            {
                return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, result, data.titeltyp, i+1]
            });
        })(i);
    }
    procBook.add(sql[1], [data.jahr]);
    procBook.add(sql[4], function (result) 
    {
        return [data.id, data.zeitschriftid, "buchid", data.aufsatzid, data.autortyp, data.hinweis, data.seiten, result, "ortid"]
    });
    procBook.add(sql[18], ["buchid", data.auflage, "verlagid", data.isbn]);
    procBook.run();
}
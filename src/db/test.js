const doSomethingAsync = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('I did something'), 3000)
  })
}

const doSomethingElseAsync = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('I did something else'), 1000)
  })
}

const doSomethingSync = () => {
	setTimeout(() => {return console.log("I did something Sync")}, 3000)
}

const doSomething = async () => {
	console.log("do Something")
	console.log(await doSomethingAsync())
	console.log(await doSomethingElseAsync())
	console.log("geschafft")
}

const doSomethingNew = () => {
	console.log("doSomething")
	console.log(doSomethingSync())
	console.log("geschafft")
}

//doSomething();
//console.log("next code snippet");

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('src/db/ksbib.db');
db.run(`INSERT OR IGNORE INTO ort (id, ort) VALUES (?,?)`, [NULL, 'Berlin'], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`A row has been changed with rowid ${this.lastID}`);
  });
db.close();
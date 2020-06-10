/*
	This script allows to make sqlite database requests serially and in a blocking way.
	The script only functions with selects that have a single value as unique outcome!
	
	1. create an SQLProcessor object: let procSQL = new cSQLProcessor();
	2. adding sql-Queries and Inserts: 

		procSQL.add(sql_i, [data_i] (, global)) or	
		procSQL.add(sql_i, function(result) {return [data_i1,..., result, ... data_ik]} (, global));

		"sql_n" is an sql phrase with a single output value, for instance 
		sql_1 : "SELECT name FROM table WHERE surname = ? AND age = ?".

		"[data_n]" is an array of data like [data_1] = ["karl", 56] or a function that depends on the 
		result of the previous sql and has a data array as output

		"global" is an optional parameter that can be used in the data array in later sql's. It allows
		to let later promises depend on previous promises that are not in direct succession. For instance

		procSQL.add("SELECT MAX(id) AS buchid FROM buch", [], "buchid");
		procSQL.add("SELECT id FROM ort WHERE ort = ?", [München])
		procSQL.add("INSERT INTO buch (id, ort, titel) VALUES (?, ?, ?)", 
			function(result){return ["buchid", result, "Politik Heute"]})

		Notice that "global" has to have quotation marks "" !

	3.  process data: procSQL.run();

		Finally a callback function is called whose variable has values "true" or "false".
*/

function cSQLProcessor (callback)
{
	this.dataArr = [];
	this.globals = [];
	this.add = function (sql, dataArray, globalVar)
	{
		this.dataArr.push([sql, dataArray, globalVar]);
	}
	this.evalGlobals = function (global, value)
	{
		return global = value;
	}
	this.promisify = function (arr, result)
	{
		let globals = this.globals;
		let sql = strtrim(arr[0]);
		let param;
		if (typeof arr[1] === "function") {
			param = (arr[1])(result);
		} else {
			param = arr[1];
		}
		if (globals.length > 0) {
			let hits = globals
				.map( global => 
				{	
					return [global[1], param.findIndex((item)=>{return item == global[0]})];
				})
				.filter(item => {return item[1] !== -1});
			hits.forEach((hit) => {return param[hit[1]] = hit[0];});
			console.log(sql + " : " + param);
		}
		if (sql.includes("SELECT")) {
			return new Promise ((resolve, reject) =>
			{
				db.get(sql, param, function (err, row) //Select
				{
					if (err) {reject(err);} 
					else {
						if (row === undefined) {
							if (arr[2] !== undefined) {
								globals.push([arr[2], null]);
							}
							resolve(null);
						} else {
							if (arr[2] !== undefined) {
								globals.push([arr[2], row[Object.keys(row)[0]]]);	
							}
							resolve(row[Object.keys(row)[0]]);
						}
					}
				});
			});
		}
		if (sql.includes("INSERT") || sql.includes("UPDATE")) {
			return new Promise ((resolve, reject) =>
			{
				db.run(sql, param, function (err)
				{
					if (err) {db.run(`ROLLBACK`); reject(err);}
					else {resolve(sql);}
				});
			});
		}
	}
	this.run = function ()
	{
		if (this.dataArr.length === 0) {return console.error("No sql to process");}
		else {
			db.serialize (()=>
			{	
				this.dataArr.reduce( (p, item) => 
				{
					return p.then(result => {return this.promisify(item, result)});
				}, Promise.resolve(db.run(`BEGIN TRANSACTION`)))
				.then(result => 
				{
					console.log("Data insertion completed"); 
					db.run(`COMMIT`);
					callback(true);
				})
				.catch(error => 
				{
					console.error(error); 
					db.run(`ROLLBACK`);
					callback(false);
				});
			});
		}
	}
/*
	this.promisifyAllSerially = function (array)
	{	
		return array.reduce( (p, arr) => 
		{
			return p.then(result => {return this.promisify(arr, result)});
		}, Promise.resolve());
	}
	this.promisifyAllParallely = function (array)
	{
		return Promise.all(array.map(this.promisify));
	}

*/
}

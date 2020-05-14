

function promisifySQL (sql)
{
	if (sql.includes("SELECT")) {
		return new Promise((resolve, reject) =>
		{
			db.all(sql, [], function (err, rows)
			{
				if (err) {
					reject(err);
				} else {
					console.log(rows);
					resolve()
				}
			});
		});
	} 
	if (sql.includes("INSERT") || sql.includes("UPDATE")) {
		return db.run(sql, [], callback);
	}
}

function promisifySQL (sql)
{

}

function procSQL (array) 
{

}
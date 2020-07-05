	function compare (oldObj, newObj) 
    {
        let noChanges;
        let obj = {};
        for (const key in oldObj) {
            if (Array.isArray(oldObj[key])) {
                noChanges = 0;
                if (newObj[key] === null) {
                    noChanges = 1;
                } else if (oldObj[key].length !== newObj[key].length) {
                    noChanges = 1;
                } else {
                    oldObj[key].forEach(element => 
                    {
                        let i = oldObj[key].indexOf(element);
                        if (element !== newObj[key][i]) {
                            return noChanges = noChanges + 1;
                        } else {
                            return noChanges;
                        }
                    });
                }
                obj[key] = (noChanges === 0) ? 0 : 1;
            } else {
                obj[key] = (oldObj[key] === newObj[key]) ? 0 : 1;
            }
        }
        return obj;
    }
    function columsToUpdate (compareObj, newData, namesArr)
    {
        let resultArr = [];
        namesArr.map(name => 
        {
            if (compareObj[name] === 1) {
                let datum = (typeof newData[name] === "string") ? `'${newData[name]}'` : newData[name];
                resultArr.push(name + "=" + datum);
            }
        });
        return resultArr.toString();
    }
    function updateArray(oldArr, newArr, removeFct, addFct, updateFct)
    {
        let toRemove = [], toAdd = [];
        if (oldArr === null) {
            toAdd = newArr;
            toRemove = [];
        } else if (newArr === null) {
            toAdd = [];
            toRemove = oldArr;
        } else {
            toAdd = newArr.filter(entry => {return !oldArr.includes(entry)});
            toRemove = oldArr.filter(entry => {return !newArr.includes(entry)});
        }
        if (toRemove.length > 0) {
            toRemove.forEach(entry =>
            {
                return removeFct(entry);
            });
        }
        if (updateFct !== undefined && newArr !== null && oldArr !== null) { //for relation tables with nr like autornr in relautor etc.
            let toLeave = [];
            toLeave = newArr.filter(entry => {return oldArr.includes(entry)});
            if (toLeave.length > 0) {
                toLeave.forEach(entry =>
                {
                    return updateFct(entry);
                });
            }
        }
        if (toAdd.length > 0) {
            toAdd.forEach(entry =>
            {
                return addFct(entry);
            });
        }
    }





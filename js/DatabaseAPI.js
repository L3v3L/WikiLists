function saveToData(pageid, title) {
    db.wikis.put({
            id: pageid,
            name: title,
        })
        .then(
            db.wikiInList.put({
                wikiId: pageid,
                listName: listSelected,
            })
        )
        .then(refreshView(listSelected));
}

function removeFromData(pageid) {
    db.wikiInList.where('[wikiId+listName]').equals([pageid, listSelected]).delete()
        .then(refreshView(listSelected));
}

function getAllLists(outPutFunction) {
    db.wikiInList.orderBy('listName').uniqueKeys(function (listNameArray) {
        outPutFunction(listNameArray);
    });
}

function clearAllData(){
    db.wikiInList.clear()
        .then(refreshView(listSelected));  
}

function deleteList(listName){
    db.wikiInList.where('listName').equalsIgnoreCase(listName).delete()
        .then(refreshView(listSelected));
}
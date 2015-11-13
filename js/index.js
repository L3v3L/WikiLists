var list = document.getElementById("list");
var savedList = document.getElementById("savedList");
var searchQuery = document.getElementById("searchQuery");
var listNameChange = document.getElementById("listNameChange");
var debug = document.getElementById("debug");
debug.innerHTML = "";

listSelected = "General";

$("#listTitle").text(listSelected);

//create new database
var db = new Dexie("wikiLists");

db.version(1).stores({
    wikis: '_id, _name, _list'
});

db.open()
    .then(refreshView(listSelected));

searchQuery.onkeypress = function (e) {
    if (e.keyCode == 13) {
        SearchWiki();
    }
};

searchQuery.value = "portogalo";

function SearchWiki() {
    list.innerHTML = "";
    q = '&generator=search' +
        '&gsrnamespace=0' +
        '&gsrlimit=20' +
        '&gsrsearch=' + searchQuery.value;
    getWikiPages(q, displaySearchResults);
}

function QueryWiki(idList) {
    savedList.innerHTML = "";
    q = '&pageids=' + idList;
    getWikiPages(q, displaySavedResults);
}

function displaySavedResults(arrayObj) {
    for (i = 0; i < arrayObj.length; i++) {
        $(savedList).append(' <div class = "item" ><div class="coverImage"><a href=' + arrayObj[i].fullUrl + ' target="_blank"><img  src = ' + arrayObj[i].imageSrc + ' alt = "wiki"></a></div><div class="description"><a href=' + arrayObj[i].fullUrl + ' target="_blank"><h3> ' + arrayObj[i].title + ' </h3></a> <p> ' + arrayObj[i].extract + ' </p></div><div class="addButton"><input type="button" class="button removeButton" value="remove" onclick="removeFromData(' + arrayObj[i].pageId + ')"/></div></div >');
    }
}

function displaySearchResults(arrayObj) {
    for (i = 0; i < arrayObj.length; i++) {
        $(list).append(' <div class = "item" ><div class="coverImage"><a href=' + arrayObj[i].fullUrl + ' target="_blank"><img  src = ' + arrayObj[i].imageSrc + ' alt = "wiki"></a></div><div class="description"><a href=' + arrayObj[i].fullUrl + ' target="_blank"><h3> ' + arrayObj[i].title + ' </h3></a> <p> ' + arrayObj[i].extract + ' </p></div><div class="addButton"><input type="button" class="button saveButton" value="save" onclick="saveToData(' + arrayObj[i].pageId + ',\'' + arrayObj[i].title + '\',\''+listSelected+'\')"/></div></div >');
    }
}

function getWikiPages(q, callback) {
    q = 'https://en.wikipedia.org/w/api.php?format=json' +
        '&action=query' +
        '&prop=pageimages|extracts|info' +
        '&inprop=url' +
        '&callback=?' +
        '&pilimit=max' +
        '&exintro' +
        '&explaintext' +
        '&exsentences=1' +
        '&exlimit=max' +
        '&piprop=original|thumbnail' +
        q;

    var arrayObjects = [];
    $.getJSON(q, function (data) {
        var pages = data["query"]["pages"];
        for (selector in pages) {
            try {
                var imageSrc = JSON.stringify(pages[selector]["thumbnail"]["original"]).replace(/\"/g, "");
            } catch (err) {
                var imageSrc = "images/placeholder.png";
            }
            try {
                var thumbSrc = JSON.stringify(pages[selector]["thumbnail"]["source"]).replace(/\"/g, "");
            } catch (err) {
                var thumbSrc = "";
            }
            try {
                var title = JSON.stringify(pages[selector]["title"]).replace(/\"/g, "");
            } catch (err) {
                var title = "";
            }
            try {
                var extract = JSON.stringify(pages[selector]["extract"]).replace(/\"/g, "");
            } catch (err) {
                var extract = "";
            }
            try {
                var fullUrl = JSON.stringify(pages[selector]["fullurl"]).replace(/\"/g, "");
            } catch (err) {
                var fullUrl = "";
            }
            try {
                var pageId = JSON.stringify(pages[selector]["pageid"]).replace(/\"/g, "");
            } catch (err) {
                var pageId = "";
            }

            var item = {
                imageSrc: imageSrc,
                thumbSrc: thumbSrc,
                title: title,
                extract: extract,
                fullUrl: fullUrl,
                pageId: pageId
            };
            arrayObjects.push(item);
        }
        callback(arrayObjects);
    });

}

function saveToData(pageid, title, listName) {
    db.wikis.put({
            _id: pageid,
            _name: title,
            _list: listName
        })
        .then(refreshView(listName));
}

function refreshView(listName) {
    return db.wikis.where('_list').equals(listName).toArray()
        .then(renderAllWiki);
}

function renderAllWiki(wikiIds) {
    debug.innerHTML = "";
    iquery = "";
    wikiIds.forEach(function (wiki) {
        iquery += wiki._id + "|";
    });

    if (iquery != "") {
        iquery = iquery.slice(0, -1);
        QueryWiki(iquery);
    } else {
        savedList.innerHTML = "";
    }
}

function removeFromData(pageid) {
    db.wikis.where('_id').equals(pageid).delete()
        .then(refreshView(listSelected));
}

function changeList(){
    $('#listChooser').hide();
    listSelected = listNameChange.value;
    $("#listTitle").text(listSelected);
    refreshView(listNameChange.value);
}
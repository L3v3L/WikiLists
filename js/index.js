var list = document.getElementById("list");
var savedList = document.getElementById("savedList");
var searchQuery = document.getElementById("searchQuery");
var debug = document.getElementById("debug");
debug.innerHTML = "";

//create new database
var db = new Dexie("wikiLists");

db.version(1).stores({
    wikis: '_id, _name'
});

db.open()
    .then(refreshView);

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

    var arrayObj = getWikiPages(q);
    for (selector in arrayObj) {
        $(list).append(' <div class = "item" ><div class="coverImage"><a href=' + selector.fullUrl + ' target="_blank"><img  src = ' + selector.imageSrc + ' alt = "wiki"></a></div><div class="description"><a href=' + selector.fullUrl + ' target="_blank"><h3> ' + selector.title + ' </h3></a> <p> ' + selector.extract + ' </p></div><div class="addButton"><input type="button" class="testbutton" value="save" onclick="saveToData(' + selector.pageId + ',\'' + selector.title + '\')"/></div></div >');
    }

}

function QueryWiki(idList) {
    savedList.innerHTML = "";

    q = '&pageids=' + idList;
    getWikiPages(q);

    var arrayObj = getWikiPages(q);
    for (selector in arrayObj) {
        $(savedList).append(' <div class = "item" ><div class="coverImage"><a href=' + selector.fullUrl + ' target="_blank"><img  src = ' + selector.imageSrc + ' alt = "wiki"></a></div><div class="description"><a href=' + selector.fullUrl + ' target="_blank"><h3> ' + selector.title + ' </h3></a> <p> ' + selector.extract + ' </p></div><div class="addButton"><input type="button" class="testbutton" value="remove" onclick="removeFromData(' + selector.pageId + ')"/></div></div >');
    }

}

function getWikiPages(q) {
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
    });

    return arrayObjects;
}

function saveToData(pageid, title) {
    db.wikis.put({
            _id: pageid,
            _name: title
        })
        .then(refreshView);
}

function refreshView() {
    return db.wikis.toArray()
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
        .then(refreshView);
}
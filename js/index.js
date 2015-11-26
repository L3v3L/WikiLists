var list = document.getElementById("list");
var savedList = document.getElementById("savedList");
var searchQuery = document.getElementById("searchQuery");
var listNameChange = document.getElementById("listNameChange");
var debug = document.getElementById("debug");
debug.innerHTML = "";

listSelected = "general";

$("#listTitle").text(listSelected);

//create new database
var db = new Dexie("wikiLists");

db.version(1).stores({
    wikis: '&id, &name',
    wikiInList: '++id,wikiId,listName,&[wikiId+listName]'
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

    searchQuery.value = searchQuery.value.toLowerCase();
    if (searchQuery.value.split(' ').length == 1) {
        searchQuery.value = searchQuery.value.replace(/.*wikipedia.org\/wiki\//, "");
    }

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

    $.get('js/templates/item.html', function (source) {
        var template = Handlebars.compile(source);
        var templateData = {
            items: arrayObj,
            save: false,
            remove: true
        };
        $(savedList).append(template(templateData));
    }, 'html')
}

function displaySearchResults(arrayObj) {
    $.get('js/templates/item.html', function (source) {
        var template = Handlebars.compile(source);
        var templateData = {
            items: arrayObj,
            save: true,
            remove: false
        };
        $(list).append(template(templateData));
    }, 'html')
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
                pageId: pageId,
                rank: s.levenshtein(searchQuery.value, title)
            };
            arrayObjects.push(item);
        }
        arrayObjects = _.sortBy(arrayObjects, 'rank');
        callback(arrayObjects);
    });

}

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

function refreshView(listName) {
    return db.wikiInList.where('listName').equals(listName).toArray()
        .then(renderAllWiki);
}

function renderAllWiki(wikiIds) {
    debug.innerHTML = "";
    iquery = "";
    wikiIds.forEach(function (wiki) {
        iquery += wiki.wikiId + "|";
    });

    if (iquery != "") {
        iquery = iquery.slice(0, -1);
        QueryWiki(iquery);
    } else {
        savedList.innerHTML = "";
    }
}

function removeFromData(pageid) {
    db.wikiInList.where('[wikiId+listName]').equals([pageid, listSelected]).delete()
        .then(refreshView(listSelected));
}

function changeList() {
    $('#listChooser').hide();
    listSelected = listNameChange.value;
    $("#listTitle").text(listSelected);
    refreshView(listNameChange.value);
}

function changeListButton(nameOfList) {
    $('#listChooser').hide();
    listSelected = nameOfList;
    $("#listTitle").text(listSelected);
    refreshView(nameOfList);
}

function getAllLists(outPutFunction) {
    db.wikiInList.orderBy('listName').uniqueKeys(function (listNameArray) {
        outPutFunction(listNameArray);
    });
}

function listChooser() {
    $('#listChooserShortCuts').html("");
    getAllLists(drawLists);
    $('#listChooser').show();
}

function drawLists(arrayOfLists) {
    $('#listChooserShortCuts').html("");
    arrayOfLists.forEach(function (list) {
        $('#listChooserShortCuts').append('<input type="button" class="button" value="' + list + '" onclick="changeListButton(\'' + list + '\');" /><br><br>');
    });
}
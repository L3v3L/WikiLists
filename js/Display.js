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

function drawLists(arrayOfLists) {
    $('#listChooserShortCuts').html("");
    arrayOfLists.forEach(function (list) {
        $('#listChooserShortCuts').append('<input type="button" class="button" value="' + list + '" onclick="changeListButton(\'' + list + '\');" /><br><br>');
    });
}

function listChooser() {
    $('#listChooserShortCuts').html("");
    getAllLists(drawLists);
    $('#listChooser').show();
}
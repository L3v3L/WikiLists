/**
 * Displays list on Saved Results
 * @param {Object Array} arrayObj - Array of wikipedia json objects
 */
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

/**
 * Displays list on Searched Results
 * @param {Object Array} arrayObj - Array of wikipedia json objects
 */
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

/**
 * [[Description]]
 * @param   {String} listName - name of the List to refresh
 * @returns {Object Array} - items stored in certain list on local machine
 */
function refreshView(listName) {
    return db.wikiInList.where('listName').equals(listName).toArray()
        .then(renderAllWiki);
}

/**
 * creates a multi query with wiki IDs and fecthes them
 * @param {String Array} wikiIds - array of wiki IDs
 */
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

/**
 * draw buttons in list chooser
 * @param {String Array} arrayOfLists - array of lists
 */
function drawLists(arrayOfLists) {
    $('#listChooserShortCuts').html("");
    arrayOfLists.forEach(function (list) {
        $('#listChooserShortCuts').append('<input type="button" class="button" value="' + list + '" onclick="changeListButton(\'' + list + '\');" /><br><br>');
    });
}

/**
 * Show list chooser
 */
function listChooser() {
    $('#listChooserShortCuts').html("");
    getAllLists(drawLists);
    $('#listChooser').show();
}
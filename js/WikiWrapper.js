/**
 * Main search from search bar
 */
function SearchWiki() {
    list.innerHTML = "";

    searchQuery.value = searchQuery.value.toLowerCase();
    //if url in search bar, then parse
    if (searchQuery.value.split(' ').length == 1) {
        searchQuery.value = searchQuery.value.replace(/.*wikipedia.org\/wiki\//, "");
    }

    q = '&generator=search' +
        '&gsrnamespace=0' +
        '&gsrlimit=20' +
        '&gsrsearch=' + searchQuery.value;
    getWikiPages(q, displaySearchResults);
}

/**
 * Prepare for simple search
 * @param {String} idList - Title of wikipedia page to search
 */
function QueryWiki(idList) {
    savedList.innerHTML = "";
    q = '&pageids=' + idList;
    getWikiPages(q, displaySavedResults);
}

/**
 * searches wikipedia for query
 * @param {String} q        - query to search wikipedia for
 * @param {Function} callback - function to run after, should take an array of wikipedia objects
 */
function getWikiPages(q, callback) {
    
    var baseUrl = 'https://en.wikipedia.org/w/api.php?';
    var params = $.param({
        format:'json',
        action:'query',
        prop:'pageimages|extracts|info',
        inprop:'url',
        pilimit:'max',
        exintro: true,
        explaintext: true,
        exsentences: 1,
        exlimit:'max',
        piprop:'original|thumbnail'
    });
    
    q = baseUrl + params + q + "&callback=?";
    
    console.log(q);
    
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
             try {
                var index = JSON.stringify(pages[selector]["index"]).replace(/\"/g, "");
            } catch (err) {
                var index = "1000";
            }

            var item = {
                imageSrc: imageSrc,
                thumbSrc: thumbSrc,
                title: title,
                extract: extract,
                fullUrl: fullUrl,
                pageId: pageId,
                rank: s.levenshtein(searchQuery.value, title),
                index: parseInt(index)
            };
            arrayObjects.push(item);
        }
        arrayObjects = _.sortBy(arrayObjects, 'index');
        callback(arrayObjects);
    });

}

/**
 * searches wikipedia for where a certain page is mentioned
 * @param {String} q        - title of page to search mentions
 * @param {Function} callback - function to call when finished, should accept array of wikipedia objects
 */
function getWikiPagesRelated(q, callback) {
    
    var baseUrl = 'https://en.wikipedia.org/w/api.php?';
    var params = $.param({
        format:'json',
        action:'query',
        prop:'linkshere',
        lhlimit:'max',
        lhshow: '!redirect',
        lhprop: 'pageid',
        lhnamespace: 0,
        titles: q
    });
    
    q = baseUrl + params + "&callback=?";
    
    
    var arrayObjects = [];
    $.getJSON(q, function (data) {
        var pages = data["query"]["pages"];
        
        idList = "";
        for (selectorPai in pages) 
            for (selector in pages[selectorPai]["linkshere"]) {
                try {
                    var pageId = JSON.stringify(pages[selectorPai]["linkshere"][selector]["pageid"]).replace(/\"/g, "");
                } catch (err) {
                    var pageId = "BANANA";
                }
                 idList = idList + pageId + "|";
                 console.log(pageId);
            }
        if (idList != "") {
            idList = idList.slice(0, -1);
            callback(idList);
        }
    });

}

/**
 * Prepare for searching where mentioned
 * @param {String} idList - Title of wikipedia page to search mentions
 */
function QueryWikiRelated(idList) {
    list.innerHTML = "";
    q = '&pageids=' + idList;
    getWikiPages(q, displaySearchResults);
}
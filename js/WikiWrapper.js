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

function QueryWikiRelated(idList) {
    list.innerHTML = "";
    q = '&pageids=' + idList;
    getWikiPages(q, displaySearchResults);
}
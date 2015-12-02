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

function enhace(titleToEnhace){
    getWikiPagesRelated(titleToEnhace, QueryWikiRelated);
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

function listChooser() {
    $('#listChooserShortCuts').html("");
    getAllLists(drawLists);
    $('#listChooser').show();
}


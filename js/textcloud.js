var d3 = require("d3"),
    cloud = require("../");
var parseDate = d3.time.format("%d/%m/%Y");

//Get the data
var motive=[];
d3.tsv("data/terrorism_data.tsv", function(error, originaldata) {
    originaldata.forEach(function(d) {
        d.date = parseDate(d.date)
        motive = +d.motive;
    });})


var fill = d3.scale.category20();

function isNumeric(sText) {
    var ValidChars="0123456789"
    var IsNumber=true
    var Char
    for(var i=0;i<sText.length&&IsNumber==true;i++){
        Char=sText.charAt(i)
        if(ValidChars.indexOf(Char)==-1){
            IsNumbe=false
        }
    }
    return IsNumber
}


var wordString = "";
//Get all non-empty words into one array
motive.forEach(function(d) {
    if(d.motive==null){}
    else{wordString+=d.motive+" "}
});

//split the words. wordArray is pretty useless afterwards
var wordArray = wordString.split(" ");

//define the real column now
var wordObjects = [];

wordArray.forEach(function(d) {
    //Keep improving on this line
    if (!isNumeric(d) && !matches(d,"AND","OF","TO","","&","ON","THE","IN","BE","FOR","A")) {
        //looks strange...
        var wordObject = {}
        wordObject.motive = d;
        wordObjects.push(wordObject);
    }
});
//calculate the number of occurence in each word
var wordCount = d3.nest()
    .key(function(d) { return d.motive; })
    .rollup(function(v) { return v.length; })
    .entries(wordObjects);




//wordCount.sort(function(a,b) {
//    return b.values - a.values; });




var tags = [];
//combine counts and words into the same thing
wordCount.forEach(function(d) {
    tags.push([d.key,parseInt(d.values)]);
});
//tags = tags.slice(0,250);



//process the cleaned words
var textcloud = wordObjects
    .map(function(d){ return{text: d.wordObjects, size: +d.tags}})
    .sort(function (a,b) { return d3.descending(a.size, b.size); })
    .slice(0.20);

//actual layout
var layout = cloud()
    .size([500, 500])
    .words(textcloud)
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", draw);

layout.start();

function draw(words) {
    d3.select("body").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) {
            return d.size + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function (d, i) {
            return fill(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
            return d.text;
        });
}

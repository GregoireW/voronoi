import {Delaunay, Voronoi} from "d3-delaunay";
import pkg from "leaflet";

const {L22} = pkg

const L=window.L

const filterMaxY=52, filterMinY = 40, filterMaxX=8.5, filterMinX=-5;

// load data from http://caster.centipede.fr

//const data= await fetch("http://caster.centipede.fr")
const data= await fetch("/caster")
    .then(
        response => response.text()
    )
    .then(
        text => text.split("\n")
    )

const positions= data.filter(line=>line.startsWith("STR"))
    .map(line=>line.split(";"))
    .filter(data=>data.length>10)
    .filter(data=>data[9]>filterMinY && data[9]<filterMaxY && data[10]>filterMinX && data[10]<filterMaxX)
    .map(data=>[ data[9], data[10], data[1] ])

//positions.forEach( ([x, y]) => console.log(x+ " - " + y))

let minX=100000,maxX=-100000,minY=100000,maxY=-100000
for (const element of positions) {
    minX = Math.min(minX, element[0])
    maxX = Math.max(maxX, element[0])
    minY = Math.min(minY, element[1])
    maxY = Math.max(maxY, element[1])
}
console.log("minX="+minX+", maxX="+maxX+", minY="+minY+", maxY="+maxY);

const boundX=filterMinY;
const boundY=filterMinX;

const width = filterMaxY-filterMinY;
const height = filterMaxX-filterMinX;

const context={
    map: null,
    strokeStyle: 'red',
    polyline: [],
    canvas: {
        width: width,
        height: height
    },
    setMap(map){
        this.map=map
    },
    clearRect: function(x, y, w, h) {
    },
    beginPath: function() {
        this.polyline=[];
    },
    closePath: function() {
        console.log("Close path")
    },
    stroke: function() {
        var polyline = L.polyline(this.polyline, {color: this.strokeStyle}).addTo(this.map);
    },
    fill: function() {
        console.log("fill");
    },
    moveTo: function(x, y) {
        this.polyline.push([[x,y]])
    },
    lineTo: function(x,y){
        this.polyline[this.polyline.length-1].push([x,y]);
    },
    rect: function(x, y, w, h) {
        console.log(`rect ${x}, ${y}, ${w}, ${h}`);
    },
    arc: function(x1, y1, x2, y2, r) {
        console.log(`arcTo ${x1}, ${y1}, ${x2}, ${y2}, ${r}`);
    },
}


function update(map) {
    context.setMap(map);
    const delaunay = Delaunay.from(positions);
    const voronoi = delaunay.voronoi([boundX, boundY, boundX+width, boundY+height]);
    //context.clearRect(0, 0, width, height);

    /*
    console.log("=======================================================")
    console.log("delaunay render (1)")
    console.log("=======================================================")

    context.beginPath();
    delaunay.render(context);
    context.strokeStyle = "#ccc";
    context.stroke();
     */

    console.log("=======================================================")
    console.log("voronoi render (2)")
    console.log("=======================================================")

    context.beginPath();
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.strokeStyle = "#000";
    context.stroke();



    console.log("=======================================================")
    console.log("point render (3)")
    console.log("=======================================================")

    //context.beginPath();
    //delaunay.renderPoints(context);
    //context.fill();
    for (let p of positions){
        let mark=L.circleMarker([p[0], p[1]], {    fillOpacity: 0.5, }).addTo(map);
        mark.bindPopup(p[2]);
        mark.on('mouseover',function(ev) {
            mark.openPopup();
        });

    }
}

console.log("Map is building on 45,2.5 / 6")

let map=L.map('map').setView([45.0, 2.5], 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



update(map);

//const {createCanvas, loadImage} = require('canvas')
// const fs = require('fs')

import {createCanvas} from 'canvas'
import {Delaunay, Voronoi} from "d3-delaunay";
import fs from 'fs';


const width = 600
const height = 600

const canvas = createCanvas(width, height)



const data= await fetch("http://caster.centipede.fr")
    .then(
        response => response.text()
    )
    .then(
        text => text.split("\n")
    )

const positions= data.filter(line=>line.startsWith("STR"))
    .map(line=>line.split(";"))
    .filter(data=>data.length>10)
    .filter(data=>data[9]>40 && data[9]<50 && data[10]>0 && data[10]<5)
    .map(data=>[ data[9], data[10] ])

positions.forEach( ([x, y]) => console.log(x+ " - " + y))

let minX=100000,maxX=-100000,minY=100000,maxY=-100000
for (const element of positions) {
    minX = Math.min(minX, element[0])
    maxX = Math.max(maxX, element[0])
    minY = Math.min(minY, element[1])
    maxY = Math.max(maxY, element[1])
}
console.log("minX="+minX+", maxX="+maxX+", minY="+minY+", maxY="+maxY);

const particles = positions.map(([x, y]) => [(x-minX)*(width-10)/(maxX-minX), (y-minY)*(height-10)/(maxY-minY)]);

const n = 200

const context = canvas.getContext('2d') // DOM.context2d(width, height);

function update() {
    const delaunay = Delaunay.from(particles);
    const voronoi = delaunay.voronoi([0.5, 0.5, width - 0.5, height - 0.5]);
    context.clearRect(0, 0, width, height);

    context.beginPath();
    delaunay.render(context);
    context.strokeStyle = "#ccc";
    context.stroke();

    context.beginPath();
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.strokeStyle = "#000";
    context.stroke();

    context.beginPath();
    delaunay.renderPoints(context);
    context.fill();
}

context.canvas.ontouchmove =
    context.canvas.onmousemove = event => {
        event.preventDefault();
        particles[0] = [event.layerX, event.layerY];
        update();
    };

update();

const out = fs.createWriteStream('test.png')
const stream = canvas.createPNGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The PNG file was created.'))

//return context.canvas;



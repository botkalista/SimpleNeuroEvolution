
/**
 * @type {Entity[]}
 */
let entities = [];

let bestScore = 0;
let lastBestScore = 0;

let target = { x: 450, y: 180 };

let startLifespan = 100;
let lifespan = startLifespan;


let speed = 1;

function setup() {
    createCanvas(600, 400);
    background(110);
    tf.setBackend('cpu')


    for (let i = 0; i < 100; i++) {
        const entity = new Entity();
        entities.push(entity);
    }
}

function mem(name) {
    console.log(name, tf.memory().numTensors);
}



function newGeneration() {
    lastBestScore = 0;
    entities.forEach(e => {
        const d = dist(e.pos.x, e.pos.y, target.x, target.y);
        e.score = 500 - d;
        if (e.score > bestScore) bestScore = e.score;
        if (e.score > lastBestScore) lastBestScore = e.score;
    })
    entities = entities.sort((a, b) => b.score - a.score);

    const newEntities = [];

    entities.forEach(e => {

        const crossoverWith = entities[
            Math.floor(random(Math.floor(entities.length / 4)))
        ];

        const newEntityWeightsData = Genetic.crossover(e, crossoverWith, 0.1);
        const newEntity = new Entity();
        newEntity.setWeightData(newEntityWeightsData);
        newEntities.push(newEntity);
    });


    entities.forEach(e => e.brain.model.dispose());
    entities = newEntities;

    lifespan = startLifespan;
}


function draw() {
    for (let i = 0; i < speed; i++) {
        background(110);

        entities.forEach(entity => {
            const move = entity.getMove();
            entity.addForce(move.x, move.y);
            entity.tick();
        });
        lifespan--;

        if (lifespan == 0) {
            noLoop();
            newGeneration();
            loop();
        }

    }

    entities.forEach(e => e.render());
    noStroke();
    fill(0, 110, 0);
    circle(target.x, target.y, 10);

    noStroke();
    fill(0);
    text('Tensors: ' + tf.memory().numTensors, 20, 20);
    text('Best: ' + bestScore.toFixed(1), 20, 40);
    text('Last best: ' + lastBestScore.toFixed(1), 20, 60);


}

class Entity extends GeneticEntity {
    constructor() {
        super([6], 5, 2, 0.1);
        this.pos = createVector(
            random(width / 2 - 20, width / 2 + 20),
            random(height / 2 - 20, height / 2 + 20)
        );
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxVel = 2;
    }

    getMove() {

        const posX = this.pos.x / width;
        const posY = this.pos.y / height;

        const targetX = target.x / width;
        const targetY = target.y / height;

        const velX = this.vel.x / this.maxVel;
        const velY = this.vel.y / this.maxVel;

        const inputData = [posX, posY, targetX, targetY, velX, velY];

        const prediction = this.predict(inputData);

        const x = prediction[0] - 0.5;
        const y = prediction[1] - 0.5;
        return { x, y }

    }

    addForce(x, y) {
        this.acc.add(createVector(x, y));
    }

    tick() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxVel);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    render() {
        noStroke();
        fill(110, 0, 0);
        circle(this.pos.x, this.pos.y, 10);
    }

}


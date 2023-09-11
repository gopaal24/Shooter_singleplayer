const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext('2d');

//Score element
const ScoreEl = document.querySelector('#score_num');
let score = 0;

//Start Button
const StartBtn = document.querySelector('.ScoreBoard button');
const ScoreBoard = document.querySelector('.ScoreBoard');
const BigScore = document.querySelector("#Big-score");

let projectiles = []
let Enemies = []
let particles = []

//init
function init(){
    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d');
    projectiles = []
    Enemies = []
    particles = []
    score = 0;
    ScoreEl.innerHTML = score;
}

//Player
class Player {
    constructor(x, y, radius, colour) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
    }
}

x = window.innerWidth / 2;
y = window.innerHeight / 2;
const player = new Player(x, y, 20, 'white');
player.draw();

//Animate
let animationId
function Animate() {
    animationId = requestAnimationFrame(Animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw();
    projectiles.forEach((projectile) => {
        projectile.update();
    })

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }
        else{
            particle.update()
        }
    })

    Enemies.forEach((enemies, e_index)=>{
        enemies.update();

        const dist = Math.hypot(player.x - enemies.x, player.y - enemies.y)
        if(dist - player.radius - enemies.radius < 1){
            BigScore.innerHTML = score;
            ScoreBoard.style.display = "flex";
            cancelAnimationFrame(animationId);
        }

        projectiles.forEach((projectile, p_index) => {
            const dist = Math.hypot(projectile.x - enemies.x, projectile.y - enemies.y);
            
            if(projectile.x < -projectile.radius ||
                projectile.x > canvas.width + projectile.radius ||
                projectile.y < -projectile.radius ||
                projectile.y > canvas.height + projectile.radius){
                    projectiles.splice(p_index, 1)
                }

            if(dist - projectile.radius - enemies.radius < 1){
                
                for(let i=0;i<enemies.radius;i++){
                    particles.push(new Particles(projectile.x, projectile.y,
                        Math.random()*2, enemies.colour, {x: (Math.random()*5)*(Math.random() - 0.5),y: (Math.random()*5)*(Math.random() - 0.5)}))
                }

                if(enemies.radius-7 > 7){
                    gsap.to(enemies, {
                        radius: enemies.radius - 7
                    })
                    projectiles.splice(p_index, 1);
                    score+=25;
                    ScoreEl.innerHTML = score;
                }
                else{
                    score+=75;
                    ScoreEl.innerHTML = score;
                    setTimeout(()=>{
                        Enemies.splice(e_index, 1);
                        projectiles.splice(p_index, 1);
                    },0)
                }
            }
        })
    })
}


//Bullet
class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

addEventListener('click', (e) => {
    const speed = 5;
    const angle = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width/2);
    const velocity = {
        x: speed*Math.cos(angle),
        y: speed*Math.sin(angle)
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 2, 'white', 
    velocity))
})

//Enenmy
function spawnEnemies(){
    setInterval(() => {
        const radius = 5 + Math.random()*(35-5)
        let x_, y_
        if(Math.random() < 0.5){
             x_ = Math.random() < 0.5 ? -radius : canvas.width + radius 
             y_ = Math.random()*canvas.height
        }
        else{
             x_ = Math.random()*canvas.width
             y_ = Math.random() < 0.5 ? -radius: canvas.height +radius
        }
        const colour = `hsl(${Math.random()*360}, 70%, 50%)`
        const speed = Math.random()*2
        const velocity = {
            x: speed*((canvas.width/2 - x_)/1000),
            y: speed*((canvas.height/2 - y_)/1000)
        }
        Enemies.push(new Enemy(x_, y_, radius,  colour, velocity))
    }, 2500)
}

class Enemy{
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

//Particles
const friction = 0.97
class Particles {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

// Start/Restart game

StartBtn.addEventListener('click',() => {
    ScoreBoard.style.display = "none";
    init();
    Animate();
    spawnEnemies();
})
class Task {
    constructor(name) {
        this.name = name;
        //il faut chercher les prédécesseurs
        this.distance = 0;
        this.cord = {
            x: null,
            y: null
        }
        this.parents = [];
        this.descendants = new Set([]);
        this.style = {
            width: 20,
            height: 20
        }
    }
    draw(canvas, x, y) {
        x = x + Math.floor(this.style.width / 2);
        y = y + Math.floor(this.style.height / 2);
        canvas.translate(x, y);
        canvas.strokeRect(0, 0, this.style.width, this.style.height);
        canvas.font = "10px Arial";
        canvas.fillText(this.name, 4, 13);
        this.cord.x = x;
        this.cord.y = y;
        canvas.resetTransform();
    }
    setParents(instructions, data) {
        this.parents = [...new Set(instructions.map(elem => elem.split(/(<|>)/g)).reduce((acc, cur) => {
            if (cur.length > 1 && cur.includes(this.name)) {
                //on regarde ce qu'il se passe dans l'instruction
                let printedCur = cur.join('').replace("<", "&lt");
                printedCur = printedCur.replace(">", "&gt");
                printConsole(`Dans ${printedCur} il y a ${this.name}`)
                const parentPatern1 = new RegExp(`${this.name}<(${data.tasks.filter(t => t.name != this.name).map(t => t.name).join('|')})$`);
                const parentPatern2 = new RegExp(`(${data.tasks.filter(t => t.name != this.name).map(t => t.name).join('|')})>${this.name}`);
                if (parentPatern1.test(cur.join('')) || parentPatern2.test(cur.join(''))) {
                    let parent = (cur.join('').match(parentPatern1) || cur.join('').match(parentPatern2))[1];
                    printConsole(`On voit que <strong>${this.name}</strong> a <strong>${parent} comme parent</strong> dans ${printedCur}`)
                    data.fleches.push(new Fleche(this, data.tasks.find(t => t.name == parent), "blue"))
                    acc.push(parent);
                }
            }
            return acc;
        }, []))];
    }
    setDistance(data, task = this, cache = []) {
        //on cherche les enfants, donc on regarde ceux qui contiennent la tâche comme parent
        return data.filter(t => t.parents.includes(task.name)).reduce((acc, cur) => {
            if (cache.length >= data.length)
                printError("Il y a une boucle! Revoyez vos instructions")
            //pour tous ceux qu'on trouve, on fait la même chose, jusqu'à qu'il n'y ait plus d'enfant
            if (cur) {
                cache.push(cur);
            }
            let curDistance = (cur.distance || cur.setDistance(data, cur, cache)) + 1;
            if (curDistance > acc) acc = curDistance;
            return acc;
        }, 0)

    }
    setDescendance(data) {
        return data.filter(t => t.parents.includes(this.name)).reduce((acc, cur) => {
            if (cur) {
                acc.push(cur, ...cur.setDescendance(data));
            }
            return acc;
        }, [])
    }
    getPower(matrix, index, count = 0) {

        let e = matrix[index].reverse().reduce((acc, cur) => {
            if (cur !== this && cur !== null) {
                if (this.parents.includes(cur.name))
                    acc = cur.getPower(matrix, index, count) + 1;
            }
            return acc;

        }, 0)
        return e
    }
}

class Fleche {
    constructor(task1, task2, color) {
        this.origine = task1;
        this.destination = task2;
        this.color = color;
    }
    draw(canvas) {
        canvas.beginPath();
        //on reprend les coordonnées
        const xa = this.origine.cord.x + this.origine.style.width,
            ya = this.origine.cord.y + this.origine.style.height / 2,
            xb = this.destination.cord.x,
            yb = this.destination.cord.y + this.origine.style.height / 2
        //on trace le segment entre les deux taches
        canvas.moveTo(xa, ya);
        canvas.lineTo(xb, yb);

        //on récupère le centre pour y tracer la flêche, et on met l'origine du canvas dessus
        //pour faciliter les calculs
        const centerX = (xa + xb) / 2,
            centerY = (ya + yb) / 2;
        canvas.translate(centerX, centerY);

        //on calcule l'angle de rotation des deux traits des fleches
        const angle = Math.atan2((yb - ya), (xb - xa))
        canvas.rotate(angle);
        //on dessine les fleches
        canvas.moveTo(0, 0);
        canvas.lineTo(-5, -5);
        canvas.moveTo(0, 0);
        canvas.lineTo(-5, 5);
        canvas.stroke();
        canvas.resetTransform();
    }
}
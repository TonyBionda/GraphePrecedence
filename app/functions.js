const transposeMatrix = (matrix) => {
    return matrix[0].map((_, i) => matrix.map(r => r[i] || null));
}

const getMatrix = (matrix) => {
    let maxLength = matrix.reduce((acc, cur) => {
        if (cur.length > acc)
            acc = cur.length;
        return acc;
    }, 0)
    matrix.map(m => {
        for (let i = m.length; i < maxLength; i++) {
            m.push(null)
        }
    });
    //https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
    let transposedMatrix = transposeMatrix(matrix)
    return transposedMatrix;
}

const getCanvas = () => {
    const searchedCanvas = document.getElementById("canvas") || document.getElementsByTagName("canvas")[0];
    if (!searchedCanvas) printError("Pas de canvas trouvé...");
    printConsole("Le canvas a été trouvé");
    return searchedCanvas;
}

let canvas1 = getCanvas();

const getInput = () => {
    let { value } = document.getElementById("userInput") || document.getElementsByTagName("textarea")[0];
    if (!value) printError("Pas de texte trouvé...");
    printConsole(`Le user input a été trouvé, son texte est :<br />${value.split("\n").join("<br />")}<br />`);
    return value;
}

const transformDataArrayToMatrix = (data) => {
    console.log(data);
    data.matrix = Array.from(new Array(data.tasks.length), _ => []);
    printConsole(`Après calcul, on voit que:`);
    data.tasks.forEach(elem => {
        data.matrix[elem.distance].push(elem);
        printConsole(`${elem.name} a un poids de ${elem.distance}`);
    })
    const matrix = getMatrix(data.matrix.filter(t => t.length > 0));
    const customMatrix = Array.from({ length: matrix.length }, (_, i) => Array.from({ length: matrix[i].length }, (_, i2) => matrix[i][i2]));
    console.log(matrix)
    transposedMatrix = transposeMatrix(matrix).reverse().map((array, i) => {
        const cache = [];
        array.forEach((cellule, index) => {
            let tachePriorisee;
            tachePriorisee = array.reduce((acc, cur) => {
                if (cache.includes(cur))
                    return acc;
                if (acc == null) {
                    acc = cur;
                    return acc;
                }
                if (cur != null)
                    if (cur.getPower(customMatrix, index) > acc.getPower(customMatrix, index))
                        acc = cur;
                return acc;
            }, null)
            if (tachePriorisee != null)
                cache.push(tachePriorisee)
            let newTaskIndex = array.findIndex(elem => elem == tachePriorisee);
            array[index] = tachePriorisee;
            array[newTaskIndex] = cellule;
            customMatrix[index][i] = tachePriorisee;
            customMatrix[newTaskIndex][i] = cellule;
        })
        return array;
    }).reverse();
    data.matrix = transposeMatrix(transposedMatrix);
    if (testCroisement(data)) {
        printConsole("Des flêches semblent se croiser. Une optimisation s'impose. L'algorithme va s'en charger");
        return data.matrix = updateDistance(data)
    }
    printConsole("La matrice est bien générée");
    console.log("La matrice correspondante est :\n", data.matrix)
    return data.matrix;
}

const getData = (userInput) => {
    //On récupère toutes les instructions, en splittant par retour à la ligne, en enlevant les espaces inutiles,
    //et en enlevant les lignes vides
    const instructions = userInput.split('\n').map(t => t.trim().replace(/\s+/g, '')).filter(t => t.length);
    printConsole(`Les instructions récupérées sont donc : <br />${instructions.map(i => { i = i.replace("<", "&lt"); i = i.replace(">", "&gt"); return i; }).join("<br />")}`);
    if (!instructions) printError("Aucune instruction n'est trouvée!")
    const firstTask = instructions[0].split(/(<|>)/g)[0];
    if (!new RegExp(`^[A-Za-z]{1,3}\\d{1,3}$`, 'g').test(firstTask))
        printError("La première tâche n'est pas bonne! Elle doit commencer par une lettre (jusqu'à 3), puis suivre d'un chiffre pour préciser son numéro")
    //On souhaite vérifier si les tâches se correspondent bien (même nom, numéro qui change)
    const firstTaskName = firstTask.substring(0, instructions[0].split('').findIndex(char => !isNaN(char)));
    printConsole(`La première tâche est ${firstTask}. Toutes les tâches suivantes doivent donc être de la forme ${firstTaskName}[0-999]`)
    const sorteredUniqueTasks = [...new Set(instructions.reduce((acc, cur, i) => {
        if (!cur.startsWith(firstTaskName))
            printError(`Une tâche ou une instruction ne correspond pas au critère donné précédemment, à la ligne ${i + 1}: ${cur}`)
        cur = cur.split(/(<|>)/g);
        cur.forEach((elem) => {
            if (!['<', '>'].includes(elem) && (!elem.startsWith(firstTaskName) || !(new RegExp(`^${firstTaskName}\\d{1,3}$`, 'g').test(elem))))
                if (elem.length > 0)
                    printError(`Une tâche ou une instruction ne correspond pas au critère donné précédemment, à la ligne ${i + 1}: ${elem}`)
                else
                    printError(`Une tâche ou une instruction ne correspond pas au critère donné précédemment, à la ligne ${i + 1}: ${cur.join('')}`)
            if (new RegExp(`^${firstTaskName}\\d+$`).test(elem))
                acc.push(elem);
        })
        return acc;
    }, []).sort())];
    printConsole(`Le tableau des noms de tâches correspondants sont : ${sorteredUniqueTasks.join(' et ')}`)
    return getTasksAsObject(sorteredUniqueTasks, instructions);
}

const getTasksAsObject = (tasks, instructions) => {
    //On créer les objets avec la classe Task
    const data = {
        tasks: [],
        fleches: []
    }
    data.tasks = Array.from(tasks, t => new Task(t));
    data.tasks.map(t => {
        t.setParents(instructions, data);
        return t;
    })
    data.tasks.map(t => {
        t.distance = t.setDistance(data.tasks);
        t.descendants = t.setDescendance(data.tasks);
        return t;
    }).sort(({ distance: a }, { distance: b }) => a - b)
    return data;
}

const updateDistance = (data) => {
    data.tasks.map(tache => {
        let temp = data.fleches.filter(fleche =>
            (fleche.origine == tache || fleche.destination == tache)
            && (fleche.destination.distance - fleche.origine.distance > 1 || fleche.destination.distance < fleche.origine.distance))
        if (temp.length > 0) {
            temp.forEach(fleche => {
                if (fleche.destination.distance - fleche.origine.distance > 1) {
                    printConsole(`<strong>La flêche partant de ${fleche.origine.name} à ${fleche.destination.name} va être optimisée.</strong>`)
                    fleche.origine.distance = fleche.destination.distance - 1
                } else {
                    fleche.destination.distance = fleche.origine.distance + 1
                }
            })
        }
    })
    return transformDataArrayToMatrix(data);
}

const testCroisement = (data) => {
    return data.fleches.some(f1 => data.fleches.some(f2 => {
        if (f1 != f2) {
            const { origine: origine1, destination: destination1 } = f1;
            const { origine: origine2, destination: destination2 } = f2;
            const tasks = [origine1, destination1, origine2, destination2];
            tasks.forEach(task =>
                task.cord = data.matrix.reduce((cord, cur, colIndex) => {
                    cur.forEach((elem, rowIndex) => {
                        if (elem == task)
                            cord = { x: colIndex, y: rowIndex };
                    })
                    return cord;
                }, { x: null, y: null })
            )
            const [{ cord: { x: a, y: b } }, { cord: { x: c, y: d } }, { cord: { x: p, y: q } }, { cord: { x: r, y: s } }]
                = [origine1, destination1, origine2, destination2];
            if ([origine1, destination1].filter(x => [origine2, destination2].includes(x)).length > 0) {
                return;
            }
            return isIntersecting({ x: a, y: b }, { x: c, y: d }, { x: p, y: q }, { x: r, y: s });
        }
    }))
}
function isIntersecting(p1, p2, p3, p4) {
    function CCW(p1, p2, p3) {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}
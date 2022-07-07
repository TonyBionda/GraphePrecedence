const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const drawTask = (data, ctx) => {
    const { height, width } = canvas;
    data.matrix.forEach((tableau, rowIndex) => {
        tableau.forEach((tache, columnIndex) => {
            if (tache != null)
                tache.draw(ctx, width / data.matrix[rowIndex].length * columnIndex, height / transposeMatrix(data.matrix)[0].length * rowIndex)
        })
    });
    printConsole('Les tâches ont été dessinées.')
}

const drawFleche = (data, ctx) => {
    //optimise les redondances et affiche les fleches
    //Pour une fleche f1, si il existe une fleche f2 entre un des descendants de l'origine de f1 et la destination de f1, alors on enleve f2 du tableau. 
    const toRemove = data.fleches.reduce((acc, f1) => {
        acc.push(...data.fleches.filter(f2 => {
            return f1.origine.descendants.includes(f2.origine) && f1.destination == f2.destination
        }));
        return acc;
    }, []);
    if (toRemove.length > 0)
        printConsole(`${toRemove.length > 1 ? `Les flêches ${toRemove.map(({ origine, destination }) => `[${origine.name} => ${destination.name}]`).join(', ')} vont être supprimés car elles sont redondantes.` : `La flêche [${toRemove[0].origine.name} => ${toRemove[0].destination.name}] va être supprimé car elle est redondante.`} `);
    data.fleches = data.fleches.filter(f => !toRemove.includes(f));
    data.fleches.forEach(fleche => fleche.draw(ctx));
    printConsole('Les flêches ont été dessinées.')
}
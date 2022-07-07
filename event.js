const eventTriggered = () => {
    clearConsole();
    console.time();
    let userInput = getInput();
    startProcess(userInput);
    console.timeEnd();
}

const startProcess = (userInput) => {
    const data = getData(userInput);
    printConsole(`Les objets sont créés (voir console)`)
    console.log("Les objets créés sont", data.tasks)
    transformDataArrayToMatrix(data);
    console.log("Le tableau des données (tâches, flêches, matrix) est :", data)
    startDrawing(data);
}

const startDrawing = (data) => {
    let ctx = canvas.getContext("2d");
    clearCanvas(ctx);
    drawTask(data, ctx)
    drawFleche(data, ctx);
}
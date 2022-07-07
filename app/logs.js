const getConsole = () => {
    const searchedConsole = document.getElementById("consoleOutput");
    if (!searchedConsole)
        searchedConsole.innerHTML += "<br />Pas de console trouvée...";
    searchedConsole.innerHTML += `<br />La console a été trouvée`;
    return searchedConsole;
}

let consoleOutput = getConsole();

const printConsole = (...texts) => {
    texts.forEach(t => consoleOutput.innerHTML += `<br />${t}`);
}

const printError = (...texts) => {
    printConsole(texts.map(t => `<strong>${t}</strong>`));
    throw new Error(...texts);
}

const clearConsole = () => {
    console.clear();
    consoleOutput.innerHTML = "";
}
let resultatlisteTeller = 0;

function loadResultatlister() {
    let lister = JSON.parse(localStorage.getItem('resultatlister')) || [];
    console.log('Loading from localStorage:', lister);
    for (let i = 0; i < lister.length; i++) {
        let liste = lister[i];
        opprettResultatliste(liste.id, false, liste.name, liste.sortOrder, liste.type);
        for (let resultat of liste.resultater) {
            leggTilElement(resultat.navn, resultat.verdi, liste.id, liste.type);
        }
        sortereTabell(liste.id, liste.type);
    }
    if (lister.length > 0) {
        visTab(lister[0].id);
    }
}

function saveResultatlister() {
    let container = document.getElementById("resultatlisteContainer");
    let lister = Array.from(container.children).map(listeDiv => {
        let id = listeDiv.id;
        let name = listeDiv.querySelector("h2").textContent;
        let sortOrder = listeDiv.getAttribute("data-sort-order");
        let type = listeDiv.getAttribute("data-type");
        let rader = Array.from(listeDiv.querySelector("tbody").children);
        let resultater = rader.map(rad => {
            let celler = rad.children;
            return { navn: celler[0].textContent, verdi: celler[1].textContent };
        });
        return { id, name, sortOrder, type, resultater };
    });
    console.log('Saving to localStorage:', lister);
    localStorage.setItem('resultatlister', JSON.stringify(lister));
}

function nyResultatliste(sortOrder = 'desc', type = 'sum') {
    resultatlisteTeller++;
    let id = `resultatliste${resultatlisteTeller}`;
    opprettResultatliste(id, true, null, sortOrder, type);
    visTab(id);
}

function opprettResultatliste(id = null, lagre = true, name = null, sortOrder = 'desc', type = 'sum') {
    let container = document.getElementById("resultatlisteContainer");

    let div = document.createElement("div");
    div.classList.add("resultatliste-container", "tab-content");
    div.id = id;
    div.setAttribute("data-sort-order", sortOrder);
    div.setAttribute("data-type", type);

    let defaultName = name || `Resultatliste ${parseInt(id.replace('resultatliste', ''))}`;

    div.innerHTML = `
        <h2 id="title-${id}" contenteditable="true" onblur="oppdaterNavn('${id}')" style="text-align: center;">${defaultName}</h2>
        <div class="button-container" style="text-align: center; margin-bottom: 10px;">
            <button onclick="slettResultatliste('${id}')">Slett resultatliste</button>
        </div>
        <div class="input-container" style="text-align: center; margin-bottom: 10px;">
            <label for="navn-${id}">Navn:</label>
            <input type="text" id="navn-${id}">
            <label for="verdi-${id}">${type === 'sum' ? 'Sum' : 'Tid (Timer:Minutter:Sekunder)'}:</label>
            <input type="text" id="verdi-${id}" placeholder="${type === 'sum' ? '0' : 'hh:mm:ss'}">
            <button onclick="leggTilResultat('${id}', '${type}')">Legg til</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Navn</th>
                    <th>${type === 'sum' ? 'Sum' : 'Tid'}</th>
                    <th>Handling</th>
                </tr>
            </thead>
            <tbody id="liste-${id}"></tbody>
        </table>
    `;
    container.appendChild(div);

    let tabContainer = document.getElementById("tabContainer");
    let tabHeader = document.createElement("div");
    tabHeader.classList.add("tab-header");
    tabHeader.id = `tab-${id}`;
    tabHeader.textContent = defaultName;
    tabHeader.onclick = () => visTab(id);
    tabContainer.appendChild(tabHeader);

    if (lagre) {
        saveResultatlister();
    }
}

function leggTilElement(navn, verdi, listeId, type) {
    let nyttElement = document.createElement("tr");
    nyttElement.innerHTML = `<td>${navn}</td><td>${verdi}</td><td><button onclick="slettResultat(this, '${listeId}')">Slett</button></td>`;

    let liste = document.getElementById(`liste-${listeId}`);
    liste.insertBefore(nyttElement, liste.firstChild);
}

function leggTilResultat(listeId, type) {
    let navn = document.getElementById(`navn-${listeId}`).value;
    let verdi = document.getElementById(`verdi-${listeId}`).value;

    if (type === 'tid' && !/^\d{1,2}:\d{2}:\d{2}$/.test(verdi)) {
        alert("Tid må være i formatet Timer:Minutter:Sekunder (hh:mm:ss)");
        return;
    }

    if (navn && verdi) {
        leggTilElement(navn, verdi, listeId, type);
        saveResultatlister();

        document.getElementById(`navn-${listeId}`).value = "";
        document.getElementById(`verdi-${listeId}`).value = "";

        sortereTabell(listeId, type);
    }
}

function sortereTabell(listeId, type) {
    let tbody = document.getElementById(`liste-${listeId}`);
    let rader = Array.from(tbody.children);
    let sortOrder = document.getElementById(listeId).getAttribute("data-sort-order");

    rader.sort((a, b) => {
        let verdiA = a.children[1].textContent;
        let verdiB = b.children[1].textContent;
        if (type === 'tid') {
            let tidA = verdiA.split(":").reduce((acc, time) => 60 * acc + +time, 0);
            let tidB = verdiB.split(":").reduce((acc, time) => 60 * acc + +time, 0);
            return sortOrder === 'desc' ? tidB - tidA : tidA - tidB;
        } else {
            return sortOrder === 'desc' ? parseInt(verdiB) - parseInt(verdiA) : parseInt(verdiA) - parseInt(verdiB);
        }
    });

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    for (let rad of rader) {
        tbody.appendChild(rad);
    }
}

function slettResultatliste(id) {
    document.getElementById(id).remove();
    document.getElementById(`tab-${id}`).remove();
    saveResultatlister();
    if (document.querySelectorAll('.tab-content').length > 0) {
        visTab(document.querySelector('.tab-content').id);
    }
}

function slettResultat(button, listeId) {
    button.parentElement.parentElement.remove();
    saveResultatlister();
    sortereTabell(listeId);
}

function visTab(id) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".tab-header").forEach(tab => tab.classList.remove("active"));
    document.getElementById(`tab-${id}`).classList.add("active");
}

function oppdaterNavn(id) {
    let name = document.getElementById(`title-${id}`).textContent;
    document.getElementById(`tab-${id}`).textContent = name;
    saveResultatlister();
}

window.onload = loadResultatlister;

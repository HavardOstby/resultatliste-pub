let resultatlisteTeller = 0;

function loadResultatlister() {
    let lister = JSON.parse(localStorage.getItem('resultatlister')) || [];
    console.log('Loading from localStorage:', lister);
    for (let i = 0; i < lister.length; i++) {
        let liste = lister[i];
        opprettResultatliste(liste.id, false, liste.name, liste.sortOrder);
        for (let resultat of liste.resultater) {
            leggTilElement(resultat.navn, resultat.sum, liste.id);
        }
        sortereTabell(liste.id);
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
        let rader = Array.from(listeDiv.querySelector("tbody").children);
        let resultater = rader.map(rad => {
            let celler = rad.children;
            return { navn: celler[0].textContent, sum: parseInt(celler[1].textContent) };
        });
        return { id, name, sortOrder, resultater };
    });
    console.log('Saving to localStorage:', lister);
    localStorage.setItem('resultatlister', JSON.stringify(lister));
}

function opprettResultatliste(id = null, lagre = true, name = null, sortOrder = 'desc') {
    if (!id) {
        resultatlisteTeller++;
        id = `resultatliste${resultatlisteTeller}`;
    } else {
        resultatlisteTeller = Math.max(resultatlisteTeller, parseInt(id.replace('resultatliste', '')));
    }

    let container = document.getElementById("resultatlisteContainer");

    let div = document.createElement("div");
    div.classList.add("resultatliste-container", "tab-content");
    div.id = id;
    div.setAttribute("data-sort-order", sortOrder);

    let defaultName = name || `Resultatliste ${parseInt(id.replace('resultatliste', ''))}`;

    div.innerHTML = `
        <h2 id="title-${id}" contenteditable="true" onblur="oppdaterNavn('${id}')" style="text-align: center;">${defaultName}</h2>
        <div class="button-container" style="text-align: center; margin-bottom: 10px;">
            <button onclick="slettResultatliste('${id}')">Slett resultatliste</button>
        </div>
        <div class="input-container" style="text-align: center; margin-bottom: 10px;">
            <label for="navn-${id}">Navn:</label>
            <input type="text" id="navn-${id}">
            <label for="sum-${id}">Sum:</label>
            <input type="number" id="sum-${id}">
            <button onclick="leggTilResultat('${id}')">Legg til</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Navn</th>
                    <th>Sum</th>
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

function leggTilElement(navn, sum, listeId) {
    let nyttElement = document.createElement("tr");
    nyttElement.innerHTML = `<td>${navn}</td><td>${sum}</td><td><button onclick="slettResultat(this, '${listeId}')">Slett</button></td>`;

    let liste = document.getElementById(`liste-${listeId}`);
    liste.insertBefore(nyttElement, liste.firstChild);
}

function leggTilResultat(listeId) {
    let navn = document.getElementById(`navn-${listeId}`).value;
    let sum = document.getElementById(`sum-${listeId}`).value;

    if (navn && sum) {
        leggTilElement(navn, sum, listeId);
        saveResultatlister();

        document.getElementById(`navn-${listeId}`).value = "";
        document.getElementById(`sum-${listeId}`).value = "";

        sortereTabell(listeId);
    }
}

function sortereTabell(listeId) {
    let tbody = document.getElementById(`liste-${listeId}`);
    let rader = Array.from(tbody.children);
    let sortOrder = document.getElementById(listeId).getAttribute("data-sort-order");

    rader.sort((a, b) => {
        let sumA = parseInt(a.children[1].textContent);
        let sumB = parseInt(b.children[1].textContent);
        return sortOrder === 'desc' ? sumB - sumA : sumA - sumB;
    });

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    for (let rad of rader) {
        tbody.appendChild(rad);
    }

    saveResultatlister();
}

function slettResultat(button, listeId) {
    let rad = button.parentElement.parentElement;
    rad.parentElement.removeChild(rad);
    saveResultatlister();
}

function slettResultatliste(listeId) {
    let liste = document.getElementById(listeId);
    liste.parentElement.removeChild(liste);

    let tabHeader = document.getElementById(`tab-${listeId}`);
    tabHeader.parentElement.removeChild(tabHeader);

    if (document.querySelector('.tab-content.active')) {
        visTab(document.querySelector('.tab-content').id);
    } else if (document.querySelector('.tab-content')) {
        visTab(document.querySelector('.tab-content').id);
    }

    saveResultatlister();
}

function nyResultatliste(sortOrder = 'desc') {
    opprettResultatliste(null, true, null, sortOrder);
    visTab(`resultatliste${resultatlisteTeller}`);
}

function oppdaterNavn(listeId) {
    let titleElement = document.getElementById(`title-${listeId}`);
    let nyttNavn = titleElement.textContent.trim();
    if (nyttNavn === "") {
        nyttNavn = `Resultatliste ${listeId.replace('resultatliste', '')}`;
        titleElement.textContent = nyttNavn;
    }
    document.getElementById(`tab-${listeId}`).textContent = nyttNavn;
    saveResultatlister();
}

function visTab(listeId) {
    let tabContents = document.querySelectorAll(".tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }
    document.getElementById(listeId).classList.add("active");

    let tabHeaders = document.querySelectorAll(".tab-header");
    for (let header of tabHeaders) {
        header.classList.remove("active");
    }
    document.getElementById(`tab-${listeId}`).classList.add("active");
}

document.addEventListener("DOMContentLoaded", loadResultatlister);

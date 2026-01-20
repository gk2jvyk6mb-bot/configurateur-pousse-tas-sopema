document.addEventListener('DOMContentLoaded', () => {
    let angleChoisi = 0;
    let deportMinChoisi = 0;
    let deportMaxChoisi = 0;

    const inputHauteur = document.getElementById('hauteur-stockage');
    const displayRentree = document.getElementById('result-rentree');
    const displaySortie = document.getElementById('result-sortie');

    // --- FONCTION POUR LIRE UN CSV ---
    async function chargerCSV(fichier) {
        const reponse = await fetch(fichier);
        const texte = await reponse.text();
        // Découpe les lignes et ignore la première (en-tête)
        return texte.split('\n').slice(1).filter(ligne => ligne.trim() !== '');
    }

    // --- INITIALISATION DES DONNÉES ---
    async function init() {
        try {
            // Chargement des Télescopiques
            const lignesTelesco = await chargerCSV('telescopiques.csv');
            const listeTelesco = lignesTelesco.map(ligne => {
                const colonnes = ligne.split(';');
                return { 
                    nom: colonnes[0].trim(), 
                    deportMin: parseFloat(colonnes[1].replace(',', '.')), 
                    deportMax: parseFloat(colonnes[2].replace(',', '.')) 
                };
            });

            // Chargement des Cultures
            const lignesCultures = await chargerCSV('cultures.csv');
            const listeCultures = lignesCultures.map(ligne => {
                const colonnes = ligne.split(';');
                return { 
                    nom: colonnes[0].trim(), 
                    angle: parseFloat(colonnes[1].replace(',', '.')) 
                };
            });

            // Configuration des menus avec les données chargées
            setupMenu('search-telesco', 'list-telesco', listeTelesco);
            setupMenu('search-culture', 'list-culture', listeCultures);

        } catch (erreur) {
            console.error("Erreur de chargement des fichiers CSV :", erreur);
        }
    }

    function setupMenu(inputId, listId, data) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        if (!input || !list) return;

        data.forEach(itemData => {
            const item = document.createElement('div');
            item.textContent = itemData.nom;
            item.onclick = function(e) {
                e.stopPropagation();
                input.value = itemData.nom;
                if (itemData.angle !== undefined) angleChoisi = itemData.angle;
                if (itemData.deportMin !== undefined) {
                    deportMinChoisi = itemData.deportMin;
                    deportMaxChoisi = itemData.deportMax;
                }
                effectuerCalcul();
                list.style.display = 'none';
            };
            list.appendChild(item);
        });

        input.addEventListener('click', e => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-content').forEach(el => el.style.display = 'none');
            list.style.display = 'block';
        });

        input.addEventListener('input', function() {
            const search = this.value.toLowerCase();
            let found = false;
            list.querySelectorAll('div').forEach(item => {
                const match = item.textContent.toLowerCase().includes(search);
                item.style.display = match ? 'block' : 'none';
                if (match) found = true;
            });
            list.style.display = found ? 'block' : 'none';
        });
    }

function effectuerCalcul() {
    const h = parseFloat(inputHauteur.value);

    if (h > 0 && angleChoisi > 0 && deportMaxChoisi > 0) {
        const angleRad = angleChoisi * (Math.PI / 180);
        const hypotenuse = h / Math.sin(angleRad);

        const resRentree = hypotenuse - deportMinChoisi;
        const resSortie  = hypotenuse - deportMaxChoisi;

        // --- FLÈCHE RENTRÉE ---
        if (resRentree < 2.5) {
            displayRentree.value = "Pas besoin de pousse tas";
        } else if (resRentree > 8.5) {
            displayRentree.value = "Pousse Tas de + de 8m";
        } else {
            displayRentree.value = resRentree.toFixed(0) + " m";
        }

        // --- FLÈCHE SORTIE ---
        if (resSortie < 2.5) {
            displaySortie.value = "Pas besoin de pousse tas";
        } else if (resSortie > 8.5) {
            displaySortie.value = "Pousse Tas de + de 8m";
        } else {
            displaySortie.value = resSortie.toFixed(0) + " m";
        }

    } else {
        displayRentree.value = "...";
        displaySortie.value = "...";
    }
}


    inputHauteur.addEventListener('input', effectuerCalcul);
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(el => el.style.display = 'none');
    });

    init(); // Lancement du chargement
});
function nev(alap) {
    if (alap == 2) {
        return "kettes";
    }
    if (alap == 10) {
        return "tízes";
    }
    return "tizenhatos";
}

function jo(szam, alap) {
    for (var i = 0; i < szam.length; i++) {
        var karakter = szam[i];

        if (alap == 2 && karakter != "0" && karakter != "1") {
            return false;
        }
        if (alap == 10 && (karakter < "0" || karakter > "9")) {
            return false;
        }
        if (alap == 16 && !((karakter >= "0" && karakter <= "9") || (karakter >= "A" && karakter <= "F"))) {
            return false;
        }
    }
    return true;
}

function valt(szam, alap, cel) {
    var ertek = parseInt(szam, alap);
    if (ertek > Number.MAX_SAFE_INTEGER) {
        return "túl nagy szám";
    }
    return ertek.toString(cel).toUpperCase();
}

function atvalt() {
    var szam = document.getElementById("szam").value.trim().toUpperCase();
    var alap = parseInt(document.getElementById("alap").value);
    var cel = parseInt(document.getElementById("cel").value);
    var eredmeny = document.getElementById("eredmeny");

    if (szam == "") {
        eredmeny.textContent = "Nem adtál meg számot!";
        return;
    }

    if (alap != 0) {
        if (!jo(szam, alap)) {
            eredmeny.textContent = "Ez nem " + nev(alap) + " szám!";
            return;
        }
        eredmeny.textContent = "Eredmény " + nev(cel) + " számrendszerben: " + valt(szam, alap, cel);
        return;
    }

    var alapok = [2, 10, 16];
    var eredmenyek = [];

    for (var i = 0; i < alapok.length; i++) {
        if (jo(szam, alapok[i])) {
            eredmenyek.push({
                alap: alapok[i],
                ertek: valt(szam, alapok[i], cel)
            });
        }
    }

    if (eredmenyek.length == 0) {
        eredmeny.textContent = "Ez nem kettes, tízes vagy tizenhatos szám!";
    } else if (eredmenyek.length == 1) {
        eredmeny.textContent = "A megadott szám " + nev(eredmenyek[0].alap) + " számrendszerben van. Eredmény " + nev(cel) + " számrendszerben: " + eredmenyek[0].ertek;
    } else {
        var egyformak = true;
        for (var j = 1; j < eredmenyek.length; j++) {
            if (eredmenyek[j].ertek != eredmenyek[0].ertek) {
                egyformak = false;
            }
        }

        if (egyformak) {
            eredmeny.textContent = "Eredmény " + nev(cel) + " számrendszerben: " + eredmenyek[0].ertek;
        } else {
            var szoveg = "Ez a szám több számrendszerben is lehet, " + nev(cel) + " számrendszerben: ";
            for (var k = 0; k < eredmenyek.length; k++) {
                szoveg += "Ha " + nev(eredmenyek[k].alap) + ": " + eredmenyek[k].ertek + " ";
            }
            eredmeny.textContent = szoveg + "Ha tudod, melyik, válaszd ki fent!";
        }
    }
}

document.getElementById("gomb").addEventListener("click", atvalt);

document.getElementById("szam").addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        atvalt();
    }
});

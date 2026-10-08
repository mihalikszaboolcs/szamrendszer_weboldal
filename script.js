function nev(alap) {
    if (alap == 2) {
        return "kettes";
    } else if (alap == 10) {
        return "tízes";
    } else {
        return "tizenhatos";
    }
}

function jo(szam, alap) {
    for (var i = 0; i < szam.length; i++) {
        var c = szam[i];

        if (alap == 2 && c != "0" && c != "1") {
            return false;
        }

        if (alap == 10 && (c < "0" || c > "9")) {
            return false;
        }

        if (alap == 16 && !((c >= "0" && c <= "9") || (c >= "A" && c <= "F"))) {
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
    var szam = document.getElementById("szam").value;
    var alap = parseInt(document.getElementById("alap").value);
    var cel = parseInt(document.getElementById("cel").value);
    var eredmeny = document.getElementById("eredmeny");

    szam = szam.trim().toUpperCase();

    if (szam == "") {
        eredmeny.innerHTML = "Nem adtál meg számot!";
        return;
    }

    if (alap != 0) {
        if (jo(szam, alap)) {
            eredmeny.innerHTML = "Eredmény " + nev(cel) + " számrendszerben: " + valt(szam, alap, cel);
        } else {
            eredmeny.innerHTML = "Ez nem " + nev(alap) + " szám!";
        }
        return;
    }

    var alapok = [2, 10, 16];
    var db = 0;
    var szoveg = "";
    var elso = "";
    var egyforma = true;
    var talalt = 0;

    for (var i = 0; i < alapok.length; i++) {
        if (jo(szam, alapok[i])) {
            var uj = valt(szam, alapok[i], cel);

            if (db == 0) {
                elso = uj;
                talalt = alapok[i];
            } else if (uj != elso) {
                egyforma = false;
            }

            db++;
            szoveg = szoveg + "Ha " + nev(alapok[i]) + ": " + uj + "<br>";
        }
    }

    if (db == 0) {
        eredmeny.innerHTML = "Ez nem kettes, tízes vagy tizenhatos szám!";
    } else if (db == 1) {
        eredmeny.innerHTML = "A megadott szám " + nev(talalt) + " számrendszerben van.<br>"
            + "Eredmény " + nev(cel) + " számrendszerben: " + elso;
    } else if (egyforma) {
        eredmeny.innerHTML = "Eredmény " + nev(cel) + " számrendszerben: " + elso;
    } else {
        eredmeny.innerHTML = "Ez a szám több számrendszerben is lehet, " + nev(cel) + " számrendszerben:<br>"
            + szoveg + "Ha tudod, melyik, válaszd ki fent!";
    }
}

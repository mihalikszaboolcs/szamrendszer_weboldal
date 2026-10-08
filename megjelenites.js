var forras = nev.toString() + "\n\n" + jo.toString() + "\n\n" + valt.toString() + "\n\n" + atvalt.toString();
var sorok = forras.split("\n");

var kodDoboz = document.getElementById("kod");
var tabla = document.getElementById("tabla");
var eredmenyDoboz = document.getElementById("eredmeny");
var valtozokDoboz = document.getElementById("valtozok");
var hivasDoboz = document.getElementById("hivas");
var szamlalo = document.getElementById("szamlalo");
var lejatszasGomb = document.getElementById("lejatszas");
var sebessegCsuszka = document.getElementById("sebesseg");

var lepesek = [];
var aktualis = 0;
var fut = false;
var idozito = null;
var vegsoEredmeny = "";
var tablaSorok = {};
var elozoErtekek = {};
var futtathato = null;

function szinez(sor) {
    sor = sor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return sor.replace(/("[^"]*")|\b(function|var|if|else|for|return|true|false)\b|\b(\d+)\b|\b([a-zA-Z]+)(?=\()/g, function (resz, s, k, n, f) {
        if (s) {
            return "<span class=\"str\">" + s + "</span>";
        }
        if (k) {
            return "<span class=\"kw\">" + k + "</span>";
        }
        if (n) {
            return "<span class=\"num\">" + n + "</span>";
        }
        return "<span class=\"fn\">" + f + "</span>";
    });
}

function kodKiir() {
    var html = "";

    for (var i = 0; i < sorok.length; i++) {
        var tartalom = szinez(sorok[i]);
        if (tartalom == "") {
            tartalom = " ";
        }
        html = html + "<div class=\"kodsor\" id=\"kodsor" + i + "\"><span class=\"sorszam\">" + (i + 1) + "</span><span>" + tartalom + "</span></div>";
    }

    kodDoboz.innerHTML = html;
}

function valtozoLista(kezdo) {
    var fejlec = sorok[kezdo];
    var nevek = [];
    var parameterek = fejlec.substring(fejlec.indexOf("(") + 1, fejlec.indexOf(")")).split(",");

    for (var i = 0; i < parameterek.length; i++) {
        if (parameterek[i].trim() != "") {
            nevek.push(parameterek[i].trim());
        }
    }

    for (var j = kezdo + 1; j < sorok.length && sorok[j] != "}"; j++) {
        var talalatok = sorok[j].match(/var (\w+)/g) || [];
        for (var k = 0; k < talalatok.length; k++) {
            var nev2 = talalatok[k].substring(4);
            if (nevek.indexOf(nev2) == -1) {
                nevek.push(nev2);
            }
        }
    }

    var reszek = [];
    for (var m = 0; m < nevek.length; m++) {
        reszek.push(nevek[m] + ": " + nevek[m]);
    }
    return "{" + reszek.join(", ") + "}";
}

function muszerez() {
    var uj = [];
    var fv = "";
    var lista = "{}";

    for (var n = 0; n < sorok.length; n++) {
        var sor = sorok[n];
        var t = sor.trim();
        var eleje = sor.substring(0, sor.length - sor.trimStart().length);

        if (t.indexOf("function ") == 0) {
            fv = t.substring(9, t.indexOf("("));
            lista = valtozoLista(n);
        }

        var hivas = "__lepes(" + n + ", \"" + fv + "\", " + lista + ")";

        if (t == "" || t == "}" || t.charAt(0) == "+") {
            uj.push(sor);
        } else if (t.indexOf("function ") == 0 || t == "} else {") {
            uj.push(sor + " " + hivas + ";");
        } else if (t.indexOf("if (") == 0 || t.indexOf("} else if (") == 0) {
            uj.push(sor.replace("if (", "if (" + hivas + ", "));
        } else if (t.indexOf("for (") == 0) {
            uj.push(sor.replace("; ", "; " + hivas + ", "));
        } else {
            uj.push(eleje + hivas + "; " + t);
        }
    }

    return uj.join("\n");
}

function rogzit(sor, fv, ertekek) {
    if (lepesek.length > 20000) {
        throw new Error("Túl sok lépés");
    }

    var masolat = {};
    for (var kulcs in ertekek) {
        var v = ertekek[kulcs];
        masolat[kulcs] = Array.isArray(v) ? v.slice() : v;
    }

    lepesek.push({ sor: sor, fv: fv, ertekek: masolat });
}

function formaz(v) {
    if (v === undefined) {
        return "undefined";
    }
    if (typeof v == "string") {
        return "\"" + v + "\"";
    }
    if (Array.isArray(v)) {
        return "[" + v.join(", ") + "]";
    }
    if (v !== null && typeof v == "object") {
        return "<" + v.tagName.toLowerCase() + "#" + v.id + ">";
    }
    return String(v);
}

function kesleltetes() {
    var idok = [1100, 750, 500, 350, 240, 160, 100, 60, 30, 10];
    return idok[parseInt(sebessegCsuszka.value) - 1];
}

function uresTabla() {
    tablaSorok = {};
    tabla.innerHTML = "<p class=\"ures\">Írj be egy számot, és nyomd meg az Átváltás gombot. Itt látod majd, ahogy a <b>jo</b> függvény karakterenként végigmegy rajta.</p>";
}

function tablaEpit(szam, alap) {
    tablaSorok = {};
    tabla.innerHTML = "";

    if (szam == "") {
        uresTabla();
        return;
    }

    var alapok = [2, 10, 16];
    if (alap != 0) {
        alapok = [alap];
    }

    for (var i = 0; i < alapok.length; i++) {
        var a = alapok[i];

        var sor = document.createElement("div");
        sor.className = "vizsgalat";

        var cimke = document.createElement("div");
        cimke.className = "cimke";
        cimke.innerHTML = nev(a) + " <small>(" + a + ")</small>";
        sor.appendChild(cimke);

        var cellakDoboz = document.createElement("div");
        cellakDoboz.className = "cellak";
        var cellak = [];

        for (var j = 0; j < szam.length; j++) {
            var cella = document.createElement("div");
            cella.className = "cella";
            cella.innerHTML = "<span></span><small></small>";
            cella.firstChild.textContent = szam[j];
            cellakDoboz.appendChild(cella);
            cellak.push(cella);
        }
        sor.appendChild(cellakDoboz);

        var jelveny = document.createElement("div");
        jelveny.className = "jelveny";
        jelveny.textContent = "még nem nézte";
        sor.appendChild(jelveny);

        tabla.appendChild(sor);
        tablaSorok[a] = { cellak: cellak, jelveny: jelveny };
    }
}

function cellaAllit(cella, allapot) {
    cella.className = "cella" + (allapot ? " " + allapot : "");
    if (allapot == "ok") {
        cella.lastChild.textContent = "✓";
    } else if (allapot == "rossz") {
        cella.lastChild.textContent = "✗";
    } else {
        cella.lastChild.textContent = "";
    }
}

function mostLevesz() {
    var mostaniak = tabla.querySelectorAll(".cella.most");
    for (var i = 0; i < mostaniak.length; i++) {
        mostaniak[i].classList.remove("most");
    }
}

function tablaFrissit(lepes) {
    if (lepes.fv != "jo") {
        mostLevesz();
        return;
    }

    var ts = tablaSorok[lepes.ertekek.alap];
    if (!ts) {
        return;
    }

    var t = sorok[lepes.sor].trim();
    var i = lepes.ertekek.i;

    if (t.indexOf("function jo") == 0) {
        for (var j = 0; j < ts.cellak.length; j++) {
            cellaAllit(ts.cellak[j], "");
        }
        ts.jelveny.className = "jelveny";
        ts.jelveny.textContent = "vizsgálja...";
        return;
    }

    if (t.indexOf("return true") == 0) {
        for (var j = 0; j < ts.cellak.length; j++) {
            cellaAllit(ts.cellak[j], "ok");
        }
        ts.jelveny.className = "jelveny ok";
        ts.jelveny.textContent = "érvényes";
        return;
    }

    if (t.indexOf("return false") == 0) {
        if (i < ts.cellak.length) {
            cellaAllit(ts.cellak[i], "rossz");
        }
        ts.jelveny.className = "jelveny rossz";
        ts.jelveny.textContent = "nem érvényes";
        return;
    }

    if (typeof i == "number" && i < ts.cellak.length) {
        for (var j = 0; j < i; j++) {
            cellaAllit(ts.cellak[j], "ok");
        }
        mostLevesz();
        ts.cellak[i].classList.add("most");
    }
}

function valtozokMutat(lepes) {
    hivasDoboz.textContent = lepes.fv == "atvalt" ? "atvalt()" : "atvalt() → " + lepes.fv + "()";

    var elozo = elozoErtekek[lepes.fv] || {};
    valtozokDoboz.innerHTML = "";

    for (var kulcs in lepes.ertekek) {
        var szoveg = formaz(lepes.ertekek[kulcs]);

        var doboz = document.createElement("span");
        doboz.className = "valtozo";
        if (lepes.ertekek[kulcs] === undefined) {
            doboz.classList.add("ures-ertek");
        }
        if (kulcs in elozo && elozo[kulcs] != szoveg) {
            doboz.classList.add("valtozott");
        }

        var nevResz = document.createElement("b");
        nevResz.textContent = kulcs;
        doboz.appendChild(nevResz);
        doboz.appendChild(document.createTextNode(" = " + szoveg));
        doboz.title = kulcs + " = " + szoveg;
        valtozokDoboz.appendChild(doboz);

        elozo[kulcs] = szoveg;
    }

    elozoErtekek[lepes.fv] = elozo;
}

function sorMutat(index, gorget) {
    var regi = kodDoboz.querySelector(".kodsor.aktiv");
    if (regi) {
        regi.classList.remove("aktiv");
    }

    var sor = document.getElementById("kodsor" + index);
    sor.classList.add("aktiv");
    sor.classList.add("volt");

    if (gorget) {
        var teteje = kodDoboz.scrollTop;
        var alja = teteje + kodDoboz.clientHeight;
        if (sor.offsetTop < teteje + 30 || sor.offsetTop > alja - 50) {
            kodDoboz.scrollTo({ top: sor.offsetTop - kodDoboz.clientHeight / 3, behavior: "smooth" });
        }
    }
}

function lepesMutat(k, gorget) {
    var lepes = lepesek[k];

    sorMutat(lepes.sor, gorget);
    valtozokMutat(lepes);
    tablaFrissit(lepes);

    if (sorok[lepes.sor].indexOf("eredmeny.innerHTML") != -1) {
        eredmenyDoboz.innerHTML = vegsoEredmeny;
        eredmenyDoboz.classList.add("latszik");
    }

    szamlalo.textContent = (k + 1) + " / " + lepesek.length + " lépés";
}

function gombFrissit() {
    if (aktualis >= lepesek.length && lepesek.length > 0) {
        lejatszasGomb.textContent = "↻ Újra";
    } else if (fut) {
        lejatszasGomb.textContent = "⏸ Szünet";
    } else {
        lejatszasGomb.textContent = "▶ Folytatás";
    }
}

function befejez() {
    fut = false;
    mostLevesz();
    var aktiv = kodDoboz.querySelector(".kodsor.aktiv");
    if (aktiv) {
        aktiv.classList.remove("aktiv");
    }

    for (var k = lepesek.length - 1; k >= 0; k--) {
        if (lepesek[k].fv == "atvalt") {
            elozoErtekek = {};
            valtozokMutat(lepesek[k]);
            var utolso = document.getElementById("kodsor" + lepesek[k].sor);
            kodDoboz.scrollTo({ top: utolso.offsetTop - kodDoboz.clientHeight / 2, behavior: "smooth" });
            break;
        }
    }

    hivasDoboz.textContent = "atvalt() lefutott";
    eredmenyDoboz.innerHTML = vegsoEredmeny;
    eredmenyDoboz.classList.add("latszik");
    gombFrissit();
}

function kovetkezo(gorget) {
    if (aktualis >= lepesek.length) {
        befejez();
        return;
    }
    lepesMutat(aktualis, gorget);
    aktualis++;
}

function ciklus() {
    clearTimeout(idozito);
    if (!fut) {
        return;
    }

    kovetkezo(true);

    if (aktualis >= lepesek.length) {
        idozito = setTimeout(befejez, kesleltetes());
    } else {
        idozito = setTimeout(ciklus, kesleltetes());
    }
}

function visszaallit() {
    clearTimeout(idozito);
    aktualis = 0;
    elozoErtekek = {};

    var regiek = kodDoboz.querySelectorAll(".kodsor.aktiv, .kodsor.volt");
    for (var i = 0; i < regiek.length; i++) {
        regiek[i].classList.remove("aktiv");
        regiek[i].classList.remove("volt");
    }

    eredmenyDoboz.classList.remove("latszik");
    valtozokDoboz.innerHTML = "";
    hivasDoboz.textContent = "";

    var szam = document.getElementById("szam").value.trim().toUpperCase();
    var alap = parseInt(document.getElementById("alap").value);
    tablaEpit(szam, alap);
}

function felvesz() {
    clearTimeout(idozito);
    fut = false;

    lepesek = [];
    eredmenyDoboz.innerHTML = "";
    try {
        futtathato();
    } catch (hiba) {
        eredmenyDoboz.innerHTML = "Túl hosszú futás, nem tudom végigjátszani.";
    }
    vegsoEredmeny = eredmenyDoboz.innerHTML;
    eredmenyDoboz.innerHTML = "";

    visszaallit();
    kodDoboz.scrollTo({ top: 0, behavior: "smooth" });
}

function inditas() {
    felvesz();
    fut = true;
    gombFrissit();
    ciklus();
}

function lejatszasValt() {
    if (lepesek.length == 0) {
        inditas();
        return;
    }

    if (aktualis >= lepesek.length) {
        visszaallit();
        fut = true;
    } else {
        fut = !fut;
    }

    gombFrissit();
    if (fut) {
        ciklus();
    } else {
        clearTimeout(idozito);
    }
}

function egyLepes() {
    if (lepesek.length == 0) {
        felvesz();
    }

    fut = false;
    clearTimeout(idozito);

    if (aktualis >= lepesek.length) {
        visszaallit();
    }

    kovetkezo(true);
    gombFrissit();
}

function vegere() {
    if (lepesek.length == 0) {
        felvesz();
    }

    fut = false;
    clearTimeout(idozito);

    while (aktualis < lepesek.length) {
        kovetkezo(false);
    }

    befejez();
}

futtathato = new Function("__lepes", muszerez() + "\nreturn atvalt;")(rogzit);

document.getElementById("gomb").addEventListener("click", inditas);
lejatszasGomb.addEventListener("click", lejatszasValt);
document.getElementById("lepes").addEventListener("click", egyLepes);
document.getElementById("vegere").addEventListener("click", vegere);

document.getElementById("szam").addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        inditas();
    }
});

kodKiir();
uresTabla();
gombFrissit();
lejatszasGomb.textContent = "▶ Lejátszás";

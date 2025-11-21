function addToBookmarks() {
    const url = window.location.href;
    const title = document.title;

    let message = "";

    if (navigator.userAgent.toLowerCase().includes("chrome")) {
        message = "Pour ajouter cette page aux favoris : Ctrl + D (Windows) ou Cmd + D (Mac).";
    } else if (navigator.userAgent.toLowerCase().includes("firefox")) {
        message = "Appuyez sur Ctrl + D (Windows) ou Cmd + D (Mac) pour ajouter cette page aux favoris.";
    } else {
        message = "Utilisez la fonction de votre navigateur pour ajouter cette page aux favoris.";
    }

    alert(message);
}
function downloadAll() {
    let all_files = document.getElementsByClassName("file");

    for (let i = 0; i < all_files.length; i++) {
        all_files[i].click();
    }
}
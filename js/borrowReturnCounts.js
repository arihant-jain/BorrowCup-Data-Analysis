var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
    document.getElementById("borrowsCount").innerHTML = myObj.borrows;
    document.getElementById("returnsCount").innerHTML = myObj.returns;
  }
};
xmlhttp.open("GET", "./data files/borrowReturnCounts.json", true);
xmlhttp.send();
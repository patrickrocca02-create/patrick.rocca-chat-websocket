function onClickLogin(){
    let userName = document.getElementById("loginNameLabel").value;
    if(userName == ""){
        alert("Ci piacerebbe un nome un po' più profondo, grazie");
    }else{
        document.body.innerHTML = indexInner;
        start(userName)
    }
}
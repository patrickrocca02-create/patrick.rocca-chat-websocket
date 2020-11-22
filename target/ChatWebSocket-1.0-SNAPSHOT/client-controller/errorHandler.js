function onError(msg){
    switch(msg.context){
        case "groupCreation":
            switch(msg.problem){
                case "nameNotAvailable":
                    Client.deleteLastGroup();
                    alert("E' già registrato sul server un altro gruppo con il nome " + selectedConv);
                    selectedConv = "";
                    updateAllView();
                    break;
            }
            break;
        case "userConnection":
            switch(msg.problem){
                case "nameNotAvailable":
                    alert("L'utente " + msg.userName + " è già online");
                    window.location.reload();
                    break;
            }
            break;
    }
}
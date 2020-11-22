var selectedConv = "";

function loadNewMenu(){
    document.getElementById("convBox").innerHTML = newMenuInner;
    document.getElementById("defaultOpen").click();
    initAutoComplete();
}

function updateAllView(){
    let boxConvs = document.getElementById("boxConvs");
    let convs = JSON.parse(JSON.stringify(Client.users));
    for(let i = 0; i < Client.groups.length; i++){
        convs.push(JSON.parse(JSON.stringify(Client.groups[i])));
    }
    let innerHTML = newButtonInner;
    for(let i = 0; i < convs.length; i++){
        let lastMessage = { text:"", date:"" }; 
        if(convs[i].messages[convs[i].messages.length-1]){
            let text = convs[i].messages[convs[i].messages.length-1].text;
            let date = convs[i].messages[convs[i].messages.length-1].date;
            if(date == undefined){
                date = "";
            }
            if(text.length > 45){ text = text.slice(0,45) + "..."}
            lastMessage.text = text;
            lastMessage.date = date;
        }
        let imgPath = groupImagePath;
        if(convs[i].creator == null){
            if(Client.getOnline(convs[i].name)){
                imgPath = onlineImagePath;
            }else{
                imgPath = offlineImagePath;
            }
        }
        innerHTML += `
        <div class="chat_list clickable" onclick="selectConv('` + convs[i].name + `')">
            <div class="chat_people">
                <div class="chat_img"> <img src="` + imgPath + `" alt="sunil"> </div>
                <div class="chat_ib">
                    <h5>` + convs[i].name + ` <span class="chat_date">` + lastMessage.date + `</span></h5>
                    <p>` + lastMessage.text + `</p>
                </div>
            </div>
        </div>
        `;
    }
    boxConvs.innerHTML = innerHTML;
    if(selectedConv != ""){
        selectConv(selectedConv);
    }else{
        clearConvBox();
    }
}

function selectConv(name){
    selectedConv = name;
    let c = Client.getConv(name);
    let messagesInner = "";
    let isGroup = c.creator != null;
    for(let i = 0; i < c.messages.length; i++){
        let m = c.messages[i];
        if(m.sender == Client.userName){
            messagesInner +=`
            <div class="outgoing_msg">
                <div class="sent_msg">
                    <p>` + m.text + `</p>
                    <span class="time_date">` + m.time.slice(0,5) + `     |     ` + m.date + `</span> 
                </div>
            </div>
            `
        }else if(m.sender != Client.userName && m.admin == null){
            messagesInner += `
            <div class="incoming_msg">
                <div class="incoming_msg_img"> <img src="./images/user-profile.png" alt="sunil"> </div>
                    <div class="received_msg">
                        <div class="received_withd_msg">
            `;

            if(isGroup){
                messagesInner += "<h6>" + m.sender + "</h6>";
            }

            messagesInner += `
                        <p>` + m.text + `</p>
                        <span class="time_date">` + m.time.slice(0,5) + `     |     ` + m.date + `</span>
                    </div>
                </div>
            </div>`;
        }else if(m.admin != null){
            messagesInner += `
                <div class="systemMessage">`
                + m.text +
                `</div>
            `
        }
    }

    let destType = "group";
    let imgPath = groupImagePath;
    let onClick = ' clickable" onclick="openGroupDesc(`' + name + '`)"';
    if(c.creator == null){
        onClick = '"';
        destType = "user";
        if(Client.getOnline(c.name)){
            imgPath = onlineImagePath;
        }else{
            imgPath = offlineImagePath;
        }
    }
    
    let keyboard = "";
    if(!(c.active == false)){
        keyboard = `
            <div class="type_msg">
                <div class="input_msg_write">
                    <textarea class="write_msg" placeholder="Testo..." id="messageBox"></textarea>
                    <button class="msg_send_btn" type="button" onclick=sendMessage('` + c.name  + `','` + destType + `')><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
                </div>
            </div>
        `
    }

    let innerHTML = `
    <div class="userDescription ` + onClick + `>
        <div class="profile_image clickable"> <img src="` + imgPath + `" alt="sunil"> </div>
        <span id="userName clickable" class="userName">` + c.name + `</span>
    </div>
    <div class="mesgs">
        <div class="msg_history" id="messagesContainer">` + messagesInner + `</div>
        ` + keyboard + `
    </div>
    `
    document.getElementById("convBox").innerHTML = innerHTML;
    goToBottomOfChat();
}

function openGroupDesc(groupName){
    let group = Client.getGroup(groupName);
    let innerHTML;
    if(group.admins.includes(Client.userName) && group.active){
        let memebrsInnerHTML = ""; 
        for(let i = 0; i < group.members.length; i++){
            let member = group.members[i];
            let memberInnerHTML;
            let displayMember = member;
            if(member == Client.userName){displayMember += " (Tu)"}
            if(!group.admins.includes(member)){
                memberInnerHTML = `
                    <div class="memberContainer" id="memberContainer-` + member + `">
                        <div class="imgMember"> <img src="./images/user-profile.png" alt="sunil"> </div>
                        <div class="memberName">` + displayMember + `</div>
                        <div class="memberButtons">
                            <button id="adminButton-` + member + `" onclick="onClickChangeAdminGroupModification('` + member + `')">Amministratore</button>
                            <button id="removeButton-` + member + `" onclick="onClickRemoveMemberGroupModification('` + member + `')">Rimuovi</button>
                        </div>
                    </div> 
                `;
            }else{
                memberInnerHTML = `
                    <div class="memberContainer">
                        <div class="imgMember"> <img src="./images/user-profile.png" alt="sunil"> </div>
                        <div class="memberName">` + displayMember + `</div>
                        <div class="adminIndicator">amministratore</div>
                    </div> 
                `;
            }
            memebrsInnerHTML += memberInnerHTML;
        }
        innerHTML = `
            <div class="descTitle">Descrizione del gruppo ` + groupName + `</div>
            <div class="membersTitle">Membri:</div>
        
            <div id="listOfMembers" class="listOfMembers listOfMembersAdmin">
                ` + memebrsInnerHTML + `
            </div>
            <div class="groupModificationForm">
                <form class="autocomplete" autocomplete="off">
                    <div class="autocomplete">
                    <input class="autocomplete" id="addMemberGroupMod" type="text" name="myCountry" placeholder="Utente...">
                    </div>
                    <input type="button" value="+" onclick="onClickAddMemberGroupModification()" class="autocomplete-submit"> 
                </form>
            </div>
            <button class="btnApplyGroupMod" onclick="onClickApplyGroupModification('` + groupName + `')">Applica modifiche</button>
        `;
    }else{
        let memebrsInnerHTML = "";
        for(let i = 0; i < group.members.length; i++){
            let memberInnerHTML;
            let member = group.members[i];
            let displayMember = member;
            if(member == Client.userName){displayMember += " (Tu)"}
            if(group.admins.includes(member)){
                memberInnerHTML = `
                    <div class="memberContainer">
                        <div class="imgMember"> <img src="./images/user-profile.png" alt="sunil"> </div>
                        <div class="memberName">` + displayMember + `</div>
                        <div class="adminIndicator">amministratore</div>
                    </div> 
                `
            }else{
                memberInnerHTML = `
                    <div class="memberContainer">
                        <div class="imgMember"> <img src="./images/user-profile.png" alt="sunil"> </div>
                        <div class="memberName">` + displayMember + `</div>
                    </div> 
                `
            }
            memebrsInnerHTML += memberInnerHTML;
        }
        innerHTML = `
            <div class="descTitle">Descrizione del gruppo Amici</div>
            <div class="membersTitle">Membri:</div>
        
            <div id="listOfMembers" class="listOfMembers">
                ` + memebrsInnerHTML + `
            </div>
        `
    }
    innerHTML += `
        <div class="infoGroupCreation">   
            Gruppo creato il ` + group.creationDate + ` alle ore ` + group.creationTime.slice(0,5) + ` dall'utente ` + group.creator + `
        </div>
    `;

    if(group.active){
        innerHTML += '<button class="btnLeaveGroup" onclick="sendGroupQuit(`' + group.name + '`)">Lascia il gruppo</button>';
    }else{
        innerHTML += '<button class="btnLeaveGroup" onclick="deleteGroup(`' + group.name + '`)">Cancella il gruppo</button>';
    }

    document.getElementById("convBox").innerHTML = innerHTML;
    initGroupModification(groupName);
}
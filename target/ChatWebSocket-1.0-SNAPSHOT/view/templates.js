const onlineImagePath = "./images/user-profile-online.png";
const offlineImagePath = "./images/user-profile-offline.png";
const groupImagePath = "./images/group-profile.png";

const newButtonInner = `
    <div class="chat_list clickable" id="boxNew" onclick="loadNewMenu()">
        <div class="chat_people">
            <div class="chat_ib">
                <span style="font-size: 15px;" class="newBtn">Nuova conversazione/gruppo</span>
            </div>
        </div>
    </div>
`
const newMenuInner = `
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'newChat')" id="defaultOpen">Nuova conversazione</button>
  <button class="tablinks" onclick="openTab(event, 'newGroup')">Nuovo gruppo</button>
</div>

<div id="newChat" class="tabcontent">
  <div>Messaggio:</div>
  <textarea id="newUserMessage"></textarea>
  <div>Destinatario:</div>
  <form class="autocomplete" autocomplete="off">
    <div class="autocomplete">
      <input class="autocomplete" id="newUserName" type="text" name="myCountry" placeholder="Utente...">
    </div>
  </form>
  <script>autocomplete(document.getElementById("newUserName"),Client.getServerUsersNames())</script>
  <div>
    <button onclick="messageToNewUser()">Invia messaggio</button>
  </div>
</div>

<div id="newGroup" class="tabcontent">
  <div class="groupNameCreationDiv">
    <div class="groupNameCreation">Nome del gruppo:</div>
    <input type="text" id="newGroupName">
  </div>
  <div class="newGroupMembersDiv">
    <div class="newGroupMembers">Aggiungi membro:</div>
    <form class="autocomplete" autocomplete="off">
      <div class="autocomplete">
        <input class="autocomplete" id="addMember" type="text" name="myCountry" placeholder="Utente...">
      </div>
      <input type="button" value="+" onclick="addMemberGroupCreation()" class="autocomplete-submit"> 
    </form>
  </div>
  <div id="listOfNewMembers">
  </div>
  <button class="createGroup" onclick="createGroup()">Crea gruppo</button>
</div>
`

const indexInner = `
<div class="container">
<h3 class="text-center">Web Socket Chat by <b>Rocca</b></h3>
<div class="messaging">
  <div class="inbox_msg">
    <div class="inbox_people">
      <div class="headind_srch">
        <div class="recent_heading">
          <h4>Recenti</h4>
        </div>
        <div id="userNameLabel"></div>
        <div class="userImg"> <img src="./images/user-profile-online.png" alt="sunil"> </div>
      </div>
      <div class="inbox_chat" id="boxConvs">
        <div class="chat_list" id="boxNew" onclick="loadNewMenu()">
          <div class="chat_people">
            <div class="chat_ib">
              <span style="font-size: 15px;" class="newBtn">Nuova conversazione/gruppo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="convBox">
    </div>     
</div>
</div>
`
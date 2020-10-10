var getMsg = document.getElementById('msg');
var sendBtn = document.getElementById('send_btn');


firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
        var prevent_duplicate_db = false;
        firebase.database().ref('all_users').on('child_added', (data) => {
            if (data.val().uid !== firebase.auth().currentUser.uid) {
                user = data.val()
                prevent_duplicate_db = true;
                let frndList = document.getElementById('friendList');
                let createFrndList = document.createElement('div');
                createFrndList.setAttribute('id', data.val().uid);
                createFrndList.setAttribute('onClick', 'start_Chat(this.id, this.firstChild.src, this.children[1].innerHTML)');
                createFrndList.setAttribute('class', 'other_chat_div');
                frndList.appendChild(createFrndList)

                let createFrndImage = document.createElement('img');
                createFrndImage.setAttribute('src', data.val().photo);
                createFrndImage.setAttribute('class', 'other_chat_img');
                createFrndList.appendChild(createFrndImage)

                let createFrndName = document.createElement('p');
                createFrndName.setAttribute('class', 'friendName');
                createFrndName.style.display = 'inline-block';
                createFrndName.innerHTML = data.val().name;
                createFrndList.appendChild(createFrndName)

                let createFrndMsgSnap = document.createElement('p');
                createFrndMsgSnap.setAttribute('id','snap' + data.val().uid);
                createFrndMsgSnap.setAttribute('class', 'friendMsgSnap');
                createFrndMsgSnap.innerHTML = '';
                createFrndList.appendChild(createFrndMsgSnap)
            }
            if (prevent_duplicate_db === false) {
            }
            else {
                document.getElementById('user_profile_image').src = firebase.auth().currentUser.photoURL;
            }
        })
    }
    else {
        document.getElementById('user_profile_image').src = "images/user_profile_image.png";
        document.getElementById('friendList').innerHTML = ''
}
});


let chatKey;
let start_Chat = (friendId, img, name) => {
    document.getElementById('msg-output').innerHTML = '';
    document.getElementById('user_name').innerHTML = name;

    var frndIdString = friendId.toString()
    var myid = firebase.auth().currentUser.uid
    var myidString = myid.toString();
    let key = firebase.database().ref('chat_List').push().key
    let chatList = {
        friendId: frndIdString,
        userId: myidString
    }

    var flag = false;
    firebase.database().ref('chat_List').on('value', (friends) => {
        friends.forEach(data => {
            var user = data.val();
            if ((user.friendId === chatList.friendId && user.userId === chatList.userId) || (user.friendId === chatList.userId && user.userId === chatList.friendId)) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('chat_List').push(chatList).getKey();
        }
        else {
            document.getElementById('msg-output').innerHTML = '';
            document.getElementById('user_name').innerHTML = name;
        }
        getChatMsgs(chatKey, img, friendId)
    })
    document.getElementById('chat_field').style.display = 'block';

}


let getChatMsgs = (chatKey, img, friendId) => {
    firebase.database().ref('all_messages').child(chatKey).on('child_added', (data) => {

        if (data.val().currentUserId === firebase.auth().currentUser.uid) {
            let getMsgAreaDiv = document.getElementById('msg-output');
            let createMsgEle = document.createElement('div');
            createMsgEle.style.marginTop = '5px'

            let createMsgUserImage = document.createElement('img');
            createMsgUserImage.setAttribute('src', firebase.auth().currentUser.photoURL);
            createMsgUserImage.style.borderRadius = '50px';
            createMsgUserImage.style.width = '45px';
            createMsgUserImage.style.height = '45px';

            let createMsgPara = document.createElement('p');
            createMsgPara.setAttribute('class', 'msg-output-design');
            createMsgPara.style.display = 'inline-block';
            createMsgPara.innerHTML += data.val().currentUserMsg

            let createTimeStamp = document.createElement('span');
            createTimeStamp.setAttribute('class', 'time-stamp')
            createTimeStamp.innerHTML = data.val().time;

            getMsgAreaDiv.appendChild(createMsgEle);
            createMsgEle.appendChild(createMsgUserImage);
            createMsgEle.appendChild(createMsgPara);
            createMsgEle.appendChild(createTimeStamp);
        }
        else if (data.val().currentUserId !== firebase.auth().currentUser.uid) {
            let getMsgAreaDiv = document.getElementById('msg-output');
            let createMsgEle = document.createElement('div');
            createMsgEle.style.marginTop = '4px'
            createMsgEle.style.cssFloat = 'right'
            createMsgEle.style.width = '100%'

            let createMsgUserImage = document.createElement('img');
            createMsgUserImage.setAttribute('src', img);
            createMsgUserImage.style.borderRadius = '50px';
            createMsgUserImage.style.width = '45px';
            createMsgUserImage.style.height = '45px';
            createMsgUserImage.style.cssFloat = 'right'

            let createMsgPara = document.createElement('p');
            createMsgPara.setAttribute('class', 'msg-output-design-other');
            createMsgPara.style.display = 'inline-block';
            createMsgPara.innerHTML += data.val().currentUserMsg;
            createMsgPara.style.cssFloat = 'left';

            document.getElementById('snap' + friendId).innerHTML = data.val().currentUserMsg;

            let createTimeStamp = document.createElement('span');
            createTimeStamp.setAttribute('class', 'time-stamp-other')
            createTimeStamp.style.cssFloat = 'right';
            createTimeStamp.innerHTML = data.val().time;

            getMsgAreaDiv.appendChild(createMsgEle);
            createMsgEle.appendChild(createMsgUserImage);
            createMsgEle.appendChild(createMsgPara);
            createMsgEle.appendChild(createTimeStamp);
        }
    })
}


let enableSendBtn = () => {
    if (getMsg.value != '') {
        document.getElementById('send_btn').classList.remove("fa-disabled");
    }
    else if (getMsg.value === '') {
        document.getElementById('send_btn').classList.add("fa-disabled");
    }
}


let sendMsg = () => {
    var time = new Date().toLocaleTimeString().split('')
    var newTime = time.splice(4, 3);

    let key = firebase.database().ref('all_messages').push().key;
    let msgRecords = {
        currentUserMsg: document.getElementById('msg').value,
        currentUserId: firebase.auth().currentUser.uid,
        key: key,
        time: time.join('')
    }
    firebase.database().ref('all_messages').child(chatKey + '/' + key).set(msgRecords);

    getMsg.value = '';
    document.getElementById('send_btn').classList.add("fa-disabled")
}

function key(e) {
    if (e.keyCode === 13 && getMsg.value.length >= 1) {
        sendMsg();
    }
}
getMsg.addEventListener("keydown", key, false)


let = openMenu = () => {
    var menu = document.getElementById('open-menu');
    var menuOpen = document.createElement('div');
    menuOpen.setAttribute('class', 'menu-decoration')
    var closeBtn = document.createElement("i")
    closeBtn.classList.add('fas');
    closeBtn.classList.add('fa-times');
    closeBtn.setAttribute('onClick', 'closeBtn(this)')
    closeBtn.setAttribute('id', 'closeBtn')
    menuOpen.appendChild(closeBtn)

    // var login = document.createElement('p')
    // loginLink = document.createElement('a')
    // loginLink.setAttribute('href', '#')
    // loginLink.setAttribute('onClick', 'login()')
    // loginLink.innerHTML = "Login"
    // login.appendChild(loginLink)
    // menuOpen.appendChild(login)

    var logout = document.createElement('p')
    logoutLink = document.createElement('a')
    logoutLink.setAttribute('href', '#')
    logoutLink.setAttribute('onClick', 'logout()')
    logoutLink.innerHTML = "Logout"
    logout.appendChild(logoutLink)
    menuOpen.appendChild(logout)

    document.body.appendChild(menuOpen)
}

let closeBtn = (c) => {
    c.parentNode.remove()
}

let = logout = () => {
    firebase.auth().signOut().then(function () {
        document.getElementById('closeBtn').parentNode.remove();
        document.getElementById('msg-output').innerHTML = '';
        document.getElementById('user_name').innerHTML = '';
        window.location.replace("index.html");
        // console.log('Sign-out successful.')
    }).catch(function (error) {
        console.log('An error happened.')
        alert(error)
    });
}
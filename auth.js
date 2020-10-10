const login = () => {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
        var token = result.credential.accessToken;
        var user = result.user;
        let userData = {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            uid: user.uid
        }
        window.location.replace("App.html");
        firebase.database().ref('all_users/' + userData.uid).set(userData);
    }).catch(function (error) {
        console.log(error.message)
    });
}
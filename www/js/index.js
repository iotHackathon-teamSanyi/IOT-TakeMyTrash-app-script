/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();

        var score = localStorage.getItem('score');
        if (score) {

            app.setText('label_score', 'Your score is:');
            app.setText('score', score);

            app.score = score;
        }
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        screen.lockOrientation('portrait-primary');
        console.log('Received Event: ' + id);
    },

    scanQR: function() {

        if (!app.userData) {

            app.fbLogin(function() {
                app.scanQR();
            });

            return false;
        }

        cordova.plugins.barcodeScanner.scan(
            function(result) {

                //var accessToken = app.userData.accessToken;
                //var userID = app.userData.userID;

                var request = new XMLHttpRequest();
                request.open('GET', 'http://sanyiubuntu.westeurope.cloudapp.azure.com/submitqr/' 
                    + result.text, true);

                request.onreadystatechange = function() {

                    if (request.readyState == 4) {

                        if (request.status == 200 || request.status == 0) {

                            var resultObj = JSON.parse(request.responseText);

                            if (resultObj.result === 'failed') {
                                app.alert('Error', resultObj.cause);
                            }
                            else {

                                app.score = resultObj.points;
                                localStorage.setItem('score', app.score);

                                app.setText('label_score', 'Your score is:');
                                app.setText('score', app.score);
                            }
                        }
                        else {
                            app.alert('Error', 'No connection');
                        }
                    }
                };

                if (result.text != '') {
                    request.send();
                }
            }, 
            function(error) {
                app.alert('Scanning failed', error);
            }
        );
    },

    setText: function(id, text) {
        document.getElementById(id).innerHTML = text;
    },

    showInfo: function() {
        app.alert('Take my trash', '© BLACK SWAN 2016');
    },

    share: function() {

        if (!app.score) {
            app.alert('Alert', 'You have no score to post!');
        }
        else if (!app.userData) {

            app.fbLogin(function() {
                app.share();
            });
        }
        else {

            var scoreMessage = 'My score on Take my trash is: ' + app.score;
            var options = {
                method: 'feed',
                name:'Take my trash Score Post',
                message:'My Take my trash score',    
                caption: scoreMessage,
                description: 'Try to beat that using the Take my trash app!'
            }
            facebookConnectPlugin.showDialog(options, function(result) {
                app.alert('Success', 'Score posted successfully!');             
            },
            function(error) {
                app.alert('Error', error);
            });
        }
    },

    fbLogin: function(callback) {

        // http://www.phonegaptutorial.com/integrate-facebook-into-your-phonegap-app/
        facebookConnectPlugin.login(["public_profile"],
            function(userData) { 
                app.userData = userData;
                callback();
            },
            function(error) { 
                app.alert('Error', 'Login failed!'); 
            }
        );
    },

    alert: function(title, text) {
        navigator.notification.alert(text, null, title, 'OK');
    }
};

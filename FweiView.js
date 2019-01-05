import CookieManager from 'react-native-cookies';
import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';
import {defaultBaseURL} from './config';

const jsCode = `
        (function() {
          var originalPostMessage = window.postMessage;
        
          var patchedPostMessage = function(message, targetOrigin, transfer) { 
            originalPostMessage(message, targetOrigin, transfer);
          };
        
          patchedPostMessage.toString = function() { 
            return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); 
          };
          window.postMessage = patchedPostMessage;
          window.nativeAppRemote = {};
          window.nativeAppRemote.init = function() { window.postMessage(JSON.stringify({method: 'init', data: {}}), '*'); };
          window.nativeAppRemote.openConfig = function() { window.postMessage(JSON.stringify({method: 'openConfig', data: {}}), '*'); };
          window.nativeAppRemote.persistentLoginCallback = function(status) { window.postMessage(JSON.stringify({method: 'persistentLoginCallback', data: {status}}), '*'); };
          
          if ($('#navAppConfig').length === 0) {
            alert('FWEI unter dieser URL nicht gefunden');
            nativeAppRemote.openConfig();
          }
          
          document.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                switch (message.method) {
                    case 'logintoken':
                        window.nativeAppApi.doPersistentLogin(message.data.token, message.data.sessionName);
                    break;
                    case 'config':
                        window.nativeAppApi.setUserConfig(message.data.config);
                    break;
                    default:
                        alert("unknown message " + message.method);
                    break;
                }
            } catch (e) {
                alert(JSON.stringify(e));
            }
           });  
        })();
    `;



type Props = {};
export default class FweiView extends Component<Props> {
    constructor(props) {
        super(props);
    }
    handleWebViewMessage(message) {
        switch (message.method) {
            case 'openConfig':
                this.props.onOpenOptions();
                break;
            case 'init':
                console.log('init');
                CookieManager.getAll()
                    .then((res) => {
                        AsyncStorage.setItem('FWEI.persistentSession', res.persistentSession.value);
                        console.log('persistentSession saved.', res);
                    });
                break;
            case 'persistentLoginCallback':
                console.log('persistentLoginCallback', message.data);
                break;
            default:
                console.log("unknown message", message.data);
        }
    }
    onShouldStartLoadWithRequest(navState) {
        const {baseURL} = this.props;
        console.log(navState.url, baseURL);
        if (navState.url.indexOf(baseURL.toLowerCase()) === -1 && navState.url.indexOf("about:blank") === -1) {
            this.props.onOpenPopup(navState.url);
            return false;
        }
        return true;
    }
    convertLoginCode(token, sessionName, config) {
        this.refs.webview.postMessage(JSON.stringify({method: "logintoken", data: {token, sessionName}}));
        this.refs.webview.postMessage(JSON.stringify({method: "config", data: {config}}));
    }
    componentDidMount() {
     window.setTimeout(() => {
            const {legacyData} = this.props;
            if (legacyData) {
                this.convertLoginCode(legacyData.logintoken, 'c3', legacyData.userConfig);
                alert("Login Code Converted");
            }
        }, 5000);

    }
    render() {
        const {baseURL} = this.props;
        return (<View style={{flex: 1}}>
            <WebView
                source={{uri: (baseURL === 'about:blank' ? '' : 'https://') + baseURL}}
                onShouldStartLoadWithRequest={(navState) => this.onShouldStartLoadWithRequest(navState)}
                style={{flex: 1}}
                ref="webview"
                injectedJavaScript={jsCode}
                onMessage={(event)=> this.handleWebViewMessage(JSON.parse(event.nativeEvent.data))}
            />
        </View>);
    }
}
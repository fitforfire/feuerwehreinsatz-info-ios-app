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
          window.nativeAppRemote.persistentLoginCallback = function(status) { window.postMessage(JSON.stringify({method: 'openConfig', data: {status}}), '*'); };
          
          if ($('#navAppConfig').length === 0) {
            alert('FWEI unter dieser URL nicht gefunden');
            nativeAppRemote.openConfig();
          }
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
    render() {
        const {baseURL} = this.props;
        return (<View style={{flex: 1}}>
            <WebView
                source={{uri: (baseURL === 'about:blank' ? '' : 'https://') + baseURL}}
                onShouldStartLoadWithRequest={(navState) => this.onShouldStartLoadWithRequest(navState)}
                style={{flex: 1}}
                injectedJavaScript={jsCode}
                onMessage={(event)=> this.handleWebViewMessage(JSON.parse(event.nativeEvent.data))}
            />
        </View>);
    }
}
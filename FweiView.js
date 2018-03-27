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
          window.nativeAppRemote.init = function() { alert('init'); };
          window.nativeAppRemote.openConfig = function() { window.postMessage(JSON.stringify({method: 'openConfig', data: {}}), '*'); };
          $('#navAppConfig').click(function() {
            nativeAppRemote.openConfig();
          });
        })();
    `;

type Props = {};
export default class Options extends Component<Props> {
    constructor(props) {
        super(props);
    }
    handleWebViewMessage(data) {
        switch (data.method) {
            case 'openConfig':
                this.props.onOpenOptions();
                break;
        }
    }
    onShouldStartLoadWithRequest(navState) {
        const {baseURL} = this.props;
        if (navState.url.indexOf(baseURL) === -1 && navState.url.indexOf("about:blank") === -1) {
            this.props.onOpenPopup(navState.url);
            return false;
        }
        return true;
    }
    render() {
        const {baseURL} = this.props;
        return (<View style={{flex: 1}}>
            <WebView
                source={{uri: 'https://' + baseURL}}
                onShouldStartLoadWithRequest={(navState) => this.onShouldStartLoadWithRequest(navState)}
                style={{flex: 1}}
                injectedJavaScript={jsCode}
                onMessage={(event)=> this.handleWebViewMessage(JSON.parse(event.nativeEvent.data))}
            />
        </View>);
    }
}
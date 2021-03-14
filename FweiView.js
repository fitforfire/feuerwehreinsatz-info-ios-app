import CookieManager from '@react-native-cookies/cookies';
import React, { Component } from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import {defaultBaseURL} from './config';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

const jsCode = `
        (function() {
          window.nativeAppRemote = {};
          window.nativeAppRemote.init = function() { window.ReactNativeWebView.postMessage(JSON.stringify({method: 'init', data: {}}), '*'); };
          window.nativeAppRemote.openConfig = function() { window.ReactNativeWebView.postMessage(JSON.stringify({method: 'openConfig', data: {}}), '*'); };
          window.nativeAppRemote.persistentLoginCallback = function(status) { window.ReactNativeWebView.postMessage(JSON.stringify({method: 'persistentLoginCallback', data: {status}}), '*'); };
          
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
        this.state = {migrated: false};
    }
    handleWebViewMessage(message) {
        switch (message.method) {
            case 'openConfig':
                this.props.onOpenOptions();
                break;
            case 'init':
                const {legacyData} = this.props;
                if (legacyData && legacyData.logintoken && !this.state.migrated) {
                    this.setState({migrated: true});
                    setTimeout(() => {
                        this.convertLoginCode(legacyData.logintoken, 'ios', legacyData.userConfig);
                    }, 3000);
                }
            // no break;
            case 'persistentLoginCallback':
                CookieManager.getAll()
                    .then((res) => {
                        AsyncStorage.setItem('FWEI.persistentSession', res.persistentSession.value);
                        console.log('persistentSession saved.', res);
                    })
                    .catch(e => {
                        crashlytics.log(e);
                        console.error(e);
                    });
                break;
            default:
                console.log("unknown message", message.data);
        }
    }
    onShouldStartLoadWithRequest(navState) {
        const {baseURL} = this.props;
        console.log(navState.url, baseURL);
        if (navState.url.indexOf("//" + baseURL.toLowerCase()) === -1 && navState.url.indexOf("about:blank") === -1) {
            this.props.onOpenPopup(navState.url);
            return false;
        }
        return true;
    }
    convertLoginCode(token, sessionName, config) {
        this.refs.webview.postMessage(JSON.stringify({method: "logintoken", data: {token, sessionName}}));
        setTimeout(() => {
            this.refs.webview.postMessage(JSON.stringify({method: "config", data: {config}}));
        }, 3000);
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
                bounce={false}
                onMessage={(event)=> this.handleWebViewMessage(JSON.parse(event.nativeEvent.data))}
            />
        </View>);
    }
}

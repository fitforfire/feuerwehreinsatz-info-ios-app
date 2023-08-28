import CookieManager from '@react-native-cookies/cookies';
import React, { Component } from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import {defaultBaseURL} from './config';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        this.state = {};
    }
    handleWebViewMessage(message) {
        switch (message.method) {
            case 'openConfig':
                this.props.onOpenOptions();
                break;
            case 'init':
                CookieManager.getAll(true)
                    .then((res) => {
                        if (res.persistentSession && res.persistentSession.value) {
                            AsyncStorage.setItem('FWEI.persistentSession', res.persistentSession.value);
                            crashlytics().log('persistentSession saved.', res);
                            console.log('persistentSession saved.', res);
                        } else {
                            crashlytics().log('persistentSession not found.', res);
                            console.log('persistentSession not found.', res);
                        }
                    })
                    .catch(e => {
                        crashlytics().recordError(e);
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

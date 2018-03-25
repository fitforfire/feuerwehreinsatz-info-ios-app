import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';

const defaultBaseURL = 'https://feuerwehreinsatz.info';

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {popup: false, options: false, baseURL: 'about:blank'};
    }
    componentDidMount() {

        AsyncStorage.getItem('FWEI.baseURL').then((loadedBaseUrl) => {
            console.log("lbu", loadedBaseUrl);
            this.setState({
                baseURL: loadedBaseUrl || defaultBaseURL
            });
        }).catch(() => {
            this.setState({
                baseURL: defaultBaseURL
            });
        });
    }
    onShouldStartLoadWithRequest(navState) {
        const {baseURL} = this.state;
        if (navState.url.indexOf(baseURL) === -1 && navState.url.indexOf("about:blank") === -1) {
            this.setState({popup: navState.url});
            return false;
        }
        return true;
    }
    save({baseURL}) {
        return AsyncStorage.setItem('FWEI.baseURL', baseURL);
    }
    handleWebViewMessage(data) {
        console.log(data);
        switch (data.method) {
            case 'openConfig':
                this.setState({options: true});
            break;
        }
    }
    render() {
        let jsCode = `
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


        const {options, popup, baseURL, unsavedServername} = this.state;
        console.log(this.state);
        return (
            <View style={{flex: 1, marginTop: 20}}>

                {baseURL && <View style={{flex: 1}}><WebView
                    source={{uri: baseURL}}
                    onShouldStartLoadWithRequest={(navState) => this.onShouldStartLoadWithRequest(navState)}
                    style={{flex: 1}}
                    injectedJavaScript={jsCode}
                    onMessage={(event)=> this.handleWebViewMessage(JSON.parse(event.nativeEvent.data))}
                />
                </View>}
                {popup && <View style={{flex: 1000}}>
                    <WebView
                        source={{uri: popup}}
                        style={{flex: 1}}
                    />
                    <Button flex title="Zurück zu Feuerwehreinsatz.info" onPress={() => this.setState({popup: false})} />
                    </View>
                }
                {options &&
                <View style={{flex: 1000}}>
                    <Text>Optionen</Text>
                    <TextInput
                        style={{height: 40}}
                        placeholder="Servername"
                        value={baseURL}
                        onChangeText={(update) => this.setState({unsavedServername: update})}
                    />
                    <Button flex title="speichern" onPress={() => this.save({baseURL: unsavedServername})} />
                    <Button flex title="Zurück zu Feuerwehreinsatz.info" onPress={() => this.setState({options: false})} />
                </View>
                }
            </View>
        );
    }
}
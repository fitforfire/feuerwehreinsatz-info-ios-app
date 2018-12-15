import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';
import FweiView from './FweiView';
import Options from './Options';
import Popup from './Popup';
import CookieManager from 'react-native-cookies';

import config from './config';

const WebkitLocalStorageReader = require('NativeModules').WebkitLocalStorageReader;
WebkitLocalStorageReader.get().then(data => console.log("sr", data));

function setPersistentSession(domain) {
    if (!domain) return Promise.resolve();
    return AsyncStorage.getItem('FWEI.persistentSession').then((persistentSession) => {
        if (persistentSession) {
            return CookieManager.set({
                name: 'persistentSession',
                value: persistentSession,
                domain: domain,
                origin: domain,
                path: '/',
                version: '1',
                expiration: '2030-01-01T12:30:00.00-05:00'
            }).then((res) => {
                console.log('CookieManager.set =>', persistentSession);
            });
        } else {
            console.log("no persistensSession");
        }

    }).catch(() => {});
}

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {popup: false, options: false, baseURL: 'about:blank'};
    }
    componentDidMount() {
        AsyncStorage.getItem('FWEI.baseURL').then((loadedBaseURL) => {
            const baseURL = loadedBaseURL || config.defaultBaseURL;
            setPersistentSession(baseURL).then(() => {
                this.setState({
                    baseURL
                });
            });

        }).catch(() => {
            setPersistentSession(config.defaultBaseURL).then(() => {
                this.setState({
                    baseURL: config.defaultBaseURL
                });
            });
        });
    }
    render() {
        const {options, popup} = this.state;
        const baseURL = this.state.baseURL || 'about:blank';
        return (
            <View style={{flex: 1, marginTop: 20}}>
                {baseURL && <View style={{flex: 1}}>
                    <FweiView baseURL={baseURL}
                              onOpenOptions={() => this.setState({options: true})}
                              onOpenPopup={(url) => this.setState({popup: url})}>
                    </FweiView>
                </View>}
                {popup && <View style={{flex: 1000}}>
                    <Popup url={popup} onClose={() => this.setState({popup: false})}></Popup>
                    </View>
                }
                {options && <View style={{flex: 1000}}>
                    <Options
                        baseURL={baseURL}
                        onClose={() => this.setState({options: false})}
                        onSave={(baseURL) => this.setState({options: false, baseURL})}>
                    </Options>
                </View>
                }
            </View>
        );
    }
}
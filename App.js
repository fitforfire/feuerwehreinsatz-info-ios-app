import React, { Component } from 'react';
import {View, Text, WebView, Button, TextInput, SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import FweiView from './FweiView';
import Options from './Options';
import Popup from './Popup';
import Welcome from './Welcome';
import CookieManager from 'react-native-cookies';
import config from './config';
import KeepAwake from 'react-native-keep-awake';
import AsyncStorage from '@react-native-community/async-storage';
import Fabric from 'react-native-fabric';

const {WebkitLocalStorageReader} = require('NativeModules');
/*
const WebkitLocalStorageReader = {
    get: () => {
        return new Promise((resolve) => {
            return resolve({
                server: 'fwei.mobi',
                userConfig: '{map:{tl:osm}}',
                code: 'user'
            });
        });
    }
};
*/

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
    }).catch(e => {
        Fabric.Crashlytics.logException(e);
        console.error(e);
    });
}

async function getMigrationData() {
    const isMigratedKey = 'FWEI.isMigrated';
    const isMigratedValue = "true";
    try {
        const migrated = await AsyncStorage.getItem(isMigratedKey);
        if (migrated === isMigratedValue) {
            return {};
        }
        await AsyncStorage.setItem(isMigratedKey, isMigratedValue);
        const data = await WebkitLocalStorageReader.get();
        if (data && data.server) {
            return {
                baseURL: data.server,
                legacyData: {
                    logintoken: data.code,
                    userConfig: data.userConfig
                }
            };
        }
    } catch (e) {
        Fabric.Crashlytics.logException(e);
        alert("migration failed: " + e.message);
        return {};
    }
}

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {popup: false, options: false, baseURL: undefined, init: false};
    }

    async componentDidMount() {
        try {
            const migrationData = await getMigrationData();
            if (migrationData && migrationData.baseURL) {
                await AsyncStorage.setItem('FWEI.baseURL', migrationData.baseURL);
                this.setState(migrationData);
            } else {
                const baseURL = await AsyncStorage.getItem('FWEI.baseURL');
                if (baseURL) {
                    await setPersistentSession(baseURL);
                    this.setState({baseURL});
                }
            }
        } catch (e) {
            Fabric.Crashlytics.logException(e);
            const baseURL = config.defaultBaseURL;
            await setPersistentSession(baseURL);
            this.setState({baseURL});
        } finally {
            this.setState({init: true});
        }
    }

    render() {
        const {init, options, popup, legacyData, baseURL} = this.state;
        return (
            <SafeAreaView style={styles.safeArea}>
                <KeepAwake />
                <StatusBar
                    backgroundColor="#222"
                    barStyle="light-content"
                />
                <View style={styles.appArea}>
                    {baseURL && <View style={{flex: 1}}>
                        <FweiView baseURL={baseURL}
                                  legacyData={legacyData}
                                  onOpenOptions={() => this.setState({options: true})}
                                  onOpenPopup={(url) => this.setState({popup: url})}>
                        </FweiView>
                    </View>}
                    {popup && <View style={{flex: 1000}}>
                        <Popup
                            baseURL={baseURL}
                            url={popup}
                            onClose={() => this.setState({popup: false})}>
                        </Popup>
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
                    {init && !baseURL && <View style={{flex: 1000}}>
                        <Welcome
                            baseURL={config.defaultBaseURL}
                            onSave={(baseURL) => this.setState({baseURL})}>
                        </Welcome>
                    </View>
                    }
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#222'
    },
    appArea: {
        flex: 1,
        backgroundColor: '#FFF'
    }
});
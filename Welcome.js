import React, { Component } from 'react';
import {View, Text, WebView, Button, TextInput, Switch, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from './config';
const {defaultServer} = config;

type Props = {};
export default class Welcome extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {unsavedServer: props.baseURL}
    }
    save({baseURL}) {
        const stored = AsyncStorage.setItem('FWEI.baseURL', baseURL);
        this.props.onSave(baseURL);
        return stored;
    }
    render() {
        const {onClose, baseURL} = this.props;
        const {unsavedServer, customServer} = this.state;
        return (<View>
            <Text style={styles.header}>Willkommen!</Text>

            <Text style={styles.subheader}>Bitte wählen Sie ihren Server aus:</Text>
            {customServer || <Picker style={styles.picker}
                                     selectedValue={unsavedServer}
                                     onValueChange={(itemValue, itemIndex) => this.setState({unsavedServer: itemValue})}>
                {defaultServer.map((server) => <Picker.Item label={server.caption} key={server.caption} value={server.url}/>)}
            </Picker>
            }
            <View style={styles.customServer}>
                <View style={styles.toggleView}>
                    <Text style={styles.toggleText}>Eigener Server</Text>
                    <View>
                        <Switch
                            style={styles.toggleSwitch}
                            disabled={false}
                            value={customServer}
                            onValueChange={(value) => this.setState({customServer: value})}
                        />
                    </View>
                </View>
                {customServer && (<TextInput
                    style={styles.customServerInput}
                    autoCapitalize = 'none'
                    placeholder="Server"
                    clearButtonMode="always"
                    value={unsavedServer}
                    onChangeText={(update) => this.setState({unsavedServer: update.toLowerCase()})}
                />)}
            </View>

            <Button flex title="Server übernehmen" onPress={() => this.save({baseURL: unsavedServer})} />
            <Text style={styles.infoText}>Die Servereinstellung kann später jederzeit über das Optionsmenü geändert werden.</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    header: {
        color: 'white',
        backgroundColor: 'black',
        fontWeight: 'bold',
        fontSize: 30,
        padding: 5
    },
    subheader: {
        fontSize: 24,
        padding: 5
    },
    picker: {
        height: 200
    },
    toggleText: {
        height: 24,
        fontSize: 22
    },
    toggleSwitch: {
        height: 24
    },
    customServer: {
        padding: 5,
        paddingTop: 30,
        paddingBottom: 30
    },
    toggleView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    infoText: {
        fontSize: 16,
        padding: 5,
        paddingTop: 20
    },
    customServerInput: {
        paddingTop: 20,
        height: 40,
        fontSize: 24
    }
});

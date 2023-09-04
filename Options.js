import React, { Component } from 'react';
import {View, Text, Button, TextInput, Switch, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getVersion} from 'react-native-device-info';

import config from './config';
const {defaultServer} = config;

type Props = {};
export default class Options extends Component<Props> {
    constructor(props) {
        super(props);
        const customServer = !defaultServer.find((server) => server.url === props.baseURL);
        this.state = {unsavedServer: props.baseURL, customServer}
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
            <Text style={styles.header}>Options</Text>

            <Text style={styles.subheader}>Serverauswahl:</Text>
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
                    style={{height: 40}}
                    autoCapitalize = 'none'
                    placeholder="Server"
                    clearButtonMode="always"
                    value={unsavedServer}
                    onChangeText={(update) => this.setState({unsavedServer: update.toLowerCase()})}
                />)}
            </View>

            <Button flex title="Speichern" onPress={() => this.save({baseURL: unsavedServer})} />
            <Button flex title={"Zurück zu " + baseURL} onPress={() => onClose()} />
            <Text>Version: {getVersion()}</Text>
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
    }
});

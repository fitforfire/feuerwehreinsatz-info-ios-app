import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput, Picker} from 'react-native';

import config from './config';

type Props = {};
export default class Options extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {unsavedServer: props.baseURL}
    }
    save({baseURL}) {
        return AsyncStorage.setItem('FWEI.baseURL', baseURL);
        this.props.onClose();
    }
    render() {
       const {defaultServer} = config;
        const {onClose, baseURL} = this.props;
        const {unsavedServer} = this.state;
        return (<View>
            <Text>Optionen</Text>
            <Picker
                selectedValue={unsavedServer}
                onValueChange={(itemValue, itemIndex) => this.setState({unsavedServer: itemValue})}>
                {defaultServer.map((server) => <Picker.Item label={server.caption} value={server.url} />)}
            </Picker>

            <TextInput style={{height: 40}} placeholder="Server" value={baseURL} onChangeText={(update) => this.setState({unsavedServer: update})} />

            <Button flex title="Speichern" onPress={() => this.save({baseURL: unsavedServer})} />
            <Button flex title="Zurück zu Feuerwehreinsatz.info" onPress={() => onClose()} />
        </View>);
    }
}
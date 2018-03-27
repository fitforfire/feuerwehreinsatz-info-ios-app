import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';

type Props = {};
export default class Options extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {unsavedServer: props.baseURL}
    }
    save({baseURL}) {
        return AsyncStorage.setItem('FWEI.baseURL', baseURL);
    }
    render() {
        const {onClose, baseURL} = this.props;
        const {unsavedServer} = this.state;
        return (<View>
            <Text>Optionen</Text>
            <TextInput
            style={{height: 40}}
            placeholder="Server"
            value={baseURL}
            onChangeText={(update) => this.setState({unsavedServer: update})} />
            <Button flex title="speichern" onPress={() => this.save({baseURL: unsavedServer})} />
            <Button flex title="Zurück zu Feuerwehreinsatz.info" onPress={() => onClose()} />
        </View>);
    }
}
import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';

type Props = {};
export default class Options extends Component<Props> {
    constructor(props) {
        super(props);
    }
    render() {
        const {onClose, url, baseURL} = this.props;
        return (<View style={{flex: 1}}>
            <WebView
                source={{uri: url}}
                style={{flex: 1}}
            />
            <Button flex title={"Zurück zu " + baseURL} onPress={() => onClose()} />
        </View>);
    }
}
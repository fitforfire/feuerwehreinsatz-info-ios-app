import React, { Component } from 'react';
import {View, WebView, Button} from 'react-native';

const baseURL = 'https://feuerwehreinsatz.info';

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {popup: false};
    }
    onShouldStartLoadWithRequest(navState) {
        if (navState.url.indexOf(baseURL) === -1 && navState.url.indexOf("about:blank") === -1) {
            this.setState({popup: navState.url});
            return false;
        }
        return true;
    }
    render() {
        const {popup} = this.state;
        return (
            <View style={{flex: 1, marginTop: 20}}>

                <View style={{flex: 1}}><WebView
                    source={{uri: baseURL}}
                    onShouldStartLoadWithRequest={(navState) => this.onShouldStartLoadWithRequest(navState)}
                    style={{flex: 1}}
                />
                </View>
                {popup && <View style={{flex: 1000}}>
                    <WebView
                        source={{uri: popup || 'about:blank'}}
                        style={{flex: 1}}
                    /></View>}
                {popup && <Button flex title="Zurück zu Feuerwehreinsatz.info" onPress={() => this.setState({popup: false})} />}
            </View>
        );
    }
}
import React, { Component } from 'react';
import {View, Text, WebView, Button, AsyncStorage, TextInput} from 'react-native';
import FweiView from './FweiView';
import Options from './Options';
import Popup from './Popup';

import config from './config';

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {popup: false, options: false, baseURL: 'about:blank'};
    }
    componentDidMount() {
        AsyncStorage.getItem('FWEI.baseURL').then((loadedBaseURL) => {
            this.setState({
                baseURL: loadedBaseURL || config.defaultBaseURL
            });
        }).catch(() => {
            this.setState({
                baseURL: defaultBaseURL
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
                    <Options baseURL={baseURL} onClose={() => this.setState({options: false})}></Options>
                </View>
                }
            </View>
        );
    }
}
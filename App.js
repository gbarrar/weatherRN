import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, StatusBar, Image } from 'react-native';
import { Location, Permissions, Accelerometer } from 'expo';
import WeatherService from './weather'


export default class App extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            location: null,
            weather: null,
            accelerometerData: {}
        }
        this._subscription = null;
    }

    componentWillMount() {
        this.getLocation();
        Accelerometer.setUpdateInterval(1000);
        this._subscription = Accelerometer.addListener(accelerometerData => {
            this.setState({accelerometerData});
        });
    }

    componentWillUnmount(){
        if(this._subscription !== null){
            this._subscription.remove();
            this._subscription = null;
        }
    }

    showUmbrella(){
        if (this.state.weather && this.state.weather.isRaining){
            if (this.state.accelerometerData && this.state.accelerometerData.z < 0){
                return true;
            }
        }
        return false;
    }

    async getLocation() {
        let permission = await Permissions.askAsync(Permissions.LOCATION);
        if (permission.status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});

            WeatherService.getWeather(location.coords.latitude, location.coords.longitude).then((weather) => {
                this.setState({
                    location: {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    },
                    weather: WeatherService.format(weather)
                });
            });
        }
    }

    renderLocation(location){
        if (!location){
            return (
                <View style={styles.container}>
                    <ActivityIndicator />
                    <Text>Obteniendo tu ubicación...</Text>
                </View>
            );
        }else{
            return (
                <View style={styles.container}>
                    <Text>{'Latitud: ' + this.state.location.lat + ', Longitud: ' + this.state.location.lng}</Text>
                </View>
            );
        }
    }

    renderWeather(){
        if(this.state.weather){
            return(
              <View>
                  <Image source={{uri: this.state.weather.iconUrl}} style={styles.weatherIcon}/>
                  <Text style={styles.weatherDescription}>{this.state.weather.description}</Text>
              </View>
            );
        }
    }

    renderUmbrella(){
        return (
          <View style={styles.umbrellaWrapper}>
              <Image style={style.umbrella} source={require('./umbrella.png')}/>
          </View>
        );
    }

    render() {

        const showUmbrella = this.showUmbrella();

        return (
            <View style={styles.container}>
                <StatusBar hidden={true}/>
                {this.renderLocation(this.state.location)}
                {showUmbrella ? null: this.renderWeather()}
                {showUmbrella ? this.renderUmbrella(): null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
      flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start'
  },
    weatherBanner:{
      flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ececec',
        padding: 10
    },
    weather: {
      flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ADD8E6'
    },
    weatherIcon: {
      width: 200,
        height: 200
    },
    weatherDescription: {
      fontWeight: 'bold',
        fontSize: 20
    },
    umbrellaWrapper: {
      flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00008B'
    },
    umbrella: {
      width: 200,
        height: 200
    }
});

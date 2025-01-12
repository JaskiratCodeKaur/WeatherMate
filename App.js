import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground, ScrollView, FlatList } from 'react-native';
import axios from 'axios';
/**
 * StAuth10244: I Jaskirat Kaur, 000904397 certify that this material is my original work. No other 
 * person's work has been used without due acknowledgement. I have not made my work available to anyone 
 * else.
 * 
 * Date: November 10th, 2024
 * 
 * By using VisualCrossing API, this weather app allows users to search for the current weather and 
 * 7-day forecast for any city. It fetches real-time weather data using the Visual Crossing API, 
 * displaying key details like temperature, humidity, pressure, and weather conditions. Additionally, it 
 * adjusts the background between day and night visuals based on the local sunrise and sunset times for 
 * the searched city.Users can see a short or full view of the weekly forecast and toggle between them.
 *  
 */

// Main App Component
export default function App() {
  // The State variables for storing city input, current weather, forecast, error messages, and UI  display settings.
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [isDay, setIsDay] = useState(true);
  const [sunriseTime, setSunriseTime] = useState('');
  const [sunsetTime, setSunsetTime] = useState('');
  const [showFullForecast, setShowFullForecast] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);


  /**
   * To feetch weather data from the Visual Crossing API based on the city input and updating state with
   * current weather, forecast, and sunrise/sunset times.
   */
  const fetchWeather = async () => {
    if (!city){
      setError('Please enter the city name.')
      return;
    } 
    try {
      setError('');
      const API_KEY = ''; // Replace with your Visual Crossing API key
      const weatherRes = await axios.get(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${API_KEY}&contentType=json`
      );

      const currentWeather = weatherRes.data.currentConditions;
        setWeather(currentWeather);
        setForecast(weatherRes.data.days.slice(1, 8)); // Get next 7 days forecast

        // Parse and format the sunrise and sunset times
        const sunrise = parseTime(currentWeather.sunrise);
        const sunset = parseTime(currentWeather.sunset);

        setSunriseTime(formatTime(sunrise)); // Format the sunrise time
        setSunsetTime(formatTime(sunset));   // Format the sunset time

        // Determine if it is currently day or night in the city
        const localTime = new Date(weatherRes.data.currentConditions.datetimeEpoch * 1000);
        // Convert local time into the city timezone (optional improvement)
        const isDay = localTime >= sunrise && localTime < sunset;
        setIsDay(isDay);
        setIsDataFetched(true);

    } catch (err) {
      setError('City not found');
      setWeather(null);
      setForecast(null);
      setIsDataFetched(false); // Reset if there is an error
    }
  };

  /**
   * To clears all data related to weather and forecast.
   */
  const clearData = () => {
    setWeather(null);
    setForecast(null);
    setError('');
    setCity('');
    setIsDataFetched(false); // Reset on clear
  };


   /**
   * To convert time from a "HH:MM:SS" string into a Date object adjusted to the specified timezone.
   * @param {string} time - Time string in "HH:MM:SS" format.
   * @param {string} timezone - Timezone to adjust the time to.
   * @returns {Date} - Date object with the adjusted time.
   * 
   */
  const parseTime = (time) => {
  const [hours, minutes, seconds] = time.split(':').map((num) => parseInt(num, 10));
  const now = new Date();
  now.setHours(hours);
  now.setMinutes(minutes);
  now.setSeconds(seconds);
  now.setMilliseconds(0); // Reset milliseconds to avoid discrepancies

  return now;
};


  /**
   * To format the Date object to a "HH:MM" string.
   * @param {Date} date - Date object.
   * @returns {string} - Formatted time string.
   */
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  // Icon mapping for various weather conditions.
  const weatherIcons = {
    'snow': require('./assets/images/snowy.png'),
    'rain': require('./assets/images/rain.png'),
    'fog': require('./assets/images/fog.png'),
    'wind': require('./assets/images/windy-day.png'),
    'cloudy': require('./assets/images/cloudy_1.png'),
    'partly-cloudy-day': require('./assets/images/cloudy-day.png'),
    'partly-cloudy-night': require('./assets/images/cloudy-night.png'),
    'clear-day': require('./assets/images/clear-day.webp'),
    'clear-night': require('./assets/images/clear-night.png'),
    'snow-showers-day': require('./assets/images/cloudDay.png'),
    'snow-showers-night': require('./assets/images/cloudsnow.png'),
    'thunder-rain': require('./assets/images/thunder.png'),
    'thunder-showers-day': require('./assets/images/thunderShower.webp'),
    'thunder-showers-night': require('./assets/images/thunderShower.webp'),
    'showers-day': require('./assets/images/showerDay.png'),
    'showers-night': require('./assets/images/showerDay.png')
  };


  /**
   * To determine the background image to display based on whether it's day or night.
   * @returns {object} - Image source for background.
   */
  const getBackgroundImage = () => {
    if (!isDataFetched) {
      return require('./assets/images/homePage.jpg');
    }else{
      return isDay ? require('./assets/images/day.jpg') : require('./assets/images/night.jpg');
    }
  };

  return (
    <ImageBackground source={getBackgroundImage()} style={styles.background}>
      <SafeAreaView style={styles.overlay}>
        <ScrollView>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Weather App</Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Enter city name"
              style={styles.searchInput}
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (text === '') clearData(); // Clear all data if input is empty
              }}
              onSubmitEditing={fetchWeather}
            />
            <TouchableOpacity style={styles.searchButton} onPress={fetchWeather}>
              <Image source={require('./assets/images/search_icon.png')} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {weather && (
            <View style={styles.currentWeatherContainer}>
              <Text style={styles.cityText}>{city}</Text>
              <Image source={weatherIcons[weather.icon]} style={styles.weatherIcon} />
              <Text style={styles.tempText}>{Math.round(weather.temp)}°C</Text>
              <Text style={styles.weatherDescription}>{weather.conditions}</Text>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoCard}>
                    <Image source={require('./assets/images/humidity.png')} style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Humidity</Text>
                    <Text style={styles.infoText}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Image source={require('./assets/images/pressure.png')} style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Pressure</Text>
                    <Text style={styles.infoText}>{weather.pressure} mb</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Image source={require('./assets/images/tempperature.png')} style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Temperature</Text>
                    <Text style={styles.infoText}>{Math.round(weather.temp)}°C</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Image source={require('./assets/images/sun.png')} style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Sunrise</Text>
                    <Text style={styles.infoText}>{sunriseTime}</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Image source={require('./assets/images/sunsets.png')} style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Sunset</Text>
                    <Text style={styles.infoText}>{sunsetTime}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {forecast && (
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>7-Day Forecast</Text>
              <FlatList
                data={showFullForecast ? forecast : forecast.slice(0, 3)}
                numColumns={3}
                keyExtractor={(item) => item.datetime}
                renderItem={({ item }) => {
                  const forecastIcon = weatherIcons[item.icon] || require('./assets/images/default.png');
                  const formattedDate = new Date(item.datetime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <View style={styles.forecastCard}>
                      <Text style={styles.forecastText}>{formattedDate}</Text>
                      <Image source={forecastIcon} style={styles.forecastIcon} />
                      <Text style={styles.forecastTemp}>{Math.round(item.temp)}°C</Text>
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                style={[styles.seeMoreButton, { backgroundColor: 'transparent' }]}
                onPress={() => setShowFullForecast(!showFullForecast)}
              >
                <Text style={styles.seeMoreText}>
                  {showFullForecast ? 'Show Less' : 'Show Full 7-Day Forecast'}
                </Text>
                <Image
                  source={require('./assets/images/arrow.png')}
                  style={[styles.arrowIcon, { transform: showFullForecast ? [{ rotate: '180deg' }] : [] }]}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Styles for the app components
const styles = StyleSheet.create({

  titleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    width: '90%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center', 
    marginVertical: 5,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  
  searchContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'center',  
    alignItems: 'center',   
 
  },
  searchInput: {
  width: '80%', 
  padding: 10,
  marginLeft: 10,
  backgroundColor: 'white',
  borderRadius: 8,
}
,
  searchButton: {
    marginLeft: 10,
    padding: 10,
  },
  searchIcon: {
    width: 30,
    height: 30,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  currentWeatherContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityText: {
    fontSize: 30,
    color: 'white',
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },
  tempText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherDescription: {
    fontSize: 16,
    color: 'white',
  },
  infoContainer: {
    marginTop: 20,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
 infoCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    width: '32%',
    minWidth: 100,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  infoIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: 'white',
  },
  infoText: {
    fontSize: 14,
    color: 'white',
  },
  forecastContainer: {
    marginTop: 30,
    marginLeft: 10,
  },
  forecastTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  forecastCard: {
    marginRight: 15,
    marginBottom: 15,
    backgroundColor: '#ffffff80',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  forecastText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginVertical: 10,
  },
  forecastTemp: {
    fontSize: 18,
  },
  seeMoreButton: {
  marginTop: 20,
  backgroundColor: '#add8e6', 
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

seeMoreText: {
  fontSize: 16,
  color: 'white',
  textAlign: 'center',
},

arrowIcon: {
  width: 20,
  height: 20,
  marginLeft: 10,
},
});
